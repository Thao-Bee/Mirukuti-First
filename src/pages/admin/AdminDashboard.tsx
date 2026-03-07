import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Activity, 
  ClipboardList, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useYear } from '../../contexts/YearContext';
import { Link } from 'react-router-dom';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Stats {
  totalMembers: number;
  totalActivities: number;
  activeRegistrations: number;
  upcomingEvents: number;
}

interface HistoricalData {
  year: string;
  members: number;
  activities: number;
}

export function AdminDashboard() {
  const { selectedYear } = useYear();
  const [stats, setStats] = useState<Stats | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/stats?year=${selectedYear}`).then(res => res.json()),
      fetch('/api/stats/historical').then(res => res.json())
    ]).then(([statsData, historyData]) => {
      setStats(statsData);
      setHistoricalData(historyData);
      setIsLoading(false);
    });
  }, [selectedYear]);

  const statCards = [
    { label: 'Thành viên', value: stats?.totalMembers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Hoạt động', value: stats?.totalActivities || 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+4' },
    { label: 'Đăng ký', value: stats?.activeRegistrations || 0, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', trend: '85%' },
    { label: 'Sắp tới', value: stats?.upcomingEvents || 0, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Tiếp' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-stone-500 mt-2 font-medium">Năm học {selectedYear} • Dữ liệu cập nhật theo thời gian thực</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-8 group hover:border-emerald-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-50 text-stone-400 uppercase tracking-widest">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-4xl font-bold text-stone-900 mt-2">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 card p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Phân tích lịch sử</h2>
              <p className="text-sm text-stone-500 font-medium">Tăng trưởng thành viên & hoạt động qua các năm</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Thành viên</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Hoạt động</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMembers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="activities" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorActivities)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel */}
        <div className="card p-10 flex flex-col">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-8">Sự kiện gần đây</h2>
          <div className="space-y-8 flex-1">
            {[
              { title: 'Thành viên mới tham gia', time: '2 phút trước', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Hoạt động "Dọn dẹp" đã đóng', time: '1 giờ trước', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
              { title: 'Nhận được đăng ký mới', time: '3 giờ trước', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Sao lưu hệ thống hoàn tất', time: '5 giờ trước', icon: AlertCircle, color: 'text-stone-600', bg: 'bg-stone-50' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 group cursor-pointer">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">{item.title}</p>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-10 w-full py-4 bg-stone-50 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-100 transition-all uppercase tracking-widest">
            Xem nhật ký hệ thống
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-12 bg-stone-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">Sẵn sàng cho năm học mới?</h2>
          <p className="text-stone-400 text-lg leading-relaxed font-medium">
            Bạn có thể dễ dàng sao chép dữ liệu từ năm học trước hoặc tạo một không gian làm việc hoàn toàn mới cho năm nay. Hệ thống sẽ tự động xử lý việc lên lớp và tốt nghiệp.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/admin/archive"
              className="btn-primary px-8 py-4 shadow-emerald-900/40"
            >
              Quản lý năm học
              <ArrowUpRight size={20} />
            </Link>
            <Link 
              to="/admin/archive"
              className="btn-secondary px-8 py-4 bg-stone-800 text-white border-none hover:bg-stone-700"
            >
              Xem báo cáo tổng kết
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
          <TrendingUp size={400} />
        </div>
      </div>
    </div>
  );
}
