"use client";

import { useEffect } from "react";
import { useCurrencyStore, useRatesStore } from "./store";
import { formatPriceFromKrw, convertFromKrw } from "./utils";

export function useCurrency() {
  const { currency, hydrated, hydrate, setCurrency } = useCurrencyStore();
  const { rates, loading, setRates, setLoading } = useRatesStore();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (rates || loading) return;
    setLoading(true);
    fetch("/api/exchange-rate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.usdKrw && d?.uzsKrw) {
          setRates({
            krwUsd: d.krwUsd,
            krwUzs: d.krwUzs,
            usdKrw: d.usdKrw,
            uzsKrw: d.uzsKrw,
            usdUzs: d.usdUzs,
            updatedAt: d.updatedAt,
          });
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [rates, loading, setRates, setLoading]);

  const format = (priceKrw: number) => formatPriceFromKrw(priceKrw, currency, rates);
  const convert = (priceKrw: number) => convertFromKrw(priceKrw, currency, rates);

  return { currency, setCurrency, rates, format, convert, hydrated };
}
