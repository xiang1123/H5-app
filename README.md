```markdown
# 电商 H5 移动端项目

基于 Vue3 + Vant + Pinia + TypeScript 构建的移动端电商应用，仿京东商城风格。

## 📱 项目预览

- 在线演示：[https://your-domain.com](https://your-domain.com)
- 接口文档：[https://api.yyzzhhh.work.gd/docs](https://api.yyzzhhh.work.gd/docs)

## ✨ 功能特性

### 核心功能

- 🏠 **首页模块**
  - 轮播图展示
  - 分类导航
  - 商品列表（上拉加载、下拉刷新）
  - 骨架屏加载

- 📂 **分类模块**
  - 左右布局（一级分类 + 二级分类）
  - 商品筛选和排序
  - 上拉加载更多

- 🛒 **购物车模块**
  - 商品增删改查
  - 全选/单选
  - 左滑删除
  - 价格计算
  - 登录校验

- 👤 **用户中心**
  - 登录/注册（支持手机号和邮箱）
  - 个人信息展示
  - 订单管理入口
  - 地址管理入口

- 🔍 **搜索模块**
  - 搜索历史
  - 热门搜索
  - 商品搜索

- 📦 **商品详情**
  - 图片轮播和预览
  - SKU 规格选择
  - 价格和库存显示
  - 加入购物车/立即购买
  - 登录校验

- 📍 **地址管理**
  - 地址列表
  - 新增/编辑/删除地址
  - 设置默认地址
  - 省市区三级联动

- 📋 **订单管理**
  - 订单列表（状态筛选）
  - 订单详情
  - 创建订单
  - 取消订单
  - 确认收货
  - 物流查询

- 💳 **支付功能**
  - 支付宝支付（沙盒环境）
  - 支付状态轮询
  - 支付结果页面

### 技术特性

- ✅ TypeScript 类型支持
- ✅ Pinia 状态管理
- ✅ Vue Router 路由管理
- ✅ Axios 请求封装
- ✅ 移动端适配（rem + flexible）
- ✅ 图片懒加载
- ✅ Keep-alive 页面缓存
- ✅ 路由守卫（登录拦截）
- ✅ XSS 和 SQL 注入防护
- ✅ 注册频率限制
- ✅ 输入验证和清理

## 🛠️ 技术栈

- **框架**: Vue 3.x
- **UI 组件库**: Vant 4.x
- **状态管理**: Pinia 2.x
- **路由**: Vue Router 4.x
- **HTTP 客户端**: Axios
- **构建工具**: Vite 5.x
- **语言**: TypeScript 5.x
- **样式**: Sass/SCSS
- **移动端适配**: amfe-flexible + postcss-pxtorem

## 📦 项目结构

```
jd-h5-app/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API 接口
│   │   ├── index.ts
│   │   ├── home.ts            # 首页接口
│   │   ├── auth.ts            # 认证接口
│   │   ├── product.ts         # 商品接口
│   │   ├── cart.ts            # 购物车接口
│   │   ├── address.ts         # 地址接口
│   │   ├── order.ts           # 订单接口
│   │   ├── pay.ts             # 支付接口
│   │   └── logistics.ts       # 物流接口
│   ├── assets/                 # 静态资源
│   │   ├── images/
│   │   └── styles/
│   │       ├── reset.scss     # 样式重置
│   │       ├── common.scss    # 公共样式
│   │       └── variables.scss # 样式变量
│   ├── components/             # 公共组件
│   │   ├── SkeletonScreen/    # 骨架屏组件
│   │   │   ├── HomeSkeleton.vue
│   │   │   ├── CategorySkeleton.vue
│   │   │   ├── CartSkeleton.vue
│   │   │   └── UserSkeleton.vue
│   │   └── TabBar/            # 底部导航
│   │       └── index.vue
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useLoading.ts
│   │   └── useRegisterLimit.ts
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── store/                  # Pinia 状态管理
│   │   ├── index.ts
│   │   └── modules/
│   │       ├── app.ts         # 应用状态
│   │       ├── user.ts        # 用户状态
│   │       ├── cart.ts        # 购物车状态
│   │       └── address.ts     # 地址状态
│   ├── types/                  # TypeScript 类型定义
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── store.ts
│   ├── utils/                  # 工具函数
│   │   ├── request.ts         # Axios 封装
│   │   ├── storage.ts         # 本地存储
│   │   ├── validate.ts        # 验证工具
│   │   ├── area.ts            # 地区数据
│   │   ├── throttle.ts        # 防抖节流
│   │   └── debug.ts           # 调试工具
│   ├── views/                  # 页面组件
│   │   ├── Home/              # 首页
│   │   │   └── index.vue
│   │   ├── Category/          # 分类
│   │   │   └── index.vue
│   │   ├── Cart/              # 购物车
│   │   │   └── index.vue
│   │   ├── User/              # 用户中心
│   │   │   └── index.vue
│   │   ├── Login/             # 登录注册
│   │   │   └── index.vue
│   │   ├── Search/            # 搜索
│   │   │   └── index.vue
│   │   ├── Product/           # 商品
│   │   │   └── Detail.vue
│   │   ├── Address/           # 地址管理
│   │   │   ├── List.vue
│   │   │   └── Edit.vue
│   │   ├── Order/             # 订单管理
│   │   │   ├── List.vue
│   │   │   ├── Detail.vue
│   │   │   ├── Confirm.vue
│   │   │   ├── Pay.vue
│   │   │   └── Logistics.vue
│   │   └── Pay/               # 支付
│   │       └── AlipayReturn.vue
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js           # PostCSS 配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x 或 yarn >= 1.22.x

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd jd-h5-app

# 安装依赖
npm install
```

### 开发运行

```bash
# 启动开发服务器
npm run dev

# 访问地址：http://localhost:3000
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📝 环境变量配置

### .env.development

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080

# 图片基础地址
VITE_IMAGE_BASE_URL=http://localhost:8080

# 支付宝回调地址
VITE_ALIPAY_RETURN_URL=http://localhost:3000/pay/alipay-return
```

### .env.production

```env
# API 基础地址
VITE_API_BASE_URL=https://api.yyzzhhh.work.gd

# 图片基础地址
VITE_IMAGE_BASE_URL=https://api.yyzzhhh.work.gd

# 支付宝回调地址
VITE_ALIPAY_RETURN_URL=https://your-domain.com/pay/alipay-return
```

## 🔌 API 接口说明

### 基础配置

- **Base URL**: `https://api.yyzzhhh.work.gd`
- **请求格式**: JSON
- **响应格式**: JSON
- **认证方式**: Bearer Token

### 响应数据结构

```typescript
{
  "code": 0,           // 0: 成功, 其他: 失败
  "message": "ok",     // 响应消息
  "data": {}           // 响应数据
}
```

### 主要接口

#### 认证相关

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/profile` - 获取用户信息
- `PATCH /api/v1/auth/profile` - 更新用户信息

#### 商品相关

- `GET /api/v1/banners` - 获取轮播图
- `GET /api/v1/categories` - 获取分类列表
- `GET /api/v1/products` - 获取商品列表
- `GET /api/v1/products/:id` - 获取商品详情
- `GET /api/v1/products/:id/skus` - 获取商品 SKU

#### 购物车相关

- `GET /api/v1/cart` - 获取购物车
- `POST /api/v1/cart/items` - 添加商品到购物车
- `PATCH /api/v1/cart/items/:id` - 更新购物车商品
- `DELETE /api/v1/cart/items/:id` - 删除购物车商品
- `POST /api/v1/cart/clear` - 清空购物车

#### 地址相关

- `GET /api/v1/addresses` - 获取地址列表
- `POST /api/v1/addresses` - 添加地址
- `PATCH /api/v1/addresses/:id` - 更新地址
- `DELETE /api/v1/addresses/:id` - 删除地址

#### 订单相关

- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders` - 获取订单列表
- `GET /api/v1/orders/:id` - 获取订单详情
- `POST /api/v1/orders/:id/cancel` - 取消订单
- `POST /api/v1/orders/:id/confirm` - 确认收货
- `GET /api/v1/orders/:id/shipment` - 获取物流信息

#### 支付相关

- `POST /api/v1/pay/alipay/:orderId` - 创建支付宝支付

## 🎨 页面路由

| 路径 | 页面 | 说明 | 是否需要登录 |
|------|------|------|-------------|
| `/home` | 首页 | 商城首页 | ❌ |
| `/category` | 分类 | 商品分类 | ❌ |
| `/cart` | 购物车 | 购物车 | ✅ |
| `/user` | 我的 | 个人中心 | ❌ |
| `/login` | 登录注册 | 用户登录注册 | ❌ |
| `/search` | 搜索 | 商品搜索 | ❌ |
| `/product/detail` | 商品详情 | 商品详细信息 | ❌ |
| `/address/list` | 地址列表 | 收货地址管理 | ✅ |
| `/address/edit` | 编辑地址 | 新增/编辑地址 | ✅ |
| `/order/list` | 订单列表 | 我的订单 | ✅ |
| `/order/detail` | 订单详情 | 订单详细信息 | ✅ |
| `/order/confirm` | 确认订单 | 订单确认页 | ✅ |
| `/order/pay` | 支付页面 | 收银台 | ✅ |
| `/order/logistics` | 物流信息 | 物流跟踪 | ✅ |
| `/pay/alipay-return` | 支付结果 | 支付宝回调 | ❌ |

## 🔧 核心配置

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.yyzzhhh.work.gd',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### PostCSS 配置 (postcss.config.js)

```javascript
module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        'Android 4.1',
        'iOS 7.1',
        'Chrome > 31',
        'ff > 31',
        'ie >= 8',
      ],
    },
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: ['.norem'],
    },
  },
}
```

## 💾 状态管理

### User Store (用户状态)

```typescript
- userInfo: 用户信息
- token: 登录令牌
- isLogin: 登录状态
- userLogin(): 用户登录
- userRegister(): 用户注册
- getUserInfo(): 获取用户信息
- logout(): 退出登录
```

### Cart Store (购物车状态)

```typescript
- cartList: 购物车列表
- cartCount: 商品总数
- selectedCount: 选中商品数
- totalPrice: 选中商品总价
- fetchCartList(): 获取购物车列表
- addCartItem(): 添加商品
- updateQuantity(): 更新数量
- removeCartItem(): 删除商品
- toggleSelect(): 切换选中
- selectAll(): 全选/取消全选
```

### Address Store (地址状态)

```typescript
- addressList: 地址列表
- defaultAddress: 默认地址
- fetchAddressList(): 获取地址列表
- getAddressById(): 根据 ID 获取地址
```

## 🔐 安全特性

### 1. 输入验证

- 手机号格式验证
- 邮箱格式验证
- 密码强度验证（包含字母和数字，6-20位）
- 昵称格式验证

### 2. XSS 防护

- HTML 标签过滤
- Script 标签移除
- 特殊字符转义

### 3. SQL 注入防护

- 危险关键字检测
- 特殊字符过滤

### 4. 频率限制

- 注册尝试次数限制（5次/小时）
- 失败后临时封禁（30分钟）
- 请求节流（2秒）

### 5. 内容安全

- 敏感词检测
- 输入长度限制
- 实时输入过滤

## 📱 移动端适配

### Viewport 设置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
```

### Rem 适配

- 基准值：37.5px (iPhone 6/7/8)
- 自动转换：px → rem
- 支持 Retina 屏幕

### 安全区域适配

```scss
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 🎯 开发规范

### 命名规范

- **组件命名**: PascalCase (如: `UserCenter.vue`)
- **文件命名**: kebab-case (如: `user-center.vue`)
- **变量命名**: camelCase (如: `userName`)
- **常量命名**: UPPER_SNAKE_CASE (如: `API_BASE_URL`)

### 代码规范

- 使用 TypeScript 进行类型约束
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件使用 `<script setup>` 语法

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

## 🐛 常见问题

### 1. 图片加载失败

**问题**: 商品图片无法显示

**解决方案**:
```typescript
// 检查图片 URL 处理函数
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${import.meta.env.VITE_API_BASE_URL}${url}`
}
```

### 2. 首页无限加载

**问题**: 从详情页返回首页时不断发送请求

**解决方案**:
```typescript
// 使用 onActivated 和 isFirstLoad 标记
const isFirstLoad = ref(true)

onMounted(() => {
  if (isFirstLoad.value) {
    loadData()
    isFirstLoad.value = false
  }
})

onActivated(() => {
  // 不重新加载数据
})
```

### 3. 422 参数错误

**问题**: 请求参数验证失败

**解决方案**:
```typescript
// 清理 undefined 参数
const cleanParams = {}
Object.keys(params).forEach(key => {
  if (params[key] !== undefined && params[key] !== null) {
    cleanParams[key] = params[key]
  }
})
```

### 4. 底部导航位置错误

**问题**: TabBar 没有固定在底部

**解决方案**:
```vue
<!-- TabBar 组件添加属性 -->
<van-tabbar fixed placeholder safe-area-inset-bottom>
  <!-- ... -->
</van-tabbar>

<!-- 页面添加底部间距 -->
<style>
.page {
  padding-bottom: 50px;
}
</style>
```

### 5. 支付宝支付跳转失败

**问题**: 无法跳转到支付宝

**解决方案**:
```typescript
// 确保正确处理支付宝表单
const div = document.createElement('div')
div.innerHTML = form_data
document.body.appendChild(div)
const form = div.querySelector('form')
form?.submit()
```

## 📊 性能优化

### 1. 路由懒加载

```typescript
component: () => import('@/views/Home/index.vue')
```

### 2. 图片懒加载

```vue
<van-image lazy-load :src="imageUrl" />
```

### 3. Keep-alive 缓存

```vue
<keep-alive :include="['Home', 'Category']">
  <router-view />
</keep-alive>
```

### 4. 组件按需引入

```typescript
// 使用 unplugin-vue-components 自动按需引入
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
```

### 5. 代码分割

```typescript
// 动态导入实现代码分割
const ProductDetail = () => import('@/views/Product/Detail.vue')
```

## 🧪 测试账号

### 支付宝沙盒账号

- **买家账号**: 在[支付宝开放平台](https://openhome.alipay.com/platform/appDaily.htm)查看
- **登录密码**: 111111
- **支付密码**: 111111

### 测试用户

- **手机号**: 13800138000
- **邮箱**: test@example.com
- **密码**: 123456

## 📖 开发文档

### Vant 组件库

- [Vant 4 官方文档](https://vant-ui.github.io/vant/#/zh-CN)
- [Vant 4 组件列表](https://vant-ui.github.io/vant/#/zh-CN/home)

### Vue 3

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

### Pinia

- [Pinia 官方文档](https://pinia.vuejs.org/zh/)

### TypeScript

- [TypeScript 官方文档](https://www.typescriptlang.org/zh/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议

## 👥 开发团队

- 开发者: Your Name
- 邮箱: your.email@example.com

## 🔗 相关链接

- [项目地址](https://github.com/your-username/jd-h5-app)
- [问题反馈](https://github.com/your-username/jd-h5-app/issues)
- [更新日志](CHANGELOG.md)

## 📅 更新日志

### v1.0.0 (2024-01-01)

#### 新增功能
- ✨ 首页模块（轮播图、分类导航、商品列表）
- ✨ 分类模块（左右布局、商品筛选排序）
- ✨ 购物车模块（增删改查、全选、价格计算）
- ✨ 用户模块（登录注册、个人中心）
- ✨ 商品详情（图片轮播、SKU 选择、加入购物车）
- ✨ 地址管理（列表、新增、编辑、删除）
- ✨ 订单管理（创建、列表、详情、取消、确认收货）
- ✨ 支付功能（支付宝支付）
- ✨ 物流查询

#### 技术特性
- 🎯 TypeScript 类型支持
- 🎯 Pinia 状态管理
- 🎯 移动端适配
- 🎯 图片懒加载
- 🎯 路由守卫
- 🎯 安全防护（XSS、SQL 注入）
- 🎯 频率限制
- 🎯 骨架屏加载

## 🎓 学习资源

### 推荐阅读

- [Vue 3 最佳实践](https://cn.vuejs.org/guide/best-practices/production-deployment.html)
- [移动端适配方案](https://github.com/amfe/article/issues/17)
- [前端安全防护](https://developer.mozilla.org/zh-CN/docs/Web/Security)

### 视频教程

- [Vue 3 入门教程](https://www.bilibili.com/)
- [Vant 组件库使用](https://www.bilibili.com/)

## 💡 开发建议

### 1. 本地开发

- 使用 Chrome DevTools 的移动设备模拟器
- 推荐使用 iPhone 6/7/8 (375x667) 进行开发
- 使用 Vue DevTools 进行调试

### 2. 真机调试

```bash
# 获取本地 IP
ipconfig (Windows) 或 ifconfig (Mac/Linux)

# 使用 IP 访问
http://192.168.x.x:3000
```

### 3. 性能监控

```typescript
// 在 main.ts 中添加性能监控
if (import.meta.env.PROD) {
  // 添加性能监控代码
}
```

## 🔨 构建优化

### 分析打包体积

```bash
# 安装分析工具
npm install rollup-plugin-visualizer -D

# 构建并分析
npm run build
```

### Gzip 压缩

```bash
# 安装插件
npm install vite-plugin-compression -D
```

### CDN 加速

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
        },
      },
    },
  },
})
```

## 📞 技术支持

如有问题，请通过以下方式联系：

- 📧 Email: your.email@example.com
- 💬 微信: your-wechat-id
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/jd-h5-app/issues)

## ⭐ Star History

如果这个项目对你有帮助，请给一个 Star ⭐️

---

**Made with ❤️ by Your Name**
```

这份 README 文档包含了：

1. ✅ **项目介绍** - 技术栈和功能特性
2. ✅ **快速开始** - 安装和运行指南
3. ✅ **项目结构** - 完整的目录说明
4. ✅ **API 接口** - 接口列表和说明
5. ✅ **路由配置** - 页面路由表
6. ✅ **核心配置** - Vite、PostCSS 配置
7. ✅ **状态管理** - Store 说明
8. ✅ **安全特性** - 安全防护措施
9. ✅ **移动端适配** - 适配方案
10. ✅ **开发规范** - 命名和代码规范
11. ✅ **常见问题** - FAQ 和解决方案
12. ✅ **性能优化** - 优化建议
13. ✅ **测试账号** - 测试信息
14. ✅ **更新日志** - 版本记录

这是一份完整的、专业的项目文档！