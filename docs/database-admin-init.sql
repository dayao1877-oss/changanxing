-- 长安行后台管理系统 - 数据库初始化脚本

-- 1. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role ENUM('super_admin', 'admin') DEFAULT 'admin' COMMENT '角色',
  avatar_url VARCHAR(255) COMMENT '头像',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入初始超级管理员（姚师傅）
-- 默认密码：123456（首次登录后请修改）
INSERT INTO admins (username, phone, password_hash, role) VALUES
('姚师傅', '18091827305', '$2a$10$YourHashedPasswordHere123456', 'super_admin');

-- 2. 网站配置表
CREATE TABLE IF NOT EXISTS site_configs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  config_value JSON NOT NULL COMMENT '配置值（JSON 格式）',
  description VARCHAR(255) COMMENT '配置说明',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站配置表';

-- 插入首页配置
INSERT INTO site_configs (config_key, config_value, description) VALUES
('homepage', '{
  "backgroundImages": ["/images/homepage-bg-default.jpg"],
  "title": "长安行",
  "subtitle": "Xi\'an One-Stop Travel Service",
  "showSubtitle": true,
  "serviceCards": [
    {
      "type": "charter",
      "icon": "Truck",
      "title": "包车服务",
      "subtitle": "Charter Service",
      "visible": true
    },
    {
      "type": "ticket",
      "icon": "MapPin",
      "title": "门票预订",
      "subtitle": "Ticket Booking",
      "visible": true
    },
    {
      "type": "itinerary",
      "icon": "ClipboardList",
      "title": "行程定制",
      "subtitle": "Custom Itinerary",
      "visible": true
    },
    {
      "type": "portfolio",
      "icon": "Image",
      "title": "作品展示",
      "subtitle": "Portfolio",
      "visible": true
    }
  ],
  "navigation": [
    {"key": "home", "label": "首页", "icon": "Home", "order": 1},
    {"key": "booking", "label": "预订", "icon": "Calendar", "order": 2},
    {"key": "portfolio", "label": "作品", "icon": "Image", "order": 3},
    {"key": "profile", "label": "我的", "icon": "User", "order": 4}
  ]
}', '首页配置'),

('global', '{
  "siteName": "长安行",
  "logo": "/images/logo.png",
  "favicon": "/images/favicon.ico",
  "contactPhone": "18091827305",
  "contactWechat": "lovconky",
  "copyright": "© 2026 长安行旅行服务"
}', '全局配置');

-- 3. 司机表（如已存在则跳过）
CREATE TABLE IF NOT EXISTS drivers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  phone VARCHAR(20) NOT NULL COMMENT '电话',
  wechat VARCHAR(50) COMMENT '微信',
  experience_years INT DEFAULT 0 COMMENT '驾龄',
  description TEXT COMMENT '个人介绍',
  avatar_url VARCHAR(255) COMMENT '头像 URL',
  is_visible BOOLEAN DEFAULT TRUE COMMENT '是否显示',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  tags JSON COMMENT '标签/特色',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visible (is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='司机表';

-- 插入初始司机数据
INSERT INTO drivers (name, phone, wechat, experience_years, description, avatar_url, is_visible, sort_order) VALUES
('姚师傅', '18091827305', 'lovconky', 20, '士大夫敢死队风格士大夫敢死队风格士大夫', '/images/drivers/yao-placeholder.png', TRUE, 1),
('王磊', '15339120068', '15339120068', 20, '65464649879797 客户客户看', '/images/drivers/wang-placeholder.png', TRUE, 2);

-- 4. 车辆表（如已存在则跳过）
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plate_number VARCHAR(20) NOT NULL COMMENT '车牌号',
  type ENUM('suv', 'business') NOT NULL COMMENT '车型',
  brand_model VARCHAR(100) NOT NULL COMMENT '品牌型号',
  seats INT NOT NULL COMMENT '座位数',
  color VARCHAR(30) COMMENT '颜色',
  daily_price DECIMAL(10,2) NOT NULL COMMENT '日租金',
  driver_id BIGINT COMMENT '固定合作司机',
  images JSON COMMENT '图片 URLs',
  is_available BOOLEAN DEFAULT TRUE COMMENT '是否可用',
  maintenance_note VARCHAR(255) COMMENT '维护备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  INDEX idx_type (type),
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- 插入初始车辆数据
INSERT INTO vehicles (plate_number, type, brand_model, seats, color, daily_price, driver_id, images, is_available) VALUES
('陕 A·A12345', 'suv', '东风 sky ev01', 5, '白色', 580.00, 1, '["/images/vehicles/suv-1.jpg","/images/vehicles/suv-2.jpg"]', TRUE),
('陕 A·A54321', 'business', '别克 GL8', 7, '白色', 780.00, 2, '["/images/vehicles/business-1.jpg","/images/vehicles/business-2.jpg"]', TRUE);

-- 5. 摄影作品表
CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) COMMENT '标题',
  images JSON NOT NULL COMMENT '图片 URLs',
  location VARCHAR(100) COMMENT '拍摄地点',
  shoot_date DATE COMMENT '拍摄日期',
  description TEXT COMMENT '简介/故事',
  category VARCHAR(50) COMMENT '分类',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_visible BOOLEAN DEFAULT TRUE COMMENT '是否显示',
  is_featured BOOLEAN DEFAULT FALSE COMMENT '是否推荐到首页',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_visible (is_visible),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='摄影作品表';

-- 6. FAQ 表（AI 知识库）
CREATE TABLE IF NOT EXISTS faqs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL COMMENT '问题',
  answer TEXT NOT NULL COMMENT '答案',
  category VARCHAR(50) COMMENT '分类',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_visible BOOLEAN DEFAULT TRUE COMMENT '是否显示',
  keywords JSON COMMENT '相似问题关键词',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_visible (is_visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FAQ 表';

-- 插入初始常见问题
INSERT INTO faqs (question, answer, category, sort_order, is_visible, keywords) VALUES
('你们有什么车？价格多少？', '亲～我们提供两种车型选择哦：\n\n🚙 SUV（东风 sky ev01）：5 座，¥580/天\n🚐 商务车（别克 GL8）：7 座，¥780/天\n\n价格已含油费和司机服务费，过路费停车费需您承担呢～😊', '价格类', 1, TRUE, '["车型","价格","多少钱","收费"]'),

('怎么预约？', '亲～预约很简单哒！\n\n1️⃣ 在小程序选择日期\n2️⃣ 选择喜欢的车型（SUV 或商务车）\n3️⃣ 填写您的联系信息\n4️⃣ 支付 20% 定金\n5️⃣ 等待师傅微信联系您确认细节\n\n就这么简单！期待与您相遇西安！😊', '预约类', 2, TRUE, '["预约","预订","怎么订","流程"]'),

('定金可以退吗？', '关于定金退款政策是这样的😊：\n\n✅ 提前 3 天以上取消：定金全额退还\n⏰ 提前 1-3 天取消：退还定金的 50%\n❌ 当天取消：定金不退\n\n定金为总费用的 20%，建议至少提前 1 天预约哦！✨', '政策类', 3, TRUE, '["定金","退款","退钱","取消"]'),

('可以当天预约吗？', '抱歉呢～我们需要至少提前 1 天预约哦，方便安排行程准备～😅\n\n您可以提前规划好行程，尽早联系我们，确保能为您提供最好的服务！✨', '预约类', 4, TRUE, '["当天","临时","紧急"]');

-- 7. 订单表（简化版，完整版见业务数据库）
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
  customer_name VARCHAR(50) NOT NULL COMMENT '客户姓名',
  customer_phone VARCHAR(20) NOT NULL COMMENT '客户电话',
  customer_wechat VARCHAR(50) COMMENT '客户微信',
  passenger_count INT COMMENT '乘客人数',
  vehicle_id BIGINT NOT NULL COMMENT '车辆',
  driver_id BIGINT NOT NULL COMMENT '司机',
  service_date DATE NOT NULL COMMENT '服务日期',
  route_type VARCHAR(50) COMMENT '路线类型',
  deposit_amount DECIMAL(10,2) NOT NULL COMMENT '定金',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
  notes TEXT COMMENT '备注',
  admin_notes TEXT COMMENT '管理员备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  INDEX idx_status (status),
  INDEX idx_service_date (service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 8. 操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL COMMENT '管理员',
  action VARCHAR(100) NOT NULL COMMENT '操作',
  module VARCHAR(50) COMMENT '模块',
  details JSON COMMENT '详细信息',
  ip_address VARCHAR(50) COMMENT 'IP 地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id),
  INDEX idx_admin (admin_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 创建图片上传目录
-- 需要在服务器上手动创建以下目录：
-- /public/images/drivers/     司机头像
-- /public/images/vehicles/    车辆照片
-- /public/images/portfolio/   摄影作品
-- /public/images/homepage/    首页背景图
-- /public/images/uploads/     其他上传文件

-- 授权语句（根据实际情况调整）
-- GRANT ALL PRIVILEGES ON changanxing.* TO 'admin'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;
