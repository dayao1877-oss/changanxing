/**
 * 车辆管理 API 路由
 */

import express from 'express';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/vehicles - 获取车辆列表（关联司机信息）
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vehicles = await db.getAll(`
      SELECT v.*, d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      ORDER BY v.created_at DESC
    `);
    
    // 解析图片 JSON
    const formattedVehicles = vehicles.map((v: any) => ({
      ...v,
      images: typeof v.images === 'string' ? JSON.parse(v.images) : v.images
    }));
    
    res.json({ 
      success: true, 
      data: formattedVehicles 
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/admin/vehicles - 创建车辆
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { plate_number, type, brand_model, seats, color, daily_price, driver_id, images } = req.body;
    
    // 数据验证
    if (!plate_number || !type || !brand_model || !seats || !daily_price) {
      return res.status(400).json({ error: '车牌号、车型、品牌型号、座位数和日租金必填' });
    }
    
    // 检查车牌号是否已存在
    const existing = await db.getOne(
      'SELECT id FROM vehicles WHERE plate_number = ?',
      [plate_number]
    );
    
    if (existing) {
      return res.status(400).json({ error: '该车牌号已被使用' });
    }
    
    // 验证司机是否存在
    if (driver_id) {
      const driver = await db.getOne('SELECT id FROM drivers WHERE id = ?', [driver_id]);
      if (!driver) {
        return res.status(400).json({ error: '指定的司机不存在' });
      }
    }
    
    // 插入数据库
    const id = await db.insert(
      `INSERT INTO vehicles (plate_number, type, brand_model, seats, color, daily_price, driver_id, images, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [plate_number, type, brand_model, seats, color, daily_price, driver_id, JSON.stringify(images || [])]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'create_vehicle', 'vehicle_management', { id, plate_number }]
    );
    
    res.json({ 
      success: true, 
      message: '车辆创建成功',
      data: { id }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: '创建失败' });
  }
});

/**
 * PUT /api/admin/vehicles/:id - 更新车辆信息
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_number, type, brand_model, seats, color, daily_price, driver_id, images, is_available } = req.body;
    
    // 验证车辆是否存在
    const vehicle = await db.getOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) {
      return res.status(404).json({ error: '车辆不存在' });
    }
    
    // 检查车牌号是否与其他车辆重复
    const existing = await db.getOne(
      'SELECT id FROM vehicles WHERE plate_number = ? AND id != ?',
      [plate_number, id]
    );
    
    if (existing) {
      return res.status(400).json({ error: '该车牌号已被其他车辆使用' });
    }
    
    // 验证司机是否存在
    if (driver_id) {
      const driver = await db.getOne('SELECT id FROM drivers WHERE id = ?', [driver_id]);
      if (!driver) {
        return res.status(400).json({ error: '指定的司机不存在' });
      }
    }
    
    // 更新数据库
    await db.update(
      `UPDATE vehicles SET 
        plate_number = ?, type = ?, brand_model = ?, seats = ?, 
        color = ?, daily_price = ?, driver_id = ?, images = ?, is_available = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [plate_number, type, brand_model, seats, color, daily_price, driver_id, JSON.stringify(images || []), is_available, id]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'update_vehicle', 'vehicle_management', { id, changes: req.body }]
    );
    
    res.json({ 
      success: true, 
      message: '车辆信息已更新'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

/**
 * DELETE /api/admin/vehicles/:id - 删除车辆（逻辑删除）
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证车辆是否存在
    const vehicle = await db.getOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) {
      return res.status(404).json({ error: '车辆不存在' });
    }
    
    // 逻辑删除：设置 is_available = false
    await db.update(
      'UPDATE vehicles SET is_available = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'delete_vehicle', 'vehicle_management', { id }]
    );
    
    res.json({ 
      success: true, 
      message: '车辆已删除'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
