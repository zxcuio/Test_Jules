# 多機能電卓 (Multi-functional Calculator)

このプロジェクトは、Webブラウザで動作する多機能電卓アプリケーションです。以下の3つのモードを搭載しています。

## 機能

### 1. 関数電卓 (Scientific Calculator)
Googleの電卓にインスパイアされたデザインで、基本的な四則演算に加え、以下の機能を備えています。
- 三角関数 (sin, cos, tan) およびその逆関数
- 対数 (log, ln)
- 指数計算 (x^y, e^x, 10^x)
- 階乗 (x!)
- 平方根 (√)
- 定数 (π, e)
- 角度単位の切り替え (度数法/弧度法)
- 答えのメモリ機能 (Ans)

### 2. 16進数電卓 (Hexadecimal Calculator)
プログラマーやエンジニア向けの16進数計算機能です。
- 16進数での四則演算
- 10進数へのリアルタイム変換表示

### 3. 割り勘電卓 (Split Bill Calculator)
合計金額と人数を入力するだけで、一人当たりの支払額と余りを算出します。

## 使用方法

特別なビルド手順は必要ありません。
`index.html` をWebブラウザで開くだけで使用できます。

## 技術スタック

- HTML5
- CSS3
- Vanilla JavaScript

## 開発者向け情報

- `script.js`: 計算ロジックとUI操作を管理
- `style.css`: Google Calculatorライクなスタイリングとレスポンシブデザイン
