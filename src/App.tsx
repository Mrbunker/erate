import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import CurrencyRow from "@/components/CurrencyRow";
import { useRates } from "@/hooks/useRates";
import { useCalculator } from "@/hooks/useCalculator";

export default function App() {
  const { rates, status } = useRates();
  const {
    rows,
    baseId,
    usedCodes,
    canAddRow,
    setRowAmount,
    setRowCurrency,
    removeRow,
    reorderRows,
    addRow,
  } = useCalculator({ rates, status });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) reorderRows(dragIndex, to);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="min-h-full bg-canvas">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <Header />

        {status === "error" && (
          <p className="mt-2 text-center text-xs text-rose-500">
            汇率加载失败，正在使用占位汇率
          </p>
        )}

        <section className="mt-6 space-y-2 sm:mt-8 sm:space-y-3">
          {rows.map((row, index) => (
            <CurrencyRow
              key={row.id}
              row={row}
              index={index}
              isBase={row.id === baseId}
              usedCodes={usedCodes}
              canDelete={rows.length > 1}
              onAmountChange={setRowAmount}
              onCurrencyChange={setRowCurrency}
              onRemove={removeRow}
              isDragSource={dragIndex === index}
              isDragOver={overIndex === index && dragIndex !== index}
              onDragStartRow={setDragIndex}
              onDragOverRow={setOverIndex}
              onDragEndRow={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDropRow={handleDrop}
            />
          ))}
        </section>

        <div className="mt-3 sm:mt-4">
          <button
            type="button"
            onClick={addRow}
            disabled={!canAddRow}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-accent/40 py-2.5 font-sans text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:border-line disabled:text-ink-faint/40 disabled:hover:bg-transparent"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            添加货币
          </button>
        </div>
      </main>
    </div>
  );
}
