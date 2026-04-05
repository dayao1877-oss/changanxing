/**
 * 数据库配置
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'changanxing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// 测试连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 执行查询
export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取单个记录
export async function getOne(sql: string, params?: any[]) {
  const rows = await query(sql, params) as any[];
  return rows[0] || null;
}

// 获取所有记录
export async function getAll(sql: string, params?: any[]) {
  return await query(sql, params);
}

// 插入并返回 ID
export async function insert(sql: string, params?: any[]) {
  const result = await query(sql, params) as any;
  return result.insertId;
}

// 更新
export async function update(sql: string, params?: any[]) {
  const result = await query(sql, params) as any;
  return result.affectedRows > 0;
}

// 删除
export async function remove(sql: string, params?: any[]) {
  const result = await query(sql, params) as any;
  return result.affectedRows > 0;
}

export default {
  pool,
  testConnection,
  query,
  getOne,
  getAll,
  insert,
  update,
  remove
};
