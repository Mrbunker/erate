import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  COMMON_CURRENCIES,
  OTHER_CURRENCIES,
  type CurrencyMeta,
} from "@/lib/currencies";
import { formatAmount, parseAmount, sanitizeAmountInput } from "@/lib/format";
import { uid } from "@/lib/utils";
import type { RatesStatus } from "@/hooks/useRates";

export interface Row {
  id: string;
  code: string;
  amount: string;
}

export interface CalculatorState {
  rows: Row[];
  baseId: string;
}

const STORAGE_KEY = "cc:state:v1";

function rateOf(rates: Record<string, number>, code: string): number {
  const r = rates[code];
  return typeof r === "number" && r > 0 ? r : 1;
}

// 以 baseId 行为基准，通过 USD 交叉汇率换算其他行
function recompute(state: CalculatorState, rates: Record<string, number>): CalculatorState {
  const base = state.rows.find((r) => r.id === state.baseId) ?? state.rows[0];
  if (!base) return state;
  const baseNum = parseAmount(base.amount);
  const baseRate = rateOf(rates, base.code);
  const rows = state.rows.map((r) => {
    if (r.id === base.id) return r; // 基准行保留用户原始输入
    if (baseNum == null) return { ...r, amount: "" };
    const usd = baseNum / baseRate;
    return { ...r, amount: formatAmount(usd * rateOf(rates, r.code)) };
  });
  return { ...state, rows };
}

function makeDefault(): CalculatorState {
  const usdId = uid();
  return {
    rows: [
      { id: usdId, code: "USD", amount: "100" },
      { id: uid(), code: "EUR", amount: "" },
      { id: uid(), code: "CNY", amount: "" },
      { id: uid(), code: "JPY", amount: "" },
    ],
    baseId: usdId,
  };
}

function loadState(): CalculatorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefault();
    const parsed = JSON.parse(raw) as CalculatorState;
    if (
      !parsed ||
      !Array.isArray(parsed.rows) ||
      parsed.rows.length === 0 ||
      typeof parsed.baseId !== "string"
    ) {
      return makeDefault();
    }
    // 校验：code 必须存在；baseId 必须命中某行
    const validRows = parsed.rows
      .filter((r) => r && typeof r.id === "string" && typeof r.code === "string")
      .filter((r) => CURRENCIES.some((c) => c.code === r.code))
      .map((r) => ({ id: r.id, code: r.code, amount: typeof r.amount === "string" ? r.amount : "" }));
    if (validRows.length === 0) return makeDefault();
    const baseId = validRows.some((r) => r.id === parsed.baseId)
      ? parsed.baseId
      : validRows[0].id;
    return { rows: validRows, baseId };
  } catch {
    return makeDefault();
  }
}

function saveState(state: CalculatorState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 忽略写入失败（隐私模式等） */
  }
}

export interface UseCalculatorArgs {
  rates: Record<string, number>;
  status: RatesStatus;
}

export interface AvailableCurrency {
  meta: CurrencyMeta;
}

export function useCalculator({ rates, status }: UseCalculatorArgs) {
  const [state, setState] = useState<CalculatorState>(() => loadState());

  // 持久化
  useEffect(() => {
    saveState(state);
  }, [state]);

  // 汇率就绪 / 变更时，以当前基准行重算其他行
  useEffect(() => {
    if (status !== "ready") return;
    setState((prev) => recompute(prev, rates));
  }, [rates, status]);

  const setRowAmount = useCallback(
    (id: string, raw: string) => {
      setState((prev) => {
        const sanitized = sanitizeAmountInput(raw);
        const next: CalculatorState = {
          ...prev,
          baseId: id,
          rows: prev.rows.map((r) => (r.id === id ? { ...r, amount: sanitized } : r)),
        };
        return recompute(next, rates);
      });
    },
    [rates],
  );

  const setRowCurrency = useCallback(
    (id: string, code: string) => {
      setState((prev) => {
        // 该货币已被其他行使用则忽略
        if (prev.rows.some((r) => r.id !== id && r.code === code)) return prev;
        const next: CalculatorState = {
          ...prev,
          baseId: id,
          rows: prev.rows.map((r) => (r.id === id ? { ...r, code } : r)),
        };
        return recompute(next, rates);
      });
    },
    [rates],
  );

  const removeRow = useCallback((id: string) => {
    setState((prev) => {
      if (prev.rows.length <= 1) return prev;
      const rows = prev.rows.filter((r) => r.id !== id);
      const baseId = prev.baseId === id ? rows[0].id : prev.baseId;
      return { rows, baseId };
    });
  }, []);

  const reorderRows = useCallback((from: number, to: number) => {
    setState((prev) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= prev.rows.length ||
        to >= prev.rows.length
      ) {
        return prev;
      }
      const rows = [...prev.rows];
      const [moved] = rows.splice(from, 1);
      rows.splice(to, 0, moved);
      return { ...prev, rows };
    });
  }, []);

  const usedCodes = useMemo(
    () => new Set(state.rows.map((r) => r.code)),
    [state.rows],
  );

  const availableCurrencies = useMemo<AvailableCurrency[]>(
    () =>
      CURRENCIES.filter((c) => !usedCodes.has(c.code)).map((meta) => ({ meta })),
    [usedCodes],
  );

  const addRow = useCallback(() => {
    setState((prev) => {
      const used = new Set(prev.rows.map((r) => r.code));
      const candidate =
        COMMON_CURRENCIES.find((c) => !used.has(c.code)) ??
        OTHER_CURRENCIES.find((c) => !used.has(c.code));
      if (!candidate) return prev;
      // 以当前基准行换算新行金额
      const base = prev.rows.find((r) => r.id === prev.baseId) ?? prev.rows[0];
      let amount = "";
      if (base) {
        const bn = parseAmount(base.amount);
        if (bn != null) {
          const usd = bn / rateOf(rates, base.code);
          amount = formatAmount(usd * rateOf(rates, candidate.code));
        }
      }
      const newRow: Row = { id: uid(), code: candidate.code, amount };
      return { ...prev, rows: [...prev.rows, newRow] };
    });
  }, [rates]);

  return {
    rows: state.rows,
    baseId: state.baseId,
    usedCodes,
    availableCurrencies,
    canAddRow: availableCurrencies.length > 0,
    setRowAmount,
    setRowCurrency,
    removeRow,
    reorderRows,
    addRow,
  };
}
