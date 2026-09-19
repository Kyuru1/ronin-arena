import { useEffect, useRef } from "react";
import type { Weapon } from "../game/engine";
import { renderWeaponPreview } from "../game/weaponArt";

/**
 * Shows the weapon exactly as the engine draws it in the player's hand
 * (same pixel routine), upscaled with nearest-neighbour.
 */
export default function WeaponPreview({
  weapon,
  scale = 3,
  angle = -35,
  className = "",
  form = 0,
}: {
  weapon: Weapon;
  scale?: number;
  angle?: number;
  className?: string;
  form?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const src = renderWeaponPreview(weapon, scale, angle, form);
    c.width = src.width;
    c.height = src.height;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(src, 0, 0);
    c.style.width = `${src.width}px`;
    c.style.height = `${src.height}px`;
  }, [weapon, scale, angle, form]);

  return <canvas ref={ref} className={`pixelated ${className}`} aria-hidden />;
}
