# sj-yichang 异常上报模块 设计文档

---

## 1. 功能说明
sj-yichang 模块负责管理司机上报的异常情况，包括：
- 提交异常上报（包含类型、描述、图片、位置）
- 查询订单异常记录
- 查询司机异常记录
- 查询单个异常详情
- 更新处理状态（待处理→处理中→已处理）
- 分配处理人
- 记录处理方案

---

## 2. 数据结构
### 数据表：sj_yichang_shangbao
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_id | Int | 是 | AUTO_INCREMENT | 主键ID |
| sj_dingdan_id | Int | 否 | NULL | 订单ID（可选） |
| sj_siji_id | Int | 是 | - | 司机ID |
| sj_yichang_leixing | String(50) | 是 | - | 异常类型 |
| sj_xiangxi_miaoshu | String | 是 | - | 详细描述 |
| sj_tupian_lujing | String | 否 | NULL | 图片路径 |
| sj_weizhi | String(100) | 否 | NULL | 位置（经纬度） |
| sj_shangbao_shijian | DateTime | 是 | CURRENT_TIMESTAMP | 上报时间 |
| sj_chuli_zhuangtai | Int | 是 | 0 | 处理状态（0待处理 1处理中 2已处理） |
| sj_chuli_ren | Int | 否 | NULL | 处理人ID |
| sj_chuli_fangan | String | 否 | NULL | 处理方案 |
| sj_chuli_shijian | DateTime | 否 | NULL | 处理时间 |
| sj_beizhu | String | 否 | NULL | 备注 |

---

## 3. API接口列表

| 接口名 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 提交异常 | POST | `/api/sj-yichang/shangbao` | 提交异常上报 |
| 查询订单异常 | GET | `/api/sj-yichang/dingdan/{dingdanId}` | 查询订单的异常记录 |
| 查询司机异常 | GET | `/api/sj-yichang/siji/{sijiId}` | 查询司机的异常记录 |
| 查询单个异常详情 | GET | `/api/sj-yichang/{id}` | 查询单个异常详情 |
| 更新处理状态 | PATCH | `/api/sj-yichang/{id}/chuli` | 更新异常处理状态 |

---

## 4. 处理状态说明
| 状态值 | 说明 |
|--------|------|
| 0 | 待处理 |
| 1 | 处理中 |
| 2 | 已处理 |

---

## 5. 依赖关系
- 依赖 sj-order 模块（订单存在性验证，可选）
- 依赖 sj-user 模块（司机存在性验证）
- 依赖 sj-auth 模块（身份认证）

---

## 修订记录
| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
