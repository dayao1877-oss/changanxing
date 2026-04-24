# sj-caozuo 操作日志模块 设计文档

---

## 1. 功能说明
sj-caozuo 模块负责管理系统的操作日志，包括：
- 记录操作日志
- 查询单个操作日志详情
- 查询模块的操作日志
- 查询操作者的操作日志
- 查询时间段的操作日志

---

## 2. 数据结构
### 数据表：sjCaozuoRizhi
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_id | Int | 是 | AUTO_INCREMENT | 主键ID |
| sj_mokuai | String(50) | 是 | - | 模块名 |
| sj_caozuo | String(100) | 是 | - | 操作内容 |
| sj_caozuozhe_id | Int | 否 | NULL | 操作者ID |
| sj_ip | String(50) | 否 | NULL | 操作者IP |
| sj_shijian | DateTime | 是 | CURRENT_TIMESTAMP | 操作时间 |
| sj_shuju | Text | 否 | NULL | 相关数据（JSON格式） |

---

## 3. API接口列表

| 接口名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| 添加操作日志 | POST | `/api/sj-caozuo/tianjia` | 添加新的操作日志 |
| 查询单个操作日志 | GET | `/api/sj-caozuo/[id]` | 查询单个操作日志详情 |
| 查询模块的操作日志 | GET | `/api/sj-caozuo/mokuai/[mokuaiName]` | 查询指定模块的操作日志 |
| 查询操作者的操作日志 | GET | `/api/sj-caozuo/caozuozhe/[caozuozheId]` | 查询指定操作者的操作日志 |
| 查询时间段的操作日志 | GET | `/api/sj-caozuo/shijian` | 查询指定时间段的操作日志 |

---

## 4. 依赖关系
- 依赖 sj-auth 模块（身份认证）

---

## 修订记录
| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
