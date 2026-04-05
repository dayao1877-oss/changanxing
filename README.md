# 长安行 - 旅行服务预约系统

旅游包车、导游、摄影一体化服务预约

## 项目简介

长安行是一个为西安旅行者提供一站式服务的预约系统，包括：
- 🚗 包车服务（SUV / 商务车）
- 🎫 门票预订
- 📸 行程定制与跟拍
- 🤖 AI 智能客服

## 技术栈

### 前端
- React 19 + TypeScript
- Vite 6
- TailwindCSS 4
- Motion (动画)
- Lucide React (图标)

### 后端
- Node.js + Express
- MySQL 8.0
- JWT 认证
- Multer (文件上传)

### AI 服务
- DeepSeek API

## 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env.local`，并填写配置：
```bash
cp .env.example .env.local
```

### 运行开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 后台管理

访问 http://localhost:3000/admin/login

默认账号：
- 手机号：18091827305
- 密码：123456

## 项目结构

```
src/
├── components/     # 组件
├── layouts/        # 布局
├── pages/          # 页面
├── routes/         # 路由
├── config/         # 配置
├── middleware/     # 中间件
└── utils/          # 工具函数

docs/
├── admin-panel-requirements.md    # 后台需求
├── database-admin-init.sql        # 数据库初始化
└── daily-report-*.md              # 开发日报
```

## 功能特性

### 已实现
- ✅ 管理员登录认证
- ✅ 司机管理（增删改查）
- ✅ 车辆管理（增删改查）
- ✅ 首页配置管理
- ✅ 图片上传功能
- ✅ AI 智能客服
- ✅ 响应式设计

### 开发中
- 🔴 订单管理
- 🔴 档期日历
- 🔴 摄影作品管理

## 部署

### 数据库初始化
```bash
mysql -u root -p < docs/database-admin-init.sql
```

### 生产环境构建
```bash
npm run build
```

## 许可证

MIT License

## 联系方式

- 姚师傅：18091827305
- 微信：lovconky
