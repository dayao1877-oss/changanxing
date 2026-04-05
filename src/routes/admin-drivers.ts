/**
 * 司机管理 API 路由
 */

import express from 'express';
import db from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/drivers - 获取司机列表
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const drivers = await db.getAll(`
      SELECT * FROM drivers 
      ORDER BY sort_order ASC, created_at DESC
    `);
    
    res.json({ 
      success: true, 
      data: drivers 
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/admin/drivers - 创建司机
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, wechat, experience_years, description, avatar_url } = req.body;
    
    // 数据验证
    if (!name || !phone) {
      return res.status(400).json({ error: '姓名和电话必填' });
    }
    
    // 检查手机号是否已存在
    const existing = await db.getOne(
      'SELECT id FROM drivers WHERE phone = ?',
      [phone]
    );
    
    if (existing) {
      return res.status(400).json({ error: '该手机号已被使用' });
    }
    
    // 插入数据库
    const id = await db.insert(
      `INSERT INTO drivers (name, phone, wechat, experience_years, description, avatar_url, is_visible, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM drivers))`,
      [name, phone, wechat, experience_years, description, avatar_url]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'create_driver', 'driver_management', { id, name }]
    );
    
    res.json({ 
      success: true, 
      message: '司机创建成功',
      data: { id }
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: '创建失败' });
  }
});

/**
 * PUT /api/admin/drivers/:id - 更新司机信息
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, wechat, experience_years, description, avatar_url, is_visible, sort_order } = req.body;
    
    // 验证司机是否存在
    const driver = await db.getOne('SELECT * FROM drivers WHERE id = ?', [id]);
    if (!driver) {
      return res.status(404).json({ error: '司机不存在' });
    }
    
    // 检查手机号是否与其他司机重复
    const existing = await db.getOne(
      'SELECT id FROM drivers WHERE phone = ? AND id != ?',
      [phone, id]
    );
    
    if (existing) {
      return res.status(400).json({ error: '该手机号已被其他司机使用' });
    }
    
    // 更新数据库
    await db.update(
      `UPDATE drivers SET 
        name = ?, phone = ?, wechat = ?, experience_years = ?, 
        description = ?, avatar_url = ?, is_visible = ?, sort_order = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [name, phone, wechat, experience_years, description, avatar_url, is_visible, sort_order, id]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'update_driver', 'driver_management', { id, changes: req.body }]
    );
    
    res.json({ 
      success: true, 
      message: '司机信息已更新'
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

/**
 * DELETE /api/admin/drivers/:id - 删除司机（逻辑删除）
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证司机是否存在
    const driver = await db.getOne('SELECT * FROM drivers WHERE id = ?', [id]);
    if (!driver) {
      return res.status(404).json({ error: '司机不存在' });
    }
    
    // 逻辑删除：设置 is_active = false
    await db.update(
      'UPDATE drivers SET is_visible = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    // 记录操作日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details) VALUES (?, ?, ?, ?)',
      [req.admin.id, 'delete_driver', 'driver_management', { id }]
    );
    
    res.json({ 
      success: true, 
      message: '司机已删除'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
