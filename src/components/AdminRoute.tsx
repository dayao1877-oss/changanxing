/**
 * 后台管理路由守卫组件
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    // 未登录，跳转到登录页
    return <Navigate to="/admin/login" replace />;
  }
  
  // 已登录，渲染子组件
  return <>{children}</>;
};

export default AdminRoute;
