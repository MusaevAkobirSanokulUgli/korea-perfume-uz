"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Coins } from "lucide-react";
import { useCurrency } from "@/lib/useCurrency";
import type { Currency } from "@/lib/store";

const OPTIONS: { value: Currency; label: string; flag: string; sub: string }[] = [
  { value: "USD", label: "USD", flag: "$", sub: "AQSH dollari" },
  { value: "KRW", label: "KRW", flag: "₩", sub: "Koreya voni" },
  { value: "UZS", label: "UZS", flag: "so'm", sub: "O'zbek so'mi" },
];

export default function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency, rates } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = OPTIONS.find((o) => o.value === currency) || OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border border-border bg-white hover:bg-surface transition ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
        aria-label="Valyutani tanlash"
      >
        <Coins size={compact ? 14 : 16} className="text-accent" />
        <span className="font-semibold">{current.label}</span>
        <span className="text-muted">{current.flag}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-lg z-[60] overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface/50">
            <p className="text-xs font-semibold text-muted uppercase">Valyuta</p>
            <p className="text-[11px] text-muted-light mt-0.5">
              Asosiy narx KRW, kurs orqali konvertatsiya
            </p>
          </div>
          {OPTIONS.map((opt) => {
            const active = opt.value === currency;
            return (
              <button
                key={opt.value}
                onClick={() => { setCurrency(opt.value); setOpen(false); }}
                className={`w-full px-4 py-3 flex items-center gap-3 transition text-left ${
                  active ? "bg-accent/5" : "hover:bg-surface"
                }`}
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  active ? "bg-accent text-white" : "bg-surface text-muted"
                }`}>{opt.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.sub}</p>
                </div>
                {active && <Check size={16} className="text-accent" />}
              </button>
            );
          })}
          {rates && (
            <div className="px-4 py-2.5 border-t border-border bg-surface/40 space-y-0.5">
              <p className="text-[11px] text-muted flex items-center justify-between">
                <span>1 USD</span>
                <span className="font-medium text-foreground">{Math.round(rates.usdKrw).toLocaleString()} KRW</span>
              </p>
              <p className="text-[11px] text-muted flex items-center justify-between">
                <span>1 KRW</span>
                <span className="font-medium text-foreground">{rates.uzsKrw.toFixed(2)} so&apos;m</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
