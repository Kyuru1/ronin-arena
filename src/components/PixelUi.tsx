import type { ReactNode, ButtonHTMLAttributes } from "react";
import PixelSprite from "./PixelSprite";

/** Hand-drawn 9-slice panel used by every popup. */
export function PxFrame({
  children,
  className = "",
  title,
  icon,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: string;
}) {
  return (
    <div className={`px-frame px-scan ${className}`}>
      {title && (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[60%]">
          <div className="px-ribbon font-pixel flex items-center gap-2 whitespace-nowrap text-[9px] sm:text-[11px]">
            {icon && <PixelSprite name={icon} scale={1} />}
            {title}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

type Tone = "red" | "gold" | "dark" | "green" | "menu";

export function PxButton({
  tone = "dark",
  active,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  active?: boolean;
  children: ReactNode;
}) {
  const toneCls =
    tone === "menu"
      ? "pxb-menu"
      : tone === "red"
        ? "pxb-red"
        : tone === "gold"
          ? "pxb-gold"
          : tone === "green"
            ? "pxb-green"
            : "pxb-dark";
  return (
    <button
      {...rest}
      className={`pxb font-pixel ${toneCls} ${active ? "is-active" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function PxChip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`pxchip font-pixel text-[7px] sm:text-[8px] ${on ? "is-on" : ""}`}>
      {children}
    </button>
  );
}

export function PxRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-inset flex items-center justify-between gap-3 px-3 py-2">
      <span className="font-pixel text-[8px] text-[#ffe2c4] sm:text-[9px]">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

export function PxHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-2 flex items-center gap-2 ${className}`}>
      <span className="h-[3px] w-3 bg-[#8c2a35]" />
      <span className="font-pixel text-[8px] uppercase text-[#ffd44a] sm:text-[9px]">{children}</span>
      <span className="px-divider grow" />
    </div>
  );
}

export function CoinBox({ coins, label }: { coins: number; label?: string }) {
  return (
    <div className="px-coinbox">
      <PixelSprite name="coin" scale={2} />
      <div className="font-pixel leading-none">
        {label && <div className="mb-1 text-[6px] text-[#b8862a]">{label}</div>}
        <div className="text-[12px] text-[#ffd44a] sm:text-[14px]">{coins}</div>
      </div>
    </div>
  );
}
