/**
 * JWT 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
    phone: string;
    role: string;
  };
}

// 生成 Token
export function generateToken(admin: any): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      phone: admin.phone,
      role: admin.role
    },
    secret,
    { expiresIn: '7d' }
  );
}

// 验证 Token
export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// 认证中间件
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 从 Header 获取 Token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: '未授权，请先登录' 
    });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token 无效或已过期' 
    });
  }
  
  // 将管理员信息附加到请求对象
  req.admin = decoded;
  next();
}

// 权限检查中间件
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        error: '未授权' 
      });
    }
    
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false, 
        error: '权限不足' 
      });
    }
    
    next();
  };
}

export default {
  generateToken,
  verifyToken,
  authMiddleware,
  requireRole
};
