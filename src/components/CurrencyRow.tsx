import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import type { Row } from "@/hooks/useCalculator";
import CurrencySelect from "@/components/CurrencySelect";
import { cn } from "@/lib/utils";

interface CurrencyRowProps {
  row: Row;
  index: number;
  isBase: boolean;
  usedCodes: Set<string>;
  canDelete: boolean;
  onAmountChange: (id: string, raw: string) => void;
  onCurrencyChange: (id: string, code: string) => void;
  onRemove: (id: string) => void;
  isDragSource: boolean;
  isDragOver: boolean;
  onDragStartRow: (index: number) => void;
  onDragOverRow: (index: number) => void;
  onDragEndRow: () => void;
  onDropRow: (index: number) => void;
}

export default function CurrencyRow({
  row,
  index,
  isBase,
  usedCodes,
  canDelete,
  onAmountChange,
  onCurrencyChange,
  onRemove,
  isDragSource,
  isDragOver,
  onDragStartRow,
  onDragOverRow,
  onDragEndRow,
  onDropRow,
}: CurrencyRowProps) {
  const [canDrag, setCanDrag] = useState(false);

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", String(index));
        e.dataTransfer.effectAllowed = "move";
        onDragStartRow(index);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOverRow(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropRow(index);
      }}
      onDragEnd={onDragEndRow}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 transition-colors sm:gap-3 sm:p-3",
        isDragSource
          ? "border-accent opacity-50"
          : isDragOver
            ? "border-accent"
            : "border-line",
      )}
    >
      {/* 拖拽手柄：仅桌面端 */}
      <button
        type="button"
        aria-label="拖拽排序"
        onMouseDown={() => setCanDrag(true)}
        onMouseUp={() => setCanDrag(false)}
        onMouseLeave={() => setCanDrag(false)}
        className="hidden h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-ink-faint hover:text-ink-soft active:cursor-grabbing md:flex"
      >
        <GripVertical className="h-4 w-4" strokeWidth={2.25} />
      </button>

      {/* 货币选择器 */}
      <CurrencySelect
        value={row.code}
        usedCodes={usedCodes}
        onChange={(code) => onCurrencyChange(row.id, code)}
      />

      {/* 金额输入框 */}
      <input
        type="text"
        inputMode="decimal"
        value={row.amount}
        onChange={(e) => onAmountChange(row.id, e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder="0"
        className={cn(
          "min-w-0 flex-1 rounded-md bg-transparent text-right font-mono text-lg font-medium leading-none outline-none placeholder:text-ink-faint/60 sm:text-xl",
          isBase ? "text-ink" : "text-ink-soft",
        )}
      />

      {/* 删除按钮 */}
      <button
        type="button"
        aria-label="删除该行"
        disabled={!canDelete}
        onClick={() => canDelete && onRemove(row.id)}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
          canDelete
            ? "text-ink-faint hover:bg-rose-50 hover:text-rose-500"
            : "cursor-not-allowed text-ink-faint/30",
        )}
      >
        <X className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
