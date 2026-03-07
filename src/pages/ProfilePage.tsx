import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Shield, 
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Registration, User } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/registrations/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setRegistrations(data);
          setIsLoading(false);
        });
    }
  }, [user]);

  if (!user) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Vui lòng đăng nhập</h2></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
      <header className="space-y-4">
        <h1 className="text-5xl font-bold text-stone-900 tracking-tight">Cá nhân</h1>
        <p className="text-stone-500 text-lg font-medium">Quản lý thông tin và theo dõi hoạt động của bạn</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card p-10 text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-[3rem] bg-stone-100 flex items-center justify-center text-stone-300 text-5xl font-bold overflow-hidden border-4 border-white shadow-2xl mx-auto">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : user.full_name[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                <Shield size={20} />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{user.full_name}</h2>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mt-2">{user.role === 'admin' ? 'Administrator' : user.role === 'board' ? 'Ban cán sự' : 'Thành viên'}</p>
            </div>

            <div className="pt-8 border-t border-stone-100 space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-stone-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Số điện thoại</p>
                  <p className="text-sm font-bold text-stone-900">{user.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Học vấn</p>
                  <p className="text-sm font-bold text-stone-900">Năm {user.university_year} • {user.department || 'CLB'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-10 bg-emerald-600 text-white space-y-6 shadow-2xl shadow-emerald-600/20">
            <h3 className="text-xl font-bold tracking-tight">Thành tích tình nguyện</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm font-bold uppercase tracking-widest">Hoạt động</span>
                <span className="text-2xl font-bold">{registrations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm font-bold uppercase tracking-widest">Tham gia</span>
                <span className="text-2xl font-bold">{registrations.filter(r => r.attendance_status === 'present').length}</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-emerald-100 italic leading-relaxed">"Sự cống hiến của bạn là nguồn cảm hứng cho cộng đồng."</p>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
              <ClipboardList size={24} className="text-emerald-600" />
              Hoạt động đã đăng ký
            </h3>
            <span className="px-4 py-2 bg-stone-100 rounded-2xl text-xs font-bold text-stone-600 uppercase tracking-widest">
              {registrations.length} Hoạt động
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-stone-100 rounded-[2.5rem] animate-pulse" />)
            ) : registrations.length > 0 ? (
              registrations.map((reg, i) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group card p-8 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-8"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        reg.activity_status === 'open' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-stone-100 text-stone-600 border-stone-200"
                      )}>
                        {reg.activity_status === 'open' ? 'Đang mở' : 'Đã kết thúc'}
                      </span>
                      <span className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} />
                        {reg.date ? format(new Date(reg.date), 'dd/MM/yyyy') : 'N/A'}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold text-stone-900 truncate group-hover:text-emerald-600 transition-colors">
                      {reg.title}
                    </h4>
                    <div className="flex items-center gap-6 mt-4">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        reg.attendance_status === 'present' ? "bg-emerald-50 text-emerald-700" : reg.attendance_status === 'absent' ? "bg-red-50 text-red-700" : "bg-stone-50 text-stone-400"
                      )}>
                        {reg.attendance_status === 'present' ? <CheckCircle2 size={12} /> : reg.attendance_status === 'absent' ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {reg.attendance_status === 'present' ? 'Đã tham gia' : reg.attendance_status === 'absent' ? 'Vắng mặt' : 'Chưa điểm danh'}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/activities/${reg.activity_id}`}
                    className="btn-secondary py-4 px-8 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                  >
                    Chi tiết
                    <ChevronRight size={18} />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="card p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                  <ClipboardList size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-stone-900">Bạn chưa đăng ký hoạt động nào</h4>
                  <p className="text-stone-500 font-medium">Hãy khám phá các hoạt động tình nguyện mới nhất.</p>
                </div>
                <Link to="/activities" className="btn-primary inline-flex">Khám phá ngay</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
