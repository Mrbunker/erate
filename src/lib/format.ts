// 数字解析与格式化工具

// 将用户输入字符串解析为数字；无法解析返回 null
export function parseAmount(s: string): number | null {
  if (s == null) return null;
  const trimmed = s.trim().replace(/,/g, "");
  if (trimmed === "" || trimmed === "-" || trimmed === ".") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

// 将数字格式化为展示用字符串（千分位 + 自适应小数位）
export function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  let decimals: number;
  if (abs >= 1000) decimals = 2;
  else if (abs >= 1) decimals = 4;
  else if (abs >= 0.01) decimals = 6;
  else decimals = 8;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });
}

// 限制数字输入：仅允许数字、小数点、负号
export function sanitizeAmountInput(raw: string): string {
  // 移除空白与千分位逗号，保留首位负号、单个小数点
  let s = raw.replace(/\s/g, "").replace(/,/g, "");
  const negative = s.startsWith("-");
  s = s.replace(/-/g, "");
  s = s.replace(/[^0-9.]/g, "");
  // 只保留第一个小数点
  const parts = s.split(".");
  if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
  return (negative ? "-" : "") + s;
}
