# 后端工程师工作任务单

**优先级**: P0 - 紧急重要  
**截止时间**: 今天下午 18:00  
**状态**: 🔴 进行中 (70%)

---

## 📋 任务清单

### 1. 司机管理 API

**当前进度**: 50%  
**需要实现**:

```typescript
// GET /api/admin/drivers - 获取司机列表
router.get('/drivers', authMiddleware, async (req, res) => {
  try {
    const drivers = await db.getAll('SELECT * FROM drivers ORDER BY sort_order');
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/admin/drivers - 创建司机
router.post('/drivers', authMiddleware, async (req, res) => {
  try {
    const { name, phone, wechat, experience_years, description, avatar_url } = req.body;
    
    // TODO: 数据验证（使用 Joi）
    
    const id = await db.insert(
      'INSERT INTO drivers (name, phone, wechat, experience_years, description, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone, wechat, experience_years, description, avatar_url]
    );
    
    res.json({ success: true, message: '司机创建成功', data: { id } });
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

// PUT /api/admin/drivers/:id - 更新司机
// DELETE /api/admin/drivers/:id - 删除司机（逻辑删除）
```

**产出物**: `src/routes/admin-drivers.ts`

---

### 2. 车辆管理 API

**当前进度**: 30%  
**需要实现**:

```typescript
// GET /api/admin/vehicles - 车辆列表（关联司机信息）
router.get('/vehicles', authMiddleware, async (req, res) => {
  try {
    const vehicles = await db.getAll(`
      SELECT v.*, d.name as driver_name 
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      ORDER BY v.created_at DESC
    `);
    
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/admin/vehicles - 创建车辆
router.post('/vehicles', authMiddleware, async (req, res) => {
  try {
    const { plate_number, type, brand_model, seats, color, daily_price, driver_id, images } = req.body;
    
    // TODO: 数据验证
    
    const id = await db.insert(
      'INSERT INTO vehicles (plate_number, type, brand_model, seats, color, daily_price, driver_id, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [plate_number, type, brand_model, seats, color, daily_price, driver_id, JSON.stringify(images)]
    );
    
    res.json({ success: true, message: '车辆创建成功', data: { id } });
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

// PUT /api/admin/vehicles/:id - 更新车辆
// DELETE /api/admin/vehicles/:id - 删除车辆
```

**产出物**: `src/routes/admin-vehicles.ts`

---

### 3. 档期查询 API

**当前进度**: 0%  
**需要实现**:

```typescript
// GET /api/admin/schedule/:date - 查询某日期的档期
router.get('/schedule/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    
    const schedule = await db.getAll(`
      SELECT sd.*, v.type as vehicle_type, v.brand_model, d.name as driver_name
      FROM service_dates sd
      JOIN vehicles v ON sd.vehicle_id = v.id
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE sd.date = ?
    `, [date]);
    
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/admin/schedule/:date - 设置日期状态
router.put('/schedule/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const { vehicle_id, status, notes } = req.body;
    
    await db.update(
      `INSERT INTO service_dates (date, vehicle_id, status, notes) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, notes = ?`,
      [date, vehicle_id, status, notes, status, notes]
    );
    
    res.json({ success: true, message: '档期已更新' });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});
```

**产出物**: `src/routes/admin-schedule.ts`

---

### 4. 订单管理 API

**当前进度**: 0%  
**需要实现**:

```typescript
// GET /api/admin/orders - 订单列表（带筛选）
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status, date_from, date_to, vehicle_type } = req.query;
    
    let sql = `
      SELECT o.*, v.type as vehicle_type, v.plate_number, d.name as driver_name
      FROM orders o
      JOIN vehicles v ON o.vehicle_id = v.id
      JOIN drivers d ON o.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (date_from) {
      sql += ' AND o.service_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND o.service_date <= ?';
      params.push(date_to);
    }
    
    const orders = await db.getAll(sql, params);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/admin/orders/:id/status - 更新订单状态
router.put('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    await db.update(
      'UPDATE orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?',
      [status, admin_notes, id]
    );
    
    res.json({ success: true, message: '订单状态已更新' });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});
```

**产出物**: `src/routes/admin-orders.ts`

---

### 5. 数据验证层

**当前进度**: 0%  
**需要使用**: Joi 或 Zod

```typescript
// src/validators/driver.validator.ts
import Joi from 'joi';

export const driverValidator = Joi.object({
  name: Joi.string().required().min(2).max(50),
  phone: Joi.string().pattern(/^[1]\d{10}$/).required(),
  wechat: Joi.string().max(50),
  experience_years: Joi.number().min(0).max(50),
  description: Joi.string().max(1000),
  avatar_url: Joi.string().uri()
});
```

**产出物**: `src/validators/*.ts`

---

## ⏰ 时间安排

**上午** (9:00-12:00):
- [x] 安装依赖（mysql2, jsonwebtoken, bcryptjs, joi）✅
- [x] 数据库配置 ✅
- [x] JWT 认证中间件 ✅
- [x] 登录 API 更新 ✅
- [ ] 司机管理 API (剩余 50%)

**下午** (14:00-18:00):
- [ ] 车辆管理 API (14:00-15:30)
- [ ] 档期管理 API (15:30-16:30)
- [ ] 订单管理 API (16:30-17:30)
- [ ] 集成测试和文档 (17:30-18:00)

---

## 🔧 技术要点

### 数据库连接池
确保连接池配置正确，避免连接泄漏

### 事务处理
订单相关操作需要使用事务：
```typescript
const connection = await db.pool.getConnection();
try {
  await connection.beginTransaction();
  // 多个数据库操作
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### 错误处理
统一的错误响应格式：
```typescript
{
  success: false,
  error: '错误信息',
  code: 'ERROR_CODE'
}
```

### 日志记录
所有管理操作记录到 `admin_logs` 表

---

## 📞 需要协作的成员

- @前端工程师：API 接口格式是否满足前端需求？
- @产品经理：业务流程是否理解正确？
- @AI 工程师：FAQ 数据如何同步到 DeepSeek？

---

## ✅ 交付标准

1. ✅ 所有 API 通过 Postman 测试
2. ✅ 代码有完整的注释
3. ✅ 错误处理完善
4. ✅ 性能优化（使用连接池、索引）
5. ✅ 安全加固（SQL 注入防护、XSS 防护）

---

**负责人**: 后端工程师  
**监督人**: 项目经理  
**最后更新**: 2026-03-23 11:30
