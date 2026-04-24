# sj-order 订单管理模块设计文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-order（订单管理模块）
> 模块编号：SJ-MOD-003

---

## 1. 模块概述

### 1.1 模块描述
sj-order 模块负责长安行系统中的订单管理功能，包括订单创建、查询、更新状态、指派司机等。

### 1.2 模块职责
- 订单 CRUD（创建、读取、更新）
- 订单状态管理（待接单、进行中、已完成、已取消等）
- 订单分页查询和筛选
- 司机指派
- 订单详情展示

### 1.3 依赖关系
- 依赖：Prisma ORM（数据库操作）
- 依赖：sj-auth 模块（身份认证）
- 关联表：sj_siji（司机）、sj_chengke（乘客）

---

## 2. 功能设计

### 2.1 功能清单

| 功能编号 | 功能名称 | 功能描述 | 优先级 |
|---------|---------|---------|--------|
| SJ-ORDER-001 | 创建订单 | 创建新订单 | 高 |
| SJ-ORDER-002 | 查询订单列表 | 分页查询订单，支持筛选（状态、司机、乘客等） | 高 |
| SJ-ORDER-003 | 查询订单详情 | 根据ID查询订单详细信息 | 高 |
| SJ-ORDER-004 | 更新订单信息 | 更新订单基本信息 | 中 |
| SJ-ORDER-005 | 更新订单状态 | 修改订单状态（待接单→进行中→已完成等） | 高 |
| SJ-ORDER-006 | 指派司机 | 将订单指派给特定司机 | 高 |

---

## 3. 数据结构

### 3.1 使用的数据库表

**订单表 (sj_dingdan)**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| sj_id | Int | 主键ID |
| sj_dingdan_hao | String | 订单号（唯一） |
| sj_siji_id | Int? | 司机ID |
| sj_chengke_id | Int? | 乘客ID |
| sj_shifadi_dizhi | String? | 出发地地址 |
| sj_shifadi_weizhi | String? | 出发地经纬度 |
| sj_mudedi_dizhi | String? | 目的地地址 |
| sj_mudedi_weizhi | String? | 目的地经纬度 |
| sj_tujingdian | String? | 途经点 |
| sj_licheng_shi | Decimal? | 实际里程 |
| sj_licheng_zhong | Decimal? | 预计里程 |
| sj_xingshi_licheng | Decimal? | 行驶里程 |
| sj_jine | Decimal? | 订单金额 |
| sj_siji_ticheng | Decimal? | 司机提成 |
| sj_zhuangtai | Int | 订单状态（0-待接单 1-进行中 2-已完成 3-已取消） |
| sj_laiyuan | Int | 订单来源 |
| sj_beizhu | String? | 备注 |
| sj_kaishi_shijian | DateTime? | 开始时间 |
| sj_wancheng_shijian | DateTime? | 完成时间 |
| sj_chuangjian_ren | Int? | 创建人 |
| sj_chuangjian_shijian | DateTime | 创建时间 |
| sj_gengxin_shijian | DateTime | 更新时间 |

---

## 4. 接口设计

详细API接口文档请参考：[sj-order API文档](./sj-order-API文档.md)

### 4.1 接口清单

| 接口路径 | 方法 | 功能描述 |
|---------|------|---------|
| /api/sj-order/dingdan | POST | 创建订单 |
| /api/sj-order/dingdan | GET | 查询订单列表（分页、筛选） |
| /api/sj-order/dingdan/:id | GET | 查询订单详情 |
| /api/sj-order/dingdan/:id | PUT | 更新订单信息 |
| /api/sj-order/dingdan/:id/status | PATCH | 更新订单状态 |
| /api/sj-order/dingdan/:id/assign | PATCH | 指派司机 |

---

## 5. 安全设计

### 5.1 认证要求
所有接口都需要身份认证（携带有效 Token）

### 5.2 数据验证
- 订单号唯一性检查
- 必填字段验证
- 状态值范围验证

---

## 6. 错误码设计

| 错误码 | 错误信息 | 说明 |
|-------|---------|------|
| SJ_ORDER_001 | 参数验证失败 | 请求参数不符合要求 |
| SJ_ORDER_002 | 订单号已存在 | 订单号重复 |
| SJ_ORDER_003 | 订单不存在 | 找不到指定订单 |
| SJ_ORDER_004 | 司机不存在 | 指派的司机不存在 |

---

## 7. 测试计划

### 7.1 单元测试
- 订单创建、查询、更新功能测试
- 分页查询和筛选功能测试

### 7.2 接口测试
- 按照API文档进行接口测试

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
