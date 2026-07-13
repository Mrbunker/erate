# erate · 多币种汇率转换

一个使用 Flutter 编写的极简汇率换算器，支持在多种货币之间同步换算。

## 功能特性

- **多币种并行换算**：任意选中一行输入金额，其余行实时联动换算。
- **36 种常用货币**：覆盖亚太、欧美、中东、拉美等主流货币，附带国旗标识。
- **动态增减币种**：AppBar 加号新增币种，列表项左滑删除（至少保留 2 行）。
- **真实汇率数据**：接入 [Open Exchange Rates API](https://open.er-api.com/v6/latest/CNY)（免费、无需 Key）。
- **智能刷新机制**：应用启动或点击刷新时拉取，默认缓存 6 小时；缓存有效期内不重复请求。离线或请求失败时降级使用本地兜底数据。
- **跨端输入体验**：移动端使用内置数字键盘；桌面 / Web 端支持物理键盘（数字、`.`、`Backspace`、`Esc/Delete`）。
- **对齐规范的 UI**：币种选择区域固定宽度，避免不同名称长度导致布局跳动。

## 目录结构

```text
lib/
├── data/currencies.dart      # 支持的币种列表与兜底汇率
├── models/currency.dart      # Currency 数据模型
├── services/rate_service.dart# 汇率获取与本地缓存
├── widgets/
│   ├── currency_row.dart     # 单行币种展示组件
│   └── keypad.dart           # 数字键盘
├── pages/exchange_page.dart  # 主页面
└── main.dart
```

## 运行

```bash
flutter pub get
flutter run              # 默认设备
flutter run -d macos     # 桌面端调试
flutter run -d chrome    # Web 端调试
```

## 汇率数据说明

- 服务端点：`https://open.er-api.com/v6/latest/CNY`
- 缓存策略：使用 `shared_preferences` 存储，默认 6 小时有效期，可通过右上角刷新按钮强制拉取。
- 失败回退：网络异常 → 使用上次缓存；无缓存 → 使用 [currencies.dart](lib/data/currencies.dart) 中的兜底汇率。

## License

MIT
