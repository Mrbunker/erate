import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  COMMON_CURRENCIES,
  OTHER_CURRENCIES,
  getCurrency,
} from "@/lib/currencies";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  value: string;
  /** 已被其他行使用的货币代码集合（本行的 value 不应算作禁用） */
  usedCodes: Set<string>;
  onChange: (code: string) => void;
}

export default function CurrencySelect({
  value,
  usedCodes,
  onChange,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const current = getCurrency(value);

  // 当前行的货币本身可选（不禁用）；其他行已用的货币禁用
  const disabled = useMemo(() => {
    const set = new Set(usedCodes);
    set.delete(value);
    return set;
  }, [usedCodes, value]);

  // 搜索过滤
  const q = query.trim().toLowerCase();
  const filterFn = (code: string, name: string) => {
    if (!q) return true;
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  };
  const commonList = COMMON_CURRENCIES.filter((c) => filterFn(c.code, c.name));
  const otherList = OTHER_CURRENCIES.filter((c) => filterFn(c.code, c.name));

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 打开时聚焦搜索框并重置
  useEffect(() => {
    if (open) {
      setQuery("");
      // 下一帧聚焦，确保已挂载
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const pick = (code: string) => {
    if (disabled.has(code)) return;
    onChange(code);
    setOpen(false);
  };

  const renderRow = (code: string) => {
    const meta = getCurrency(code)!;
    const isDisabled = disabled.has(code);
    const isActive = code === value;
    return (
      <button
        key={code}
        type="button"
        disabled={isDisabled}
        onClick={() => pick(code)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm leading-none transition-colors",
          isDisabled
            ? "cursor-not-allowed text-ink-faint/50"
            : "text-ink hover:bg-accent-soft",
          isActive && !isDisabled && "bg-accent-soft",
        )}
      >
        <span className="w-5 shrink-0 text-center text-base leading-none">
          {meta.flag}
        </span>
        <span className="w-12 shrink-0 font-mono text-xs font-semibold leading-none">
          {meta.code}
        </span>
        <span className="min-w-0 flex-1 truncate font-sans text-xs leading-none text-ink-soft">
          {meta.name}
        </span>
        <span className="w-8 shrink-0 text-right font-mono text-xs leading-none text-ink-faint">
          {meta.symbol}
        </span>
        {isActive && (
          <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
        )}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* 触发器：三级响应式宽度 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex h-11 items-center justify-center gap-1.5 rounded-md border border-line bg-card px-2 leading-none transition-colors",
          "w-20 sm:w-36 md:w-44",
          open ? "border-accent ring-2 ring-accent/15" : "hover:border-accent/40",
        )}
      >
        {/* 国旗：≥640 显示 */}
        <span className="hidden text-base leading-none sm:inline">
          {current?.flag ?? "🌐"}
        </span>
        {/* 代码：始终显示 */}
        <span className="font-mono text-sm font-semibold leading-none text-ink">
          {value}
        </span>
        {/* 符号：≥640 显示 */}
        <span className="hidden font-mono text-xs leading-none text-ink-faint sm:inline">
          {current?.symbol}
        </span>
        {/* 中文名：≥768 显示 */}
        <span className="hidden min-w-0 truncate font-sans text-xs leading-none text-ink-soft md:inline">
          {current?.name}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2.5}
        />
      </button>

      {/* 下拉面板 */}
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 z-30 mt-1.5 w-72 overflow-hidden rounded-md border border-line bg-card"
        >
          {/* 搜索框 */}
          <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={2.5} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索货币 / 代码"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div className="scroll-thin max-h-72 overflow-y-auto py-1">
            {commonList.length === 0 && otherList.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-ink-faint">
                未找到匹配的货币
              </div>
            )}

            {commonList.length > 0 && (
              <div className="py-1">
                <div className="px-3 pb-1 pt-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  常用
                </div>
                {commonList.map((c) => renderRow(c.code))}
              </div>
            )}

            {commonList.length > 0 && otherList.length > 0 && (
              <div className="mx-3 my-1 border-t border-line" />
            )}

            {otherList.length > 0 && (
              <div className="py-1">
                <div className="px-3 pb-1 pt-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  其他
                </div>
                {otherList.map((c) => renderRow(c.code))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
