import { useEffect, useRef, useState } from "react";

/** Keep long panels reachable with explicit page buttons on small screens. */
export default function MobilePanelNavigation() {
  const ref = useRef<HTMLElement>(null);
  const [pages, setPages] = useState({ previous: false, next: false });
  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-device]");
    if (!root) return;
    let pending = 0;
    const update = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const panels = getPanels(root);
        const previous = panels.some((panel) => panel.scrollTop > 1);
        const next = panels.some((panel) => panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2);
        setPages((old) => old.previous === previous && old.next === next ? old : { previous, next });
      });
    };
    const observer = new MutationObserver(update);
    observer.observe(root, { childList: true, subtree: true, attributes: true });
    const resize = new ResizeObserver(update); resize.observe(root);
    root.addEventListener("scroll", update, true);
    update();
    return () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(pending); root.removeEventListener("scroll", update, true); };
  }, []);
  const turn = (direction: number) => {
    const root = ref.current?.closest<HTMLElement>("[data-device]");
    if (!root) return;
    const panel = getPanels(root).reverse().find((item) => direction < 0 ? item.scrollTop > 1 : item.scrollTop + item.clientHeight < item.scrollHeight - 2);
    panel?.scrollBy({ top: direction * Math.max(60, panel.clientHeight - 48), behavior: "smooth" });
  };
  return <nav ref={ref} className="mobile-panel-navigation" style={{ visibility: pages.previous || pages.next ? "visible" : "hidden" }}>
    <button disabled={!pages.previous} onClick={() => turn(-1)} aria-label="Previous page">◀</button>
    <span>▲ / ▼</span>
    <button disabled={!pages.next} onClick={() => turn(1)} aria-label="Next page">▶</button>
  </nav>;
}

function getPanels(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(".px-frame, .px-frame *, .px-backdrop, .menu-arena")).filter((element) => {
    const style = getComputedStyle(element);
    return element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 2 && /auto|scroll/.test(style.overflowY);
  });
}
