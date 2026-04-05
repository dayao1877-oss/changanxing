/**
 * 后台管理布局组件
 */

import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Home, Calendar, Image, Users, Truck, ClipboardList, LogOut, Menu, X } from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 获取当前管理员信息
  const adminInfo = localStorage.getItem('admin_info');
  const admin = adminInfo ? JSON.parse(adminInfo) : null;

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    navigate('/admin/login');
  };

  // 菜单项配置
  const menuItems = [
    { path: '/admin/dashboard', label: '控制台', icon: Home },
    { path: '/admin/homepage', label: '首页配置', icon: Home },
    { path: '/admin/drivers', label: '司机管理', icon: Users },
    { path: '/admin/vehicles', label: '车辆管理', icon: Truck },
    { path: '/admin/schedule', label: '档期管理', icon: Calendar },
    { path: '/admin/orders', label: '订单管理', icon: ClipboardList },
    { path: '/admin/portfolio', label: '作品管理', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏 - 桌面端 */}
      <aside 
        className={`hidden md:flex md:flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-black">长安行</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* 菜单列表 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部用户信息 */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-black">{admin?.username || '管理员'}</p>
                <p className="text-xs text-gray-500">{admin?.phone || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </button>
          </div>
        )}
      </aside>

      {/* 移动端菜单按钮 */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-black">长安行 · 管理后台</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center px-4 border-b border-gray-200">
              <h1 className="text-lg font-bold text-black">长安行</h1>
            </div>
            <nav className="py-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 mb-1 transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
