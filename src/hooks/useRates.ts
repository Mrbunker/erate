import { useEffect, useState } from "react";

// open.er-api.com：免费、无需 key、支持 CORS。返回 rates 为各货币对 1 USD 的汇率。
const ENDPOINT = "https://open.er-api.com/v6/latest/USD";

export interface ErApiResponse {
  result: "success" | "error";
  rates?: Record<string, number>;
  time_last_update_utc?: string;
  error_type?: string;
}

export type RatesStatus = "loading" | "ready" | "error";

export interface UseRatesResult {
  rates: Record<string, number>;
  status: RatesStatus;
  updatedAt: string | null;
  /** 获取某货币对 USD 的汇率；缺失时回退 1，避免 NaN */
  getRate: (code: string) => number;
}

export function useRates(): UseRatesResult {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [status, setStatus] = useState<RatesStatus>("loading");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(ENDPOINT, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ErApiResponse = await res.json();
        if (controller.signal.aborted) return;
        if (data.result !== "success" || !data.rates) {
          throw new Error(data.error_type || "bad response");
        }
        setRates(data.rates);
        setUpdatedAt(data.time_last_update_utc ?? null);
        setStatus("ready");
      } catch (err) {
        // AbortError 是 StrictMode 卸载造成的，忽略；其余才算真正失败
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, []);

  const getRate = (code: string): number => {
    const r = rates[code];
    return typeof r === "number" && r > 0 ? r : 1;
  };

  return { rates, status, updatedAt, getRate };
}
