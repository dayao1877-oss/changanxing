/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, 
  MapPin, 
  ClipboardList, 
  Image as ImageIcon, 
  Home, 
  Calendar, 
  User 
} from "lucide-react";
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminHomepageConfig from './pages/AdminHomepageConfig';
import AdminDrivers from './pages/AdminDrivers';

// 声明其他管理页面组件（暂时使用占位组件）
const AdminVehicles = () => <div className="p-6"><h1 className="text-2xl font-bold">车辆管理（开发中）</h1></div>;
const AdminSchedule = () => <div className="p-6"><h1 className="text-2xl font-bold">档期管理（开发中）</h1></div>;
const AdminOrders = () => <div className="p-6"><h1 className="text-2xl font-bold">订单管理（开发中）</h1></div>;
const AdminPortfolio = () => <div className="p-6"><h1 className="text-2xl font-bold">作品管理（开发中）</h1></div>;

interface ServiceCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
}

const ServiceCard = ({ title, subtitle, icon, delay = 0 }: ServiceCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileTap={{ scale: 0.98 }}
    className="bg-white/80 backdrop-blur-md p-6 rounded-custom shadow-sm border border-black/5 flex items-center justify-between group cursor-pointer"
  >
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-1 text-black">{title}</h2>
      <p className="text-xs text-gray-500 uppercase tracking-tighter">{subtitle}</p>
    </div>
    <div className="relative">
      <div className="absolute -inset-2 bg-black/5 rounded-full scale-150 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
      {icon}
    </div>
  </motion.section>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台路由 */}
        <Route path="/" element={<FrontendApp />} />
        
        {/* 后台管理路由 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="homepage" element={<AdminHomepageConfig />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// 前台应用（原始代码）
function FrontendApp() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <div className="min-h-screen flex flex-col relative pb-24">
      {/* Atmospheric Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.05)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.04)_0%,transparent_60%)]"></div>
      </div>

      <main className="flex-grow relative z-10">
        {activeTab === "home" && <HomePage />}
        {activeTab === "booking" && <BookingPage />}
        {activeTab === "portfolio" && <PortfolioPage />}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/10 px-8 py-4 flex justify-between items-center z-50">
        <NavItem 
          icon={<Home className="h-6 w-6" />} 
          label="首页" 
          active={activeTab === "home"} 
          onClick={() => setActiveTab("home")}
        />
        <NavItem 
          icon={<Calendar className="h-6 w-6" />} 
          label="预订" 
          active={activeTab === "booking"} 
          onClick={() => setActiveTab("booking")}
        />
        <NavItem 
          icon={<ImageIcon className="h-6 w-6" />} 
          label="作品" 
          active={activeTab === "portfolio"} 
          onClick={() => setActiveTab("portfolio")}
        />
        <NavItem 
          icon={<User className="h-6 w-6" />} 
          label="我的" 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")}
        />
      </nav>
    </div>
  );
}

function HomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      <header className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 ink-gradient-mask flex items-center justify-center pt-10 px-8">
          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.5 }}
            alt="西安钟楼水墨画"
            className="w-full h-auto grayscale-img object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-FbuUoLkfzK74oRHf9UF5mfoZrtlQKhD77uIE8Ma8n4kgQ2Q1yeSQYRuyoVdtD5y7sVrzcSLl5Jj9gF0bQ3rqFmQWrP1re2qxxaIju6WL8CyhKkLA0A1Z1yQeg2EApakfCWDk3nJ5glCBnv3Zk8lL4N9-UQtIn1TuXWlzLy5uGgi__xYegU9BCiCYcLRrIcFb1cBLXHpL7Q_be-ad_3FKjQz7_ZopXPLiSf9S2QJzuT9Dkp04hoATatvCIy__Nyly-54P-dUhJzto"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 p-8 flex flex-col justify-end h-full">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold tracking-widest text-black mb-2"
          >
            长安行
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm tracking-[0.2em] text-gray-600 uppercase font-medium"
          >
            Xi'an One-Stop Travel Service
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-1 bg-black mt-4 shadow-sm"
          />
        </div>
      </header>

      <div className="px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-1 gap-5">
          <ServiceCard 
            title="包车服务" 
            subtitle="Charter Service" 
            icon={<Truck className="h-8 w-8 text-black" strokeWidth={1.2} />} 
            delay={0.5}
          />
          <ServiceCard 
            title="门票预订" 
            subtitle="Ticket Booking" 
            icon={<MapPin className="h-8 w-8 text-black" strokeWidth={1.2} />} 
            delay={0.6}
          />
          <ServiceCard 
            title="行程定制" 
            subtitle="Custom Itinerary" 
            icon={<ClipboardList className="h-8 w-8 text-black" strokeWidth={1.2} />} 
            delay={0.7}
          />
          <ServiceCard 
            title="作品展示" 
            subtitle="Portfolio" 
            icon={<ImageIcon className="h-8 w-8 text-black" strokeWidth={1.2} />} 
            delay={0.8}
          />
        </div>
      </div>
    </motion.div>
  );
}

function BookingPage() {
  const attractions = [
    { name: "秦始皇兵马俑", en: "Terracotta Army", price: "¥120", img: "https://picsum.photos/seed/terracotta/400/300" },
    { name: "西安城墙", en: "Xi'an City Wall", price: "¥54", img: "https://picsum.photos/seed/citywall/400/300" },
    { name: "大唐不夜城", en: "Great Tang All Day Mall", price: "免费", img: "https://picsum.photos/seed/tang/400/300" },
    { name: "华山风景区", en: "Mount Hua", price: "¥160", img: "https://picsum.photos/seed/huashan/400/300" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-8 pt-12"
    >
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-widest text-black">门票预订</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Ticket Booking</p>
        <div className="h-1 w-12 bg-black mt-4"></div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {attractions.map((item, idx) => (
          <motion.div 
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-custom overflow-hidden shadow-sm border border-black/5"
          >
            <img src={item.img} alt={item.name} className="w-full h-40 object-cover grayscale-img opacity-80" referrerPolicy="no-referrer" />
            <div className="p-5 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-black">{item.name}</h3>
                <p className="text-xs text-gray-500 uppercase">{item.en}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-black">{item.price}</span>
                <button className="block mt-2 bg-black text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  立即预订
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PortfolioPage() {
  const photos = [
    "https://picsum.photos/seed/xian1/600/800",
    "https://picsum.photos/seed/xian2/800/600",
    "https://picsum.photos/seed/xian3/600/600",
    "https://picsum.photos/seed/xian4/800/800",
    "https://picsum.photos/seed/xian5/600/800",
    "https://picsum.photos/seed/xian6/800/600",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-8 pt-12"
    >
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-widest text-black">作品展示</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Portfolio Gallery</p>
        <div className="h-1 w-12 bg-black mt-4"></div>
      </header>

      <div className="columns-2 gap-4 space-y-4">
        {photos.map((src, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="break-inside-avoid rounded-custom overflow-hidden border border-black/5 shadow-sm"
          >
            <img src={src} alt="Travel" className="w-full grayscale-img hover:grayscale-0 transition-all duration-500 cursor-pointer" referrerPolicy="no-referrer" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfilePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-8 pt-12"
    >
      <header className="mb-12 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-2 border-black/10 p-1 mb-4">
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            <User className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-black">墨色行者</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Ink Traveler</p>
      </header>

      <div className="space-y-4">
        <ProfileItem label="我的订单" en="My Orders" />
        <ProfileItem label="收藏夹" en="Favorites" />
        <ProfileItem label="优惠券" en="Coupons" />
        <ProfileItem label="设置" en="Settings" />
        <ProfileItem label="联系客服" en="Support" />
      </div>

      <button className="w-full mt-12 border border-black/10 py-4 rounded-custom text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:border-black transition-all">
        退出登录 Logout
      </button>
    </motion.div>
  );
}

function ProfileItem({ label, en }: { label: string, en: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-5 rounded-custom border border-black/5 flex justify-between items-center group cursor-pointer hover:bg-white transition-colors">
      <div>
        <h3 className="text-sm font-bold text-black">{label}</h3>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{en}</p>
      </div>
      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black transition-colors">
        <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-black group-hover:border-white rotate-45 -ml-0.5"></div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center transition-all outline-none ${active ? 'text-black opacity-100' : 'text-black opacity-30 grayscale'}`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );
}
