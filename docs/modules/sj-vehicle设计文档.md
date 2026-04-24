# sj-vehicle 车辆管理模块设计文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-vehicle（车辆管理模块）
> 模块编号：SJ-MOD-004

---

## 1. 模块概述

### 1.1 模块描述
sj-vehicle 模块负责长安行系统中的车辆管理功能，包括车辆信息的创建、查询、更新、删除，以及车辆与司机的关联等。

### 1.2 模块职责
- 车辆 CRUD（创建、读取、更新、删除）
- 车辆分页查询和筛选
- 车辆状态管理（启用/禁用）
- 车辆与司机的关联绑定

### 1.3 依赖关系
- 依赖：Prisma ORM（数据库操作）
- 依赖：sj-auth 模块（身份认证）
- 关联表：sj_siji（司机）、sj_dingdan（订单）

---

## 2. 功能设计

### 2.1 功能清单

| 功能编号 | 功能名称 | 功能描述 | 优先级 |
|---------|---------|---------|--------|
| SJ-VEHICLE-001 | 创建车辆 | 添加新的车辆信息 | 高 |
| SJ-VEHICLE-002 | 查询车辆列表 | 分页查询车辆，支持筛选（状态、品牌、是否绑定司机等） | 高 |
| SJ-VEHICLE-003 | 查询车辆详情 | 根据ID查询车辆详细信息 | 高 |
| SJ-VEHICLE-004 | 更新车辆信息 | 更新车辆基本信息 | 中 |
| SJ-VEHICLE-005 | 更新车辆状态 | 修改车辆状态（启用/禁用） | 高 |
| SJ-VEHICLE-006 | 绑定司机 | 将车辆与司机进行绑定 | 高 |
| SJ-VEHICLE-007 | 删除车辆 | 删除车辆记录 | 低 |

---

## 3. 数据结构

### 3.1 使用的数据库表

**车辆表 (sj_cheliang)**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| sj_id | Int | 主键ID |
| sj_chepaihao | String | 车牌号（唯一） |
| sj_pinpai | String? | 品牌 |
| sj_xinghao | String? | 型号 |
| sj_yanse | String? | 颜色 |
| sj_nianfen | Int? | 年份 |
| sj_zhuangtai | Int | 状态（1启用 0禁用） |
| sj_siji_id | Int? | 绑定的司机ID |
| sj_beizhu | String? | 备注 |
| sj_chuangjian_shijian | DateTime | 创建时间 |
| sj_gengxin_shijian | DateTime | 更新时间 |

---

## 4. 接口设计

详细API接口文档请参考：[sj-vehicle API文档](./sj-vehicle-API文档.md)

### 4.1 接口清单

| 接口路径 | 方法 | 功能描述 |
|---------|------|---------|
| /api/sj-vehicle/cheliang | POST | 创建车辆 |
| /api/sj-vehicle/cheliang | GET | 查询车辆列表（分页、筛选） |
| /api/sj-vehicle/cheliang/:id | GET | 查询车辆详情 |
| /api/sj-vehicle/cheliang/:id | PUT | 更新车辆信息 |
| /api/sj-vehicle/cheliang/:id | DELETE | 删除车辆 |
| /api/sj-vehicle/cheliang/:id/status | PATCH | 更新车辆状态 |
| /api/sj-vehicle/cheliang/:id/bind-siji | PATCH | 绑定司机 |

---

## 5. 安全设计

### 5.1 认证要求
所有接口都需要身份认证（携带有效 Token）

### 5.2 数据验证
- 车牌号唯一性检查
- 必填字段验证
- 状态值范围验证

---

## 6. 错误码设计

| 错误码 | 错误信息 | 说明 |
|-------|---------|------|
| SJ-VEHICLE-001 | 参数验证失败 | 请求参数不符合要求 |
| SJ-VEHICLE-002 | 车牌号已存在 | 车牌号重复 |
| SJ-VEHICLE-003 | 车辆不存在 | 找不到指定的车辆 |
| SJ-VEHICLE-004 | 司机不存在 | 绑定的司机不存在 |

---

## 7. 测试计划

### 7.1 单元测试
- 车辆创建、查询、更新、删除功能测试
- 分页查询和筛选功能测试

### 7.2 接口测试
- 按照API文档进行接口测试

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本，添加车辆表和管理模块 |
