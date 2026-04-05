# AI 服务切换方案 - Gemini → DeepSeek

## 📋 变更说明

**变更日期**: 2026-03-23  
**提出人**: 用户  
**原因**: 国内访问 Gemini API 不方便，改用 DeepSeek API

---

## 🎯 技术选型对比

### DeepSeek API 优势
✅ **国内可用** - 无需代理，访问速度快  
✅ **中文支持好** - 对中文理解更准确  
✅ **成本更低** - 相比 Gemini 更有价格优势  
✅ **API 简洁** - 易于集成和使用  
✅ **功能强大** - 支持对话、文本生成等多种能力  

### 可能的挑战
⚠️ **生态差异** - 需要从 Google 生态切换到 DeepSeek  
⚠️ **文档完善度** - 相比 Google 文档可能不够完善  
⚠️ **长期稳定性** - 需要观察服务稳定性  

---

## 🔧 需要修改的地方

### 1. 环境变量配置

**文件**: `.env.example`, `.env.local`

```bash
# 替换前
GEMINI_API_KEY="xxx"

# 替换后
DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxx"
```

### 2. package.json 依赖

**建议保留** `@google/genai` 作为备用方案，同时添加 DeepSeek SDK（如有）或直接使用 HTTP 调用。

### 3. 代码层面

需要修改所有调用 AI API 的地方：

```typescript
// 原 Gemini 调用方式
import { GoogleGenerativeAI } from '@google/genai';

// 新 DeepSeek 调用方式
// 方式 1: 使用官方 SDK（如果有）
// 方式 2: 直接 HTTP 调用
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [...]
  })
});
```

### 4. vite.config.ts

```typescript
// 替换前
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),

// 替换后
'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
```

---

## 📝 DeepSeek API 使用指南

### 获取 API Key

1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入控制台创建 API Key
4. 复制保存（只显示一次）

### API 调用示例

#### 基础对话

```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_API_KEY`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是一个旅行助手' },
      { role: 'user', content: '推荐西安的景点' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

#### 流式响应

```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_API_KEY`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [...],
    stream: true
  })
});

const reader = response.body.getReader();
// 处理流式数据...
```

---

## 🗺️ 迁移步骤

### 阶段 1: 准备工作
- [ ] 注册 DeepSeek 账号
- [ ] 获取 API Key
- [ ] 测试 API 连通性
- [ ] 了解定价策略

### 阶段 2: 本地开发
- [ ] 更新 `.env.local` 配置
- [ ] 修改 API 调用代码
- [ ] 本地测试功能
- [ ] 验证响应质量

### 阶段 3: 全面替换
- [ ] 更新所有 AI 相关功能
- [ ] 完整测试
- [ ] 性能对比测试
- [ ] 部署上线

### 阶段 4: 监控优化
- [ ] 监控 API 调用成功率
- [ ] 收集用户反馈
- [ ] 优化 prompt 和参数
- [ ] 成本控制

---

## 💰 成本估算

### DeepSeek 定价（参考）
- **输入**: ¥X / 1K tokens
- **输出**: ¥Y / 1K tokens

### 预估用量
按小程序规模估算：
- 日活用户：1000 人
- 人均调用：5 次/天
- 平均 token：500 tokens/次

**月成本预估**: ¥XXX - ¥XXX

---

## 📊 功能映射表

| Gemini 功能 | DeepSeek 对应功能 | 状态 |
|------------|------------------|------|
| 文本对话 | deepseek-chat | ✅ 支持 |
| 文本生成 | deepseek-chat | ✅ 支持 |
| 代码生成 | deepseek-chat | ✅ 支持 |
| 多模态 | 待确认 | ⏳ 需调研 |

---

## 🔍 注意事项

1. **API 限流**: DeepSeek 可能有速率限制，注意控制调用频率
2. **错误处理**: 实现完善的错误处理和重试机制
3. **Token 计算**: 注意输入输出的 token 统计
4. **数据安全**: 不要将敏感信息发送给 AI
5. **备份方案**: 保留 Gemini 作为备选方案

---

## 📞 负责人

- **技术方案**: AI 工程师
- **实施执行**: 前端工程师 + 后端工程师
- **测试验证**: 测试工程师
- **进度监督**: 项目经理

---

## ⏰ 时间计划

- **Day 1**: 完成技术调研和环境配置
- **Day 2-3**: 代码修改和本地测试
- **Day 4**: 完整功能测试
- **Day 5**: 部署上线

---

> **备注**: 具体实施细节请参考 DeepSeek 官方文档：https://platform.deepseek.com/docs
