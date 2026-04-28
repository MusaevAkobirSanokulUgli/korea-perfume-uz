"use client";

import { Coins, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";

interface Props {
  variant?: "default" | "hero" | "compact";
}

export default function AdminRateBadge({ variant = "default" }: Props) {
  const { user } = useAuthStore();
  const { rates } = useCurrency();

  if (!user || user.role !== "ADMIN" || !rates) return null;

  const usdKrw = Math.round(rates.usdKrw);
  const usdUzs = Math.round(rates.usdUzs);
  const krwUzs = rates.uzsKrw.toFixed(2);

  if (variant === "hero") {
    return (
      <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-5 py-3.5 inline-flex flex-col gap-2 max-w-full">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-light">
          <ShieldCheck size={14} />
          Admin — jonli kurs
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
          <span className="flex items-center gap-1.5">
            <Coins size={14} className="text-gold-light shrink-0" />
            1 USD = <strong className="text-gold-light">{usdKrw.toLocaleString()}</strong> KRW
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span>
            1 USD = <strong className="text-gold-light">{usdUzs.toLocaleString()}</strong> so&apos;m
          </span>
        </div>
        <div className="text-[11px] text-white/60">
          1 KRW ≈ {krwUzs} so&apos;m · USD/KRW ↔ KRW/UZS yonma-yon
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] px-2 py-1 bg-accent/10 border border-accent/20 rounded-md">
        <ShieldCheck size={11} className="text-accent shrink-0" />
        <span className="font-semibold text-accent">Admin:</span>
        <span>1$ = {usdKrw.toLocaleString()}₩</span>
        <span className="text-muted-light">·</span>
        <span>1$ = {usdUzs.toLocaleString()} so&apos;m</span>
      </span>
    );
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs px-3.5 py-2 bg-accent/8 border border-accent/25 rounded-lg">
      <span className="flex items-center gap-1.5 font-semibold text-accent">
        <ShieldCheck size={13} />
        Admin kurs
      </span>
      <span className="text-muted-light">|</span>
      <span>
        1 USD = <strong className="text-foreground">{usdKrw.toLocaleString()}</strong> KRW
      </span>
      <span className="text-muted-light">|</span>
      <span>
        1 USD = <strong className="text-foreground">{usdUzs.toLocaleString()}</strong> so&apos;m
      </span>
      <span className="text-muted-light hidden sm:inline">|</span>
      <span className="text-muted hidden sm:inline">1 KRW ≈ {krwUzs} so&apos;m</span>
    </div>
  );
}
