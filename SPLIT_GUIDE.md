# 拆分说明

本原型已按“一级菜单”“二级菜单”“PC 功能菜单”和“同城 App 内功能菜单”拆分。页面 HTML 只在对应片段中维护，由 `build-index.mjs` 与入口模板合成为可直接打开的 `index.html`。

## 页面片段

独立页面片段放在：

- `页面/一级菜单.html`
- `页面/二级菜单.html`
- `页面/PC功能菜单/`
- `页面/同城App功能菜单/`

重点页面对应关系：

- `页面/PC功能菜单/商品池管理.html`（“老三方 / 三方商品 / 商品池管理”）
- `页面/PC功能菜单/同城订单.html`（现有二级菜单“订单管理”的订单列表与详情）
- `页面/PC功能菜单/同城后台类目.html`
- `页面/PC功能菜单/同城门店商品.html`
- `页面/PC功能菜单/同城商品缺勤报表.html`
- `页面/PC功能菜单/同城商品缺货报表.html`
- `页面/PC功能菜单/IM回复率统计.html`
- `页面/PC功能菜单/同城自定义任务.html`
- `页面/PC功能菜单/同城运维工具.html`
- `页面/PC功能菜单/同城商家客服.html`
- `页面/PC功能菜单/同城上下架计划.html`
- `页面/PC功能菜单/门店商品上架计划.html`
- `页面/PC功能菜单/同城生活门店管理.html`
- `页面/PC功能菜单/同城生活核销明细.html`
- `页面/PC功能菜单/同城券规则.html`
- `页面/PC功能菜单/京东接口列表.html`
- `页面/PC功能菜单/订单热力图.html`
- `页面/同城App功能菜单/同城App手机预览.html`
- `页面/同城App功能菜单/IM消息.html`
- `页面/同城App功能菜单/同城商品档案.html`

## 入口文件

- `index.template.html`：首页外壳、脚本顺序及页面片段引用。
- `index.html`：生成后的总入口和完整 DOM。
- `styles.css`：中文样式 import 清单。
- `app.js`：拆分说明占位，运行脚本已迁移到 `js/`。

## JS 拆分

- `js/数据/商品目录.js`
- `js/核心/`：状态、DOM 引用、通用 UI、页面路由、导航与初始化。
- `js/PC页面/同城商品管理/`
- `js/PC页面/同城报表/`
- `js/PC页面/同城生活/`
- `js/PC页面/接口管理/`
- `js/PC页面/老三方/商品池管理.js`
- `js/PC页面/同城订单.js`
- `js/PC页面/同城自定义任务.js`
- `js/PC页面/同城基础设置/同城运维工具.js`
- `js/PC页面/同城基础设置/同城商家客服.js`
- `js/PC页面/同城基础设置/同城上下架计划.js`
- `js/PC页面/同城基础设置/门店商品上架计划.js`
- `js/同城App/同城App手机预览.js`
- `js/同城App/功能应用/IM消息.js`
- `js/同城App/功能应用/IM消息数据.js`
- `js/同城App/功能应用/同城商品档案.js`

## CSS 拆分

- `styles/基础样式.css`
- `styles/响应式适配.css`
- `styles/PC页面/同城商品管理/同城商品管理.css`
- `styles/PC页面/同城报表/同城商品缺勤缺货报表.css`
- `styles/PC页面/同城报表/IM回复率统计.css`
- `styles/PC页面/同城报表/订单热力图.css`
- `styles/PC页面/同城生活/同城生活门店管理.css`
- `styles/PC页面/同城生活/同城生活核销与券规则.css`
- `styles/PC页面/接口管理/京东接口列表.css`
- `styles/PC页面/老三方/商品池管理.css`
- `styles/PC页面/同城订单/同城订单.css`
- `styles/PC页面/同城自定义任务.css`
- `styles/PC页面/同城基础设置/同城运维工具.css`
- `styles/PC页面/同城基础设置/同城商家客服.css`
- `styles/PC页面/同城基础设置/同城上下架计划.css`
- `styles/PC页面/同城基础设置/门店商品上架计划.css`
- `styles/同城App/同城App手机预览.css`
- `styles/同城App/同城App模式.css`
- `styles/同城App/功能应用/IM消息.css`
- `styles/同城App/功能应用/同城商品档案.css`

## 修改建议

修改对应的页面片段，再运行 `node build-index.mjs`。持续编辑时可运行 `node build-index.mjs --watch`，保存后自动生成入口。页面片段可以引用其他片段，引用路径相对于原型根目录。
