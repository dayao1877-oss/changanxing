# 长安行 - 小规模车队管理系统


---

## ✨ 功能特性

### 🖥️ Web 后台管理系统

- **📊 数据概览** - 实时数据监控、订单统计、收入分析
- **👥 用户管理** - 司机/乘客管理、审核、详情查看
- **🚗 订单管理** - 订单创建、分配、跟踪、结算
- **🚙 车辆管理** - 车辆信息、绑定司机、状态管理
- **📍 定位管理** - 实时位置监控、历史轨迹回放
- **💰 财务管理** - 计费规则、订单结算、财务报表
- **📈 智能调度** - 自动派单算法、路线优化
- **⚠️ 异常处理** - 异常上报、拒绝记录、紧急事件
- **🔔 消息推送** - 系统公告、消息模板
- **⚙️ 系统配置** - 参数配置、数据备份、操作日志

### 📱 Android 司机端（待开发）

- 司机登录认证
- 实时订单接收
- GPS 定位打卡
- 导航集成
- 收入统计

---

## 🛠️ 技术栈

### 前端
- **Nuxt 3** - Vue.js 全栈框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Element Plus** - UI 组件库
- **Pinia** - 状态管理
- **SCSS** - CSS 预处理器

### 后端
- **Nitro** - Nuxt 3 内置服务端引擎
- **LocalStorage** - 本地数据持久化（演示模式）

### 地图服务
- 高德地图 API（需自行配置）

---

## 📦 项目结构

```
changanxing/
├── 📁 web/                    # Web 后台管理系统
│   ├── 📁 components/         # 公共组件
│   │   ├── Layout.vue         # 布局组件
│   │   ├── sj-map-picker.vue  # 地图选址组件
│   │   └── sj-map-route.vue   # 路线规划组件
│   ├── 📁 pages/              # 页面
│   │   ├── dashboard.vue      # 数据概览
│   │   ├── orders.vue         # 订单管理
│   │   ├── users.vue          # 用户管理
│   │   ├── vehicles.vue       # 车辆管理
│   │   ├── caiwu.vue          # 财务管理
│   │   ├── baobiao.vue        # 财务报表
│   │   ├── zhineng.vue        # 智能调度
│   │   └── ...
│   ├── 📁 server/api/         # API 接口
│   ├── 📁 stores/             # Pinia 状态管理
│   ├── 📁 utils/              # 工具函数
│   └── 📄 nuxt.config.ts      # Nuxt 配置
│
├── 📁 android/                # Android 司机端（待开发）
│
├── 📁 docs/                   # 项目文档
│   ├── PRD.md                 # 产品需求文档
│   ├── 产品需求文档.md         # 详细需求文档
│   └── modules/               # 模块设计文档
│
└── 📄 README.md               # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd web
npm install
```

### 配置高德地图 API（可选）

1. 前往 [高德地图开放平台](https://lbs.amap.com/) 注册账号
2. 创建新应用，获取 **Key** 和 **SecurityConfig**
3. 在 `web/` 目录下创建 `.env` 文件：

```env
# 高德地图配置
GAODE_KEY=你的高德Key
GAODE_SECURITY_CONFIG=你的安全密钥
```

4. 修改 `nuxt.config.ts` 添加高德地图脚本（如需地图功能）

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

---

## 🗄️ 数据存储说明

### 当前版本（演示模式）

本项目当前使用 **LocalStorage** 进行数据持久化，适用于：
- ✅ 本地开发和测试
- ✅ 小规模车队（< 10辆车）
- ✅ 单机部署场景

**数据存储位置**：浏览器 LocalStorage

### 生产环境建议

对于生产环境，建议迁移到数据库存储：

#### 方案一：MySQL + Prisma（推荐）

1. 安装依赖
```bash
npm install @prisma/client prisma
```

2. 初始化 Prisma
```bash
npx prisma init
```

3. 配置数据库连接（`.env`）
```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/changanxing"
```

4. 定义数据模型（`prisma/schema.prisma`）
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id          Int      @id @default(autoincrement())
  orderNo     String   @unique
  passenger   String
  driver      String?
  startPoint  String
  endPoint    String
  amount      Decimal  @db.Decimal(10, 2)
  status      Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

5. 迁移数据库
```bash
npx prisma migrate dev --name init
```

#### 方案二：SQLite（轻量级）

适合小型部署，无需额外安装数据库服务：

```env
DATABASE_URL="file:./dev.db"
```

#### 方案三：MongoDB

适合需要灵活 Schema 的场景。

---

## 🔑 默认登录信息

- **用户名**: admin
- **密码**: admin

> ⚠️ 生产环境请务必修改默认密码！

---

## 📸 功能截图

> 截图待添加

---

## 🗺️ 开发路线图

- [x] Web 后台管理系统
  - [x] 基础框架搭建
  - [x] 用户管理模块
  - [x] 订单管理模块
  - [x] 车辆管理模块
  - [x] 财务管理模块
  - [x] 智能调度系统
  - [x] 数据导出/备份
  - [ ] 高德地图集成
  - [ ] 数据库存储迁移
  - [ ] 实时数据推送
- [ ] Android 司机端
  - [ ] 登录认证
  - [ ] 订单接收
  - [ ] GPS 定位
  - [ ] 导航集成

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 🔒 安全说明

- 本项目默认使用 LocalStorage 存储数据，请勿在公共环境存储敏感信息
- 生产环境请使用 HTTPS
- 建议添加用户权限管理
- 定期备份数据

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 👨‍💻 作者

**跑滴滴的大姚**

- GitHub: [@dayao1877-oss](https://github.com/dayao1877-oss)
- 项目地址: [https://github.com/dayao1877-oss/changanxing](https://github.com/dayao1877-oss/changanxing)

---

<p align="center">
  如果这个项目对你有帮助，请给个 ⭐ Star！
</p>
