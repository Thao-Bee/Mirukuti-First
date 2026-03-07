import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Archive,
  Menu,
  X,
  ChevronDown,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { user, logout } = useAuth();
  const { selectedYear, setSelectedYear, years } = useYear();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Hoạt động', path: '/activities', icon: Calendar },
    { name: 'Cá nhân', path: '/profile', icon: User },
  ].filter(item => !(item.path === '/profile' && user?.role === 'admin'));

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 font-bold text-emerald-700 text-2xl tracking-tight">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">V</div>
                <span className="hidden sm:block">VolunteerClub</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {location.pathname !== '/' && (
                <div className="relative mr-4">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none bg-stone-100 border-none rounded-2xl px-5 py-2.5 pr-10 text-sm font-bold text-stone-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer hover:bg-stone-200 transition-all"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>Năm học {y}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              )}
              
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
                    location.pathname === item.path 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2.5 rounded-2xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  Quản trị
                </Link>
              )}

              <div className="w-px h-6 bg-stone-200 mx-4" />

              {user ? (
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all">
                    <Bell size={20} />
                  </button>
                  <button
                    onClick={logout}
                    className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-red-600 transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2.5">Đăng nhập</Link>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-600">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-stone-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold",
                      location.pathname === item.path 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "text-stone-600"
                    )}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-stone-600">
                    <LayoutDashboard size={20} />
                    Quản trị
                  </Link>
                )}
                {user ? (
                  <button onClick={logout} className="flex w-full items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-red-600">
                    <LogOut size={20} />
                    Đăng xuất
                  </button>
                ) : (
                  <Link to="/login" className="btn-primary w-full">Đăng nhập</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3 font-bold text-emerald-700 text-2xl">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">V</div>
                <span>VolunteerClub</span>
              </div>
              <p className="text-stone-500 max-w-sm">Hệ thống quản lý hoạt động tình nguyện hiện đại cho sinh viên.</p>
            </div>
            <div className="flex gap-8 text-sm font-bold text-stone-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
              <Link to="/activities" className="hover:text-emerald-600 transition-colors">Hoạt động</Link>
              <Link to="/profile" className="hover:text-emerald-600 transition-colors">Cá nhân</Link>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-medium uppercase tracking-widest">
            <p>© 2026 VolunteerClub System. All rights reserved.</p>
            <p>Designed with passion for volunteers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { selectedYear, setSelectedYear, years } = useYear();
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Thành viên', path: '/admin/members', icon: Users },
    { name: 'Hoạt động', path: '/admin/activities', icon: Calendar },
    { name: 'Lưu trữ', path: '/admin/archive', icon: Archive },
  ];

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
      <aside className="w-72 bg-stone-900 text-stone-300 flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 font-bold text-white text-2xl tracking-tight">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">V</div>
            <span>Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all",
                location.pathname === item.path 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-900/40" 
                  : "hover:bg-stone-800 hover:text-white"
              )}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-800">
          <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-white/5 rounded-3xl">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-sm font-bold text-white">
              {user?.full_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-stone-400 hover:bg-stone-800 hover:text-red-400 transition-all"
          >
            <LogOut size={22} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center gap-6">
             <div className="relative">
               <select 
                 value={selectedYear}
                 onChange={(e) => setSelectedYear(e.target.value)}
                 className="appearance-none bg-stone-50 border border-stone-200 rounded-2xl px-5 py-2.5 pr-10 text-sm font-bold text-stone-700 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer hover:bg-stone-100 transition-all"
               >
                 {years.map(y => (
                   <option key={y} value={y}>Năm học {y}</option>
                 ))}
               </select>
               <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all">
               <Bell size={20} />
             </button>
             <div className="w-px h-6 bg-stone-200" />
             <span className="text-sm font-bold text-stone-600">{user?.full_name}</span>
           </div>
        </header>
        
        <main className="flex-1 p-8 md:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
