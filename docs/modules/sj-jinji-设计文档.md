# sj-jinji 紧急事件模块 设计文档

---

## 1. 功能说明
sj-jinji 模块负责管理司机触发的紧急事件，包括：
- 提交紧急事件（包含触发时间、位置、图片、录音）
- 查询订单紧急事件记录
- 查询司机紧急事件记录
- 查询单个紧急事件详情
- 更新处理状态（处理人、处理结果、解除时间、解除方式）
- 记录备注信息

---

## 2. 数据结构
### 数据表：sj_jinji_shijian
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_id | Int | 是 | AUTO_INCREMENT | 主键ID |
| sj_siji_id | Int | 是 | - | 司机ID |
| sj_dingdan_id | Int | 否 | NULL | 订单ID（可选） |
| sj_chufa_shijian | DateTime | 是 | - | 触发时间 |
| sj_weizhi | String(100) | 否 | NULL | 位置（经纬度） |
| sj_tupian_lujing | String | 否 | NULL | 图片路径 |
| sj_luyin_lujing | String(200) | 否 | NULL | 录音路径 |
| sj_jiechu_shijian | DateTime | 否 | NULL | 解除时间 |
| sj_jiechu_fangshi | String(20) | 否 | NULL | 解除方式 |
| sj_chuli_ren | Int | 否 | NULL | 处理人ID |
| sj_chuli_jieguo | String | 否 | NULL | 处理结果 |
| sj_beizhu | String | 否 | NULL | 备注 |

---

## 3. API接口列表

| 接口名 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 提交紧急事件 | POST | `/api/sj-jinji/chufa` | 提交触发的紧急事件 |
| 查询订单紧急事件 | GET | `/api/sj-jinji/dingdan/[dingdanId]` | 查询订单的紧急事件 |
| 查询司机紧急事件 | GET | `/api/sj-jinji/siji/[sijiId]` | 查询司机的紧急事件 |
| 查询单个紧急事件详情 | GET | `/api/sj-jinji/[id]` | 查询单个紧急事件详情 |
| 更新处理状态 | PATCH | `/api/sj-jinji/[id]/chuli` | 更新紧急事件处理状态 |
| 解除紧急事件 | PATCH | `/api/sj-jinji/[id]/jiechu` | 解除紧急事件 |

---

## 4. 依赖关系
- 依赖 sj-order 模块（订单存在性验证，可选）
- 依赖 sj-user 模块（司机存在性验证）
- 依赖 sj-auth 模块（身份认证）

---

## 修订记录
| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
