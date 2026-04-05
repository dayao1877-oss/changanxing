/**
 * 后台管理系统 - API 路由
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import adminDriversRouter from './admin-drivers.js';
import adminVehiclesRouter from './admin-vehicles.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images/uploads');
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件（JPG/PNG/GIF）'));
    }
  }
});

// ==================== 管理员认证 ====================

// ==================== 司机管理 ====================
router.use('/drivers', adminDriversRouter);

// ==================== 车辆管理 ====================
router.use('/vehicles', adminVehiclesRouter);

/**
 * 管理员登录
 * POST /api/admin/login
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: '手机号和密码不能为空' });
    }
    
    // 从数据库查询管理员
    const admin: any = await db.getOne(
      'SELECT * FROM admins WHERE phone = ? AND is_active = TRUE',
      [phone]
    );
    
    if (!admin) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }
    
    // 生成 Token
    const token = generateToken(admin);
    
    // 记录登录日志
    await db.insert(
      'INSERT INTO admin_logs (admin_id, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [admin.id, 'login', 'auth', { success: true }, req.ip]
    );
    
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          phone: admin.phone,
          role: admin.role,
          avatar_url: admin.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * 获取当前管理员信息
 * GET /api/admin/profile
 */
router.get('/profile', async (req, res) => {
  try {
    // TODO: 从 Token 中解析管理员信息
    res.json({
      success: true,
      data: {
        id: 1,
        username: '姚师傅',
        phone: '18091827305',
        role: 'super_admin',
        avatar_url: null
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// ==================== 网站配置管理 ====================

/**
 * 获取首页配置
 * GET /api/admin/configs/homepage
 */
router.get('/configs/homepage', async (req, res) => {
  try {
    // TODO: 从数据库读取配置
    res.json({
      success: true,
      data: {
        backgroundImages: ['/images/homepage-bg-default.jpg'],
        title: '长安行',
        subtitle: "Xi'an One-Stop Travel Service",
        showSubtitle: true,
        serviceCards: [
          { type: 'charter', icon: 'Truck', title: '包车服务', subtitle: 'Charter Service', visible: true },
          { type: 'ticket', icon: 'MapPin', title: '门票预订', subtitle: 'Ticket Booking', visible: true },
          { type: 'itinerary', icon: 'ClipboardList', title: '行程定制', subtitle: 'Custom Itinerary', visible: true },
          { type: 'portfolio', icon: 'Image', title: '作品展示', subtitle: 'Portfolio', visible: true }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * 更新首页配置
 * PUT /api/admin/configs/homepage
 */
router.put('/configs/homepage', async (req, res) => {
  try {
    const config = req.body;
    
    // TODO: 保存到数据库
    
    res.json({
      success: true,
      message: '配置已保存'
    });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

/**
 * 上传图片
 * POST /api/admin/upload/image
 */
router.post('/upload/image', upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }
    
    const imageUrl = `/images/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

// ==================== 司机管理 ====================

/**
 * 获取司机列表
 * GET /api/admin/drivers
 */
router.get('/drivers', async (req, res) => {
  try {
    // TODO: 从数据库查询
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: '姚师傅',
          phone: '18091827305',
          wechat: 'lovconky',
          experience_years: 20,
          description: '士大夫敢死队风格士大夫敢死队风格士大夫',
          avatar_url: '/images/drivers/yao-placeholder.png',
          is_visible: true,
          sort_order: 1
        },
        {
          id: 2,
          name: '王磊',
          phone: '15339120068',
          wechat: '15339120068',
          experience_years: 20,
          description: '65464649879797 客户客户看',
          avatar_url: '/images/drivers/wang-placeholder.png',
          is_visible: true,
          sort_order: 2
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * 创建司机
 * POST /api/admin/drivers
 */
router.post('/drivers', async (req, res) => {
  try {
    const driverData = req.body;
    
    // TODO: 验证数据并保存到数据库
    
    res.json({
      success: true,
      message: '司机创建成功',
      data: driverData
    });
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

/**
 * 更新司机
 * PUT /api/admin/drivers/:id
 */
router.put('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const driverData = req.body;
    
    // TODO: 更新数据库
    
    res.json({
      success: true,
      message: '司机信息已更新'
    });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

/**
 * 删除司机
 * DELETE /api/admin/drivers/:id
 */
router.delete('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 逻辑删除（设置 is_active = false）
    
    res.json({
      success: true,
      message: '司机已删除'
    });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// ==================== 车辆管理 ====================

/**
 * 获取车辆列表
 * GET /api/admin/vehicles
 */
router.get('/vehicles', async (req, res) => {
  try {
    // TODO: 从数据库查询
    res.json({
      success: true,
      data: [
        {
          id: 1,
          plate_number: '陕 A·A12345',
          type: 'suv',
          brand_model: '东风 sky ev01',
          seats: 5,
          color: '白色',
          daily_price: 580.00,
          driver_id: 1,
          images: ['/images/vehicles/suv-1.jpg', '/images/vehicles/suv-2.jpg'],
          is_available: true
        },
        {
          id: 2,
          plate_number: '陕 A·A54321',
          type: 'business',
          brand_model: '别克 GL8',
          seats: 7,
          color: '白色',
          daily_price: 780.00,
          driver_id: 2,
          images: ['/images/vehicles/business-1.jpg', '/images/vehicles/business-2.jpg'],
          is_available: true
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * 创建车辆
 * POST /api/admin/vehicles
 */
router.post('/vehicles', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // TODO: 验证数据并保存到数据库
    
    res.json({
      success: true,
      message: '车辆创建成功'
    });
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

/**
 * 更新车辆
 * PUT /api/admin/vehicles/:id
 */
router.put('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    
    // TODO: 更新数据库
    
    res.json({
      success: true,
      message: '车辆信息已更新'
    });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

/**
 * 删除车辆
 * DELETE /api/admin/vehicles/:id
 */
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 逻辑删除
    
    res.json({
      success: true,
      message: '车辆已删除'
    });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
