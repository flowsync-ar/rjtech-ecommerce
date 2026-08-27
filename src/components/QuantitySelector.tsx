"use client";

type Props = {
  value: number;
  onDec: () => void;
  onInc: () => void;
  size?: "sm" | "md";
};

export function QuantitySelector({ value, onDec, onInc, size = "md" }: Props) {
  const btn =
    size === "sm"
      ? "h-[34px] w-8 text-[15px]"
      : "h-10 w-[38px] text-base";
  const num = size === "sm" ? "w-7 text-[13.5px]" : "w-9 text-sm";

  return (
    <div className="inline-flex w-fit items-center rounded-[9px] border border-border">
      <button
        type="button"
        onClick={onDec}
        className={`${btn} cursor-pointer border-none bg-transparent`}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <div className={`${num} text-center font-semibold`}>{value}</div>
      <button
        type="button"
        onClick={onInc}
        className={`${btn} cursor-pointer border-none bg-transparent`}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
