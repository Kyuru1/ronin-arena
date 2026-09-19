import { useEffect, useRef } from "react";
import { SPR, ensureSprites } from "../game/sprites";

export default function PixelSprite({
  name,
  scale = 4,
  className = "",
  style,
}: {
  name: string;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    ensureSprites();
    const spr = SPR[name];
    const c = ref.current;
    if (!spr || !c) return;
    c.width = spr.w;
    c.height = spr.h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(spr.canvas, 0, 0);
    c.style.width = `${spr.w * scale}px`;
    c.style.height = `${spr.h * scale}px`;
  }, [name, scale]);

  return <canvas ref={ref} className={`pixelated ${className}`} style={style} aria-hidden />;
}
