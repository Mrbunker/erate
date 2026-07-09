// ISO 4217 货币元数据：代码 / 中文名 / 货币符号 / 国旗 emoji / 是否常用

export interface CurrencyMeta {
  code: string; // ISO 4217 代码
  name: string; // 中文名
  symbol: string; // 货币符号
  flag: string; // 国旗 emoji
  common?: boolean; // 是否常用货币（用于分组）
}

// 将 2 字母区域码转为国旗 emoji（regional indicator symbols）
function flagFromRegion(cc: string): string {
  if (!cc || cc.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const up = cc.toUpperCase();
  return String.fromCodePoint(
    A + (up.charCodeAt(0) - 65),
    A + (up.charCodeAt(1) - 65),
  );
}

// [code, 中文名, 符号, 区域码("" 表示无国旗), common?]
const RAW: Array<[string, string, string, string, true?]> = [
  // —— 常用货币 ——
  ["USD", "美元", "$", "US", true],
  ["EUR", "欧元", "€", "EU", true],
  ["CNY", "人民币", "¥", "CN", true],
  ["JPY", "日元", "¥", "JP", true],
  ["GBP", "英镑", "£", "GB", true],
  ["HKD", "港币", "HK$", "HK", true],
  ["KRW", "韩元", "₩", "KR", true],
  ["AUD", "澳大利亚元", "A$", "AU", true],
  ["CAD", "加拿大元", "C$", "CA", true],
  ["SGD", "新加坡元", "S$", "SG", true],
  ["CHF", "瑞士法郎", "CHF", "CH", true],
  ["TWD", "新台币", "NT$", "TW", true],
  ["THB", "泰铢", "฿", "TH", true],
  ["NZD", "新西兰元", "NZ$", "NZ", true],
  ["INR", "印度卢比", "₹", "IN", true],
  ["RUB", "俄罗斯卢布", "₽", "RU", true],
  ["BRL", "巴西雷亚尔", "R$", "BR", true],
  ["MXN", "墨西哥比索", "$", "MX", true],
  ["ZAR", "南非兰特", "R", "ZA", true],
  ["AED", "阿联酋迪拉姆", "د.إ", "AE", true],
  ["SAR", "沙特里亚尔", "﷼", "SA", true],
  ["SEK", "瑞典克朗", "kr", "SE", true],
  ["NOK", "挪威克朗", "kr", "NO", true],
  ["DKK", "丹麦克朗", "kr", "DK", true],
  ["PLN", "波兰兹罗提", "zł", "PL", true],
  ["TRY", "土耳其里拉", "₺", "TR", true],
  ["MYR", "马来西亚林吉特", "RM", "MY", true],
  ["IDR", "印度尼西亚盾", "Rp", "ID", true],
  ["PHP", "菲律宾比索", "₱", "PH", true],
  ["VND", "越南盾", "₫", "VN", true],
  ["CZK", "捷克克朗", "Kč", "CZ", true],
  ["HUF", "匈牙利福林", "Ft", "HU", true],
  ["ILS", "以色列新谢克尔", "₪", "IL", true],
  ["PKR", "巴基斯坦卢比", "₨", "PK", true],
  ["BDT", "孟加拉塔卡", "৳", "BD", true],
  ["UAH", "乌克兰格里夫纳", "₴", "UA", true],

  // —— 其他货币 ——
  ["AFN", "阿富汗尼", "؋", "AF"],
  ["ALL", "阿尔巴尼亚列克", "L", "AL"],
  ["AMD", "亚美尼亚德拉姆", "֏", "AM"],
  ["ANG", "荷属安的列斯盾", "ƒ", "CW"],
  ["AOA", "安哥拉宽扎", "Kz", "AO"],
  ["ARS", "阿根廷比索", "$", "AR"],
  ["AWG", "阿鲁巴弗罗林", "ƒ", "AW"],
  ["AZN", "阿塞拜疆马纳特", "₼", "AZ"],
  ["BAM", "波黑可兑换马克", "KM", "BA"],
  ["BBD", "巴巴多斯元", "$", "BB"],
  ["BGN", "保加利亚列弗", "лв", "BG"],
  ["BHD", "巴林第纳尔", ".د.ب", "BH"],
  ["BIF", "布隆迪法郎", "FBu", "BI"],
  ["BMD", "百慕大元", "$", "BM"],
  ["BND", "文莱元", "B$", "BN"],
  ["BOB", "玻利维亚诺", "Bs", "BO"],
  ["BSD", "巴哈马元", "$", "BS"],
  ["BTN", "不丹卢比", "Nu.", "BT"],
  ["BWP", "博茨瓦纳普拉", "P", "BW"],
  ["BYN", "白俄罗斯卢布", "Br", "BY"],
  ["BZD", "伯利兹元", "$", "BZ"],
  ["CDF", "刚果法郎", "FC", "CD"],
  ["CLF", "智利开发单位", "UF", "CL"],
  ["CLP", "智利比索", "$", "CL"],
  ["COP", "哥伦比亚比索", "$", "CO"],
  ["COU", "哥伦比亚实际价值单位", "UVR", "CO"],
  ["CRC", "哥斯达黎加科朗", "₡", "CR"],
  ["CUP", "古巴比索", "$", "CU"],
  ["CVE", "佛得角埃斯库多", "$", "CV"],
  ["DJF", "吉布提法郎", "Fdj", "DJ"],
  ["DOP", "多米尼加比索", "$", "DO"],
  ["DZD", "阿尔及利亚第纳尔", "د.ج", "DZ"],
  ["EGP", "埃及镑", "£", "EG"],
  ["ERN", "厄立特里亚纳克法", "Nfk", "ER"],
  ["ETB", "埃塞俄比亚比尔", "Br", "ET"],
  ["FJD", "斐济元", "FJ$", "FJ"],
  ["FKP", "福克兰群岛镑", "£", "FK"],
  ["GEL", "格鲁吉亚拉里", "₾", "GE"],
  ["GHS", "加纳塞地", "₵", "GH"],
  ["GIP", "直布罗陀镑", "£", "GI"],
  ["GMD", "冈比亚达拉西", "D", "GM"],
  ["GNF", "几内亚法郎", "FG", "GN"],
  ["GTQ", "危地马拉格查尔", "Q", "GT"],
  ["GYD", "圭亚那元", "$", "GY"],
  ["HNL", "洪都拉斯伦皮拉", "L", "HN"],
  ["HRK", "克罗地亚库纳", "kn", "HR"],
  ["HTG", "海地古德", "G", "HT"],
  ["IQD", "伊拉克第纳尔", "ع.د", "IQ"],
  ["IRR", "伊朗里亚尔", "﷼", "IR"],
  ["ISK", "冰岛克朗", "kr", "IS"],
  ["JMD", "牙买加元", "$", "JM"],
  ["JOD", "约旦第纳尔", "د.ا", "JO"],
  ["KES", "肯尼亚先令", "KSh", "KE"],
  ["KGS", "吉尔吉斯斯坦索姆", "с", "KG"],
  ["KHR", "柬埔寨瑞尔", "៛", "KH"],
  ["KMF", "科摩罗法郎", "CF", "KM"],
  ["KPW", "朝鲜圆", "₩", "KP"],
  ["KWD", "科威特第纳尔", "د.ك", "KW"],
  ["KYD", "开曼群岛元", "$", "KY"],
  ["KZT", "哈萨克斯坦坚戈", "₸", "KZ"],
  ["LAK", "老挝基普", "₭", "LA"],
  ["LBP", "黎巴嫩镑", "ل.ل", "LB"],
  ["LKR", "斯里兰卡卢比", "Rs", "LK"],
  ["LRD", "利比里亚元", "$", "LR"],
  ["LSL", "莱索托洛蒂", "L", "LS"],
  ["LYD", "利比亚第纳尔", "ل.د", "LY"],
  ["MAD", "摩洛哥迪拉姆", "د.م.", "MA"],
  ["MDL", "摩尔多瓦列伊", "L", "MD"],
  ["MGA", "马达加斯加阿里亚里", "Ar", "MG"],
  ["MKD", "北马其顿第纳尔", "ден", "MK"],
  ["MMK", "缅甸缅元", "K", "MM"],
  ["MNT", "蒙古图格里克", "₮", "MN"],
  ["MOP", "澳门元", "MOP$", "MO"],
  ["MRU", "毛里塔尼亚乌吉亚", "UM", "MR"],
  ["MUR", "毛里求斯卢比", "Rs", "MU"],
  ["MVR", "马尔代夫拉菲亚", "Rf", "MV"],
  ["MWK", "马拉维克瓦查", "MK", "MW"],
  ["MXV", "墨西哥实际价值单位", "UDI", "MX"],
  ["MZN", "莫桑比克梅蒂卡尔", "MT", "MZ"],
  ["NAD", "纳米比亚元", "$", "NA"],
  ["NGN", "尼日利亚奈拉", "₦", "NG"],
  ["NIO", "尼加拉瓜科多巴", "C$", "NI"],
  ["NPR", "尼泊尔卢比", "रू", "NP"],
  ["OMR", "阿曼里亚尔", "﷼", "OM"],
  ["PAB", "巴波亚", "B/.", "PA"],
  ["PEN", "秘鲁索尔", "S/", "PE"],
  ["PGK", "巴布亚新几内亚基那", "K", "PG"],
  ["PYG", "巴拉圭瓜拉尼", "₲", "PY"],
  ["QAR", "卡塔尔里亚尔", "﷼", "QA"],
  ["RON", "罗马尼亚列伊", "lei", "RO"],
  ["RSD", "塞尔维亚第纳尔", "din", "RS"],
  ["RWF", "卢旺达法郎", "FRw", "RW"],
  ["SBD", "所罗门群岛元", "$", "SB"],
  ["SCR", "塞舌尔卢比", "Rs", "SC"],
  ["SDG", "苏丹镑", "£", "SD"],
  ["SHP", "圣赫勒拿镑", "£", "SH"],
  ["SLE", "塞拉利昂新利昂", "Le", "SL"],
  ["SLL", "塞拉利昂利昂", "Le", "SL"],
  ["SOS", "索马里先令", "Sh", "SO"],
  ["SRD", "苏里南元", "$", "SR"],
  ["SSP", "南苏丹镑", "£", "SS"],
  ["STN", "圣多美多布拉", "Db", "ST"],
  ["SVC", "萨尔瓦多科朗", "₡", "SV"],
  ["SYP", "叙利亚镑", "£", "SY"],
  ["SZL", "斯威士兰里兰吉尼", "E", "SZ"],
  ["TJS", "塔吉克斯坦索莫尼", "ЅМ", "TJ"],
  ["TMT", "土库曼斯坦马纳特", "m", "TM"],
  ["TND", "突尼斯第纳尔", "د.ت", "TN"],
  ["TOP", "汤加潘加", "T$", "TO"],
  ["TTD", "特立尼达和多巴哥元", "$", "TT"],
  ["TZS", "坦桑尼亚先令", "TSh", "TZ"],
  ["UGX", "乌干达先令", "USh", "UG"],
  ["USN", "美元（次日结算）", "$", "US"],
  ["UYI", "乌拉圭指数比索", "UI", "UY"],
  ["UYU", "乌拉圭比索", "$", "UY"],
  ["UZS", "乌兹别克斯坦苏姆", "сўм", "UZ"],
  ["VES", "委内瑞拉主权玻利瓦尔", "Bs", "VE"],
  ["VUV", "瓦努阿图瓦图", "VT", "VU"],
  ["WST", "萨摩亚塔拉", "T", "WS"],
  ["XAF", "中非法郎", "FCFA", "CF"],
  ["XCD", "东加勒比元", "EC$", "AG"],
  ["XOF", "西非法郎", "CFA", "SN"],
  ["XPF", "太平洋法郎", "₣", "PF"],
  ["YER", "也门里亚尔", "﷼", "YE"],
  ["ZMW", "赞比亚克瓦查", "ZK", "ZM"],
  ["ZWL", "津巴布韦元", "$", "ZW"],

  // —— 特殊 / 计价单位 ——
  ["XDR", "特别提款权", "SDR", ""],
  ["XAG", "白银盎司", "Ag", ""],
  ["XAU", "黄金盎司", "Au", ""],
  ["XPT", "铂金盎司", "Pt", ""],
  ["XPD", "钯金盎司", "Pd", ""],
  ["XBA", "欧洲复合货币", "EURCO", ""],
  ["XBB", "欧洲货币单位", "EMU", ""],
  ["XBC", "欧洲账户单位（9）", "EUA-9", ""],
  ["XBD", "欧洲账户单位（17）", "EUA-17", ""],
  ["XUA", "非洲开发银行记账单位", "XUA", ""],
  ["CHE", "WIR 欧元", "CHE", "CH"],
  ["CHW", "WIR 法郎", "CHW", "CH"],
];

export const CURRENCIES: CurrencyMeta[] = RAW.map(([code, name, symbol, region, common]) => {
  const meta: CurrencyMeta = {
    code,
    name,
    symbol,
    flag: region ? flagFromRegion(region) : "🌐",
  };
  if (common) meta.common = true;
  return meta;
});

const BY_CODE = new Map<string, CurrencyMeta>(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): CurrencyMeta | undefined {
  return BY_CODE.get(code);
}

// 常用货币（用于选择器分组与默认添加）
export const COMMON_CURRENCIES: CurrencyMeta[] = CURRENCIES.filter((c) => c.common);

// 其他货币（按代码字母序）
export const OTHER_CURRENCIES: CurrencyMeta[] = CURRENCIES.filter((c) => !c.common).sort((a, b) =>
  a.code.localeCompare(b.code),
);
