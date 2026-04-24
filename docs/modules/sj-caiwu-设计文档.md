# sj-caiwu 财务记录模块 设计文档

---

## 1. 功能说明
sj-caiwu 模块负责管理系统中的财务记录，包括：
- 记录财务交易（订单相关或独立）
- 记录交易金额、类型和状态
- 查询订单、司机、乘客的财务记录
- 查询单个财务记录详情
- 更新财务记录状态

---

## 2. 数据结构
### 数据表：sj_caiwu_jilu
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_id | Int | 是 | AUTO_INCREMENT | 主键ID |
| sj_dingdan_id | Int | 否 | NULL | 订单ID（可选） |
| sj_siji_id | Int | 否 | NULL | 司机ID |
| sj_chengke_id | Int | 否 | NULL | 乘客ID |
| sj_jine | Decimal(10,2) | 是 | 0.00 | 金额 |
| sj_leixing | String(20) | 是 | 'shoukuan' | 交易类型（收款/付款） |
| sj_zhuangtai | String(20) | 是 | 'wancheng' | 状态（待确认/完成/失败） |
| sj_shijian | DateTime | 是 | CURRENT_TIMESTAMP | 交易时间 |
| sj_beizhu | String(200) | 否 | NULL | 备注 |

---

## 3. API接口列表

| 接口名 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 添加财务记录 | POST | `/api/sj-caiwu/tianjia` | 添加新财务记录 |
| 查询单个记录详情 | GET | `/api/sj-caiwu/[id]` | 查询财务记录详情 |
| 查询订单财务记录 | GET | `/api/sj-caiwu/dingdan/[dingdanId]` | 查询订单相关财务记录 |
| 查询司机财务记录 | GET | `/api/sj-caiwu/siji/[sijiId]` | 查询司机相关财务记录 |
| 查询乘客财务记录 | GET | `/api/sj-caiwu/chengke/[chengkeId]` | 查询乘客相关财务记录 |
| 更新状态 | PATCH | `/api/sj-caiwu/[id]/zhuangtai` | 更新财务记录状态 |

---

## 4. 字段说明
- sj_leixing: 'shoukuan'（收款）或 'fukuan'（付款）
- sj_zhuangtai: 'daiqueren'（待确认）、'wancheng'（完成）、'shibai'（失败）

---

## 5. 依赖关系
- 依赖 sj-user 模块（司机/乘客存在性验证）
- 依赖 sj-order 模块（订单存在性验证）
- 依赖 sj-auth 模块（身份认证）

---

## 修订记录
| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
