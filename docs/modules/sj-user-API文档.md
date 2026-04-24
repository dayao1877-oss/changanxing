# sj-user 用户管理模块 API 文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-user（用户管理模块）
> 基础路径：/api/sj-user

---

## 通用说明

### 认证方式
所有接口都需要在请求头中携带有效的Token：
```
Authorization: Bearer <token>
```

### 统一响应格式

**成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "操作成功",
  "sj_data": {}
}
```

**分页列表响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_list": [],
    "sj_total": 100,
    "sj_page": 1,
    "sj_page_size": 10
  }
}
```

---

## 一、司机管理接口

### 1. 创建司机

**接口路径**：`POST /api/sj-user/siji`

**接口描述**：创建一个新的司机账号

**请求体**：
```json
{
  "sj_bianhao": "SJ002",
  "sj_xingming": "李四",
  "sj_shouji": "13900139000",
  "sj_mima": "123456",
  "sj_shenfenzheng": "110101199002025678",
  "sj_chepaihao": "京B67890",
  "sj_ruzhi_shijian": "2024-02-01T00:00:00.000Z",
  "sj_beizhu": "备注信息"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sj_bianhao | String | 是 | 司机编号（唯一） |
| sj_xingming | String | 是 | 姓名 |
| sj_shouji | String | 是 | 手机号（唯一） |
| sj_mima | String | 是 | 密码 |
| sj_shenfenzheng | String | 否 | 身份证号 |
| sj_chepaihao | String | 否 | 车牌号 |
| sj_ruzhi_shijian | String | 否 | 入职时间（ISO8601格式） |
| sj_beizhu | String | 否 | 备注 |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "创建成功",
  "sj_data": {
    "sj_id": 2,
    "sj_bianhao": "SJ002",
    "sj_xingming": "李四",
    "sj_shouji": "13900139000"
  }
}
```

---

### 2. 查询司机列表

**接口路径**：`GET /api/sj-user/siji`

**接口描述**：分页查询司机列表，支持搜索和筛选

**查询参数**：
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_page | Number | 否 | 1 | 页码 |
| sj_page_size | Number | 否 | 10 | 每页数量 |
| sj_keyword | String | 否 | | 搜索关键词（姓名/手机号/编号） |
| sj_zhuangtai | Number | 否 | | 状态筛选（1正常 0禁用） |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_list": [
      {
        "sj_id": 1,
        "sj_bianhao": "SJ001",
        "sj_xingming": "张三",
        "sj_shouji": "13800138000",
        "sj_chepaihao": "京A12345",
        "sj_zhuangtai": 1,
        "sj_chuangjian_shijian": "2024-01-01T00:00:00.000Z"
      }
    ],
    "sj_total": 1,
    "sj_page": 1,
    "sj_page_size": 10
  }
}
```

---

### 3. 查询司机详情

**接口路径**：`GET /api/sj-user/siji/:id`

**接口描述**：根据ID查询司机的详细信息

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 司机ID |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_bianhao": "SJ001",
    "sj_xingming": "张三",
    "sj_shouji": "13800138000",
    "sj_shenfenzheng": "110101199001011234",
    "sj_chepaihao": "京A12345",
    "sj_zhuangtai": 1,
    "sj_ruzhi_shijian": "2024-01-01T00:00:00.000Z",
    "sj_beizhu": "备注",
    "sj_chuangjian_shijian": "2024-01-01T00:00:00.000Z",
    "sj_gengxin_shijian": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 更新司机信息

**接口路径**：`PUT /api/sj-user/siji/:id`

**接口描述**：更新司机的基本信息（不包括密码和状态）

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 司机ID |

**请求体**：
```json
{
  "sj_xingming": "张三",
  "sj_shenfenzheng": "110101199001011234",
  "sj_chepaihao": "京A12345",
  "sj_ruzhi_shijian": "2024-01-01T00:00:00.000Z",
  "sj_beizhu": "更新的备注"
}
```

---

### 5. 更新司机状态

**接口路径**：`PATCH /api/sj-user/siji/:id/status`

**接口描述**：启用或禁用司机账号

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 司机ID |

**请求体**：
```json
{
  "sj_zhuangtai": 0
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sj_zhuangtai | Number | 是 | 状态（1启用 0禁用） |

---

### 6. 重置司机密码

**接口路径**：`PATCH /api/sj-user/siji/:id/password`

**接口描述**：重置司机的登录密码

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 司机ID |

**请求体**：
```json
{
  "sj_mima": "newpassword123"
}
```

---

## 二、乘客管理接口

### 7. 创建乘客

**接口路径**：`POST /api/sj-user/chengke`

**接口描述**：创建一个新的乘客账号

**请求体**：
```json
{
  "sj_xingming": "王五",
  "sj_shouji": "13700137000",
  "sj_gongsi_mingcheng": "某公司",
  "sj_beizhu": "备注"
}
```

---

### 8. 查询乘客列表

**接口路径**：`GET /api/sj-user/chengke`

**接口描述**：分页查询乘客列表，支持搜索

**查询参数**：
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_page | Number | 否 | 1 | 页码 |
| sj_page_size | Number | 否 | 10 | 每页数量 |
| sj_keyword | String | 否 | | 搜索关键词（姓名/手机号） |

---

### 9. 查询乘客详情

**接口路径**：`GET /api/sj-user/chengke/:id`

---

### 10. 更新乘客信息

**接口路径**：`PUT /api/sj-user/chengke/:id`

**请求体**：
```json
{
  "sj_xingming": "王五",
  "sj_gongsi_mingcheng": "更新的公司名",
  "sj_beizhu": "更新的备注"
}
```

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
