import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar as CalendarIcon, MapPin, Users, ChevronRight, Filter } from 'lucide-react';
import { Activity } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { cn } from '../lib/utils';

export function ActivitiesPage() {
  const { selectedYear } = useYear();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/activities?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setIsLoading(false);
      });
  }, [selectedYear]);

  const filtered = activities.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                         a.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'open' ? a.status === 'open' : a.status !== 'open');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-bold text-stone-900 tracking-tight">Hoạt động tình nguyện</h1>
        <p className="text-stone-500 text-lg">Khám phá và tham gia các hoạt động trong năm học {selectedYear}</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-4 rounded-2xl text-sm font-bold capitalize transition-all",
                filter === f 
                  ? "bg-stone-900 text-white shadow-lg" 
                  : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
              )}
            >
              {f === 'all' ? 'Tất cả' : f === 'open' ? 'Đang mở' : 'Đã đóng'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-stone-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <img 
                  src={activity.image_url || `https://picsum.photos/seed/${activity.id}/800/500`} 
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className={cn(
                    "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-xl backdrop-blur-md",
                    activity.status === 'open' 
                      ? "bg-white text-emerald-600 border border-white" 
                      : "bg-white text-stone-500 border border-white"
                  )}>
                    {activity.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <CalendarIcon size={14} />
                  {format(new Date(activity.date), 'dd/MM/yyyy')}
                </div>
                
                <h3 className="text-2xl font-bold text-stone-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {activity.title}
                </h3>
                
                <div className="space-y-3 mb-8 text-stone-500 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-stone-300" />
                    <span className="truncate">{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-stone-300" />
                    <span>{activity.participant_count} / {activity.capacity || '∞'} Thành viên</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <Link
                    to={`/activities/${activity.id}`}
                    className="w-full btn-secondary py-4 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                  >
                    Xem chi tiết
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Không tìm thấy hoạt động nào</h3>
            <p className="text-stone-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
