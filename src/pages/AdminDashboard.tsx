/**
 * 后台管理 - 控制台首页
 */

import React, { useState, useEffect } from 'react';
import { Users, Truck, Calendar, ClipboardList, TrendingUp, DollarSign } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalDrivers: 2,
    totalVehicles: 2,
    availableToday: 2
  });

  useEffect(() => {
    // TODO: 从 API 加载统计数据
    // 这里是模拟数据
    setStats({
      totalOrders: 15,
      pendingOrders: 3,
      totalRevenue: 8640,
      totalDrivers: 2,
      totalVehicles: 2,
      availableToday: 2
    });
  }, []);

  const statCards = [
    {
      title: '总订单数',
      value: stats.totalOrders,
      icon: ClipboardList,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: '待处理订单',
      value: stats.pendingOrders,
      icon: Calendar,
      color: 'bg-yellow-500',
      trend: '-2'
    },
    {
      title: '总收入',
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+18%'
    },
    {
      title: '司机数量',
      value: stats.totalDrivers,
      icon: Users,
      color: 'bg-purple-500',
      trend: '稳定'
    },
    {
      title: '车辆数量',
      value: stats.totalVehicles,
      icon: Truck,
      color: 'bg-indigo-500',
      trend: '稳定'
    },
    {
      title: '今日可订',
      value: stats.availableToday,
      icon: TrendingUp,
      color: 'bg-teal-500',
      trend: '充足'
    }
  ];

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">控制台</h1>
        <p className="text-sm text-gray-600">欢迎回来，姚师傅！</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend.startsWith('+') ? 'bg-green-100 text-green-800' :
                  stat.trend.startsWith('-') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-black">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 今日概览 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">今日概览</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SUV（陕 A·A12345）</span>
              <span className="text-sm font-bold text-green-600">可预订</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">商务车（陕 A·A54321）</span>
              <span className="text-sm font-bold text-green-600">可预订</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs text-gray-500">暂无待处理订单</p>
            </div>
          </div>
        </div>

        {/* 最近订单 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">最近订单</h2>
          <div className="space-y-3">
            <div className="text-center py-4 text-gray-500 text-sm">
              暂无新订单
            </div>
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="mt-8 bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
        <h2 className="text-lg font-bold mb-4">快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/homepage" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Home className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-medium">首页配置</span>
          </a>
          <a href="/admin/drivers" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-medium">司机管理</span>
          </a>
          <a href="/admin/vehicles" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <Truck className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-medium">车辆管理</span>
          </a>
          <a href="/admin/orders" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
            <ClipboardList className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-medium">订单管理</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// 简单的图标组件（临时使用）
const Home = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default AdminDashboard;
