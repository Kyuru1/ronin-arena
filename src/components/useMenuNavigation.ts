import { useEffect } from "react";

export function useMenuNavigation(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const getButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    const focusFirst = () => {
      if (document.activeElement?.tagName === "BUTTON") return;
      getButtons()[0]?.focus();
    };
    const moveFocus = (direction: 1 | -1) => {
      const buttons = getButtons();
      if (!buttons.length) return;
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      buttons[(current + direction + buttons.length) % buttons.length]?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === "INPUT" && event.key !== "Escape") return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); moveFocus(1); }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); moveFocus(-1); }
      if (event.key === "Escape") {
        const back = getButtons().find((button) => /VOLTAR|MENU/.test(button.textContent ?? ""));
        if (back) { event.preventDefault(); back.click(); }
        else (document.activeElement as HTMLElement)?.blur();
      }
    };
    let previousButtons: boolean[] = [];
    let frame = 0;
    const pollGamepad = () => {
      const pad = navigator.getGamepads?.()[0];
      if (pad) {
        const pressed = (index: number) => Boolean(pad.buttons[index]?.pressed);
        const justPressed = (index: number) => pressed(index) && !previousButtons[index];
        if (justPressed(12) || justPressed(14)) moveFocus(-1);
        if (justPressed(13) || justPressed(15)) moveFocus(1);
        if (justPressed(0)) (document.activeElement as HTMLButtonElement)?.click();
        if (justPressed(1)) (document.activeElement as HTMLElement)?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        previousButtons = pad.buttons.map((button) => button.pressed);
      } else previousButtons = [];
      frame = requestAnimationFrame(pollGamepad);
    };
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(focusFirst, 0);
    frame = requestAnimationFrame(pollGamepad);
    return () => {
      window.clearTimeout(focusTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);
}
