# sj-jujue 拒绝记录模块 设计文档

---

## 1. 功能说明
sj-jujue 模块负责管理司机拒绝订单的记录，包括：
- 记录司机拒绝订单的原因和详细说明
- 记录拒绝时的位置信息
- 记录拒绝时间
- 提供查询功能（按订单、按司机）
- 处理状态管理

---

## 2. 数据结构
### 数据表：sj_jujue_jilu
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_id | Int | 是 | AUTO_INCREMENT | 主键ID |
| sj_dingdan_id | Int | 是 | - | 订单ID |
| sj_siji_id | Int | 是 | - | 司机ID |
| sj_jujue_yuanyin | String(50) | 否 | NULL | 拒绝原因 |
| sj_xiangxi_shuoming | Text | 否 | NULL | 详细说明 |
| sj_shijian | DateTime | 是 | CURRENT_TIMESTAMP | 拒绝时间 |
| sj_weizhi | String(100) | 否 | NULL | 位置（经纬度） |
| sj_chuli_zhuangtai | Int | 是 | 0 | 处理状态（0待处理，1已处理） |
| sj_chuangjian_shijian | DateTime | 是 | CURRENT_TIMESTAMP | 创建时间 |

---

## 3. API接口列表

| 接口名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| 提交拒绝 | POST | /api/sj-jujue/tijiao | 提交拒绝记录 |
| 查询订单拒绝记录 | GET | /api/sj-jujue/dingdan/{dingdanId} | 查询指定订单的所有拒绝记录 |
| 查询司机拒绝记录 | GET | /api/sj-jujue/siji/{sijiId} | 查询指定司机的所有拒绝记录 |
| 查询单个拒绝详情 | GET | /api/sj-jujue/{id} | 查询单个拒绝记录详情 |
| 更新处理状态 | PATCH | /api/sj-jujue/{id}/chuli | 更新拒绝记录的处理状态 |

---

## 4. 处理状态说明
| 状态值 | 说明 |
|--------|------|
| 0 | 待处理 |
| 1 | 已处理 |

---

## 5. 依赖关系
- 依赖 sj-order 模块（订单存在性验证）
- 依赖 sj-user 模块（司机存在性验证）
- 依赖 sj-auth 模块（身份认证）

---

## 修订记录
| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
