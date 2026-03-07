import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  X, 
  Check,
  CheckCircle2,
  Image as ImageIcon,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  Type,
  Sparkles
} from 'lucide-react';
import { Activity } from '../../types';
import { format } from 'date-fns';
import { cn, generateTextImage } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useYear } from '../../contexts/YearContext';

export function AdminActivities() {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'finished'>('all');
  const [imageText, setImageText] = useState('');
  const [imageTextError, setImageTextError] = useState<string | null>(null);

  const handleImageTextChange = (text: string) => {
    setImageText(text);
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 20) {
      setImageTextError('Vượt quá giới hạn 20 từ. Chữ có thể bị tràn ra ngoài ảnh!');
    } else {
      setImageTextError(null);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    notes: '',
    capacity: '',
    google_form_link: '',
    registration_deadline: '',
    image_url: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [selectedYear]);

  const fetchActivities = () => {
    setIsLoading(true);
    fetch(`/api/activities?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setIsLoading(false);
      });
  };

  const filtered = activities.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                         a.location.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'open') {
      matchesStatus = a.status === 'open';
    } else if (statusFilter === 'finished') {
      matchesStatus = a.status === 'closed' || a.status === 'completed';
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          created_by: user.id,
          academic_year: selectedYear
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ 
          title: '', 
          description: '', 
          date: '', 
          location: '', 
          notes: '', 
          capacity: '',
          google_form_link: '',
          registration_deadline: '',
          image_url: ''
        });
        setImageText('');
        fetchActivities();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error || 'Không thể lưu hoạt động'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối với máy chủ.');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Quản lý hoạt động</h1>
          <p className="text-stone-500 mt-2 font-medium">Năm học {selectedYear} • Theo dõi và điều phối các sự kiện</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Hoạt động mới
        </button>
      </header>

      {/* Controls */}
      <div className="card p-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'finished'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-6 py-4 rounded-2xl text-sm font-bold capitalize transition-all",
                statusFilter === s 
                  ? "bg-stone-900 text-white shadow-lg" 
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              )}
            >
              {s === 'all' ? 'Tất cả' : s === 'open' ? 'Đang mở' : 'Đã kết thúc'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-stone-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : filtered.map((activity) => (
          <motion.div
            key={activity.id}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group card p-8 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-8"
          >
            <div className="w-full md:w-40 aspect-video rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
              <img 
                src={activity.image_url || `https://picsum.photos/seed/${activity.id}/400/225`} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  activity.status === 'open' ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-stone-100 text-stone-600 border border-stone-200"
                )}>
                  {activity.status === 'open' ? 'Đang mở đăng kí' : 'Đã kết thúc'}
                </div>
                <span className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} />
                  {format(new Date(activity.date), 'dd/MM/yyyy • HH:mm')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 truncate group-hover:text-emerald-600 transition-colors">
                {activity.title}
              </h3>
              <div className="flex flex-wrap items-center gap-8 mt-6 text-stone-500 text-sm font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-stone-300" />
                  {activity.location}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-stone-300" />
                  {activity.participant_count} / {activity.capacity || '∞'} Thành viên
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to={`/admin/activities/${activity.id}`}
                className="btn-primary py-4 px-8"
              >
                Xem
                <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-bold text-stone-900 tracking-tight">Tạo hoạt động mới</h3>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Basic Info Section */}
                    <div className="md:col-span-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Tiêu đề hoạt động</label>
                          <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            placeholder="Ví dụ: Dọn dẹp vườn cộng đồng"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Ngày & Giờ diễn ra</label>
                          <input
                            required
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Số lượng tối đa</label>
                          <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="input-field"
                            placeholder="Không giới hạn"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Địa điểm</label>
                          <input
                            required
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="input-field"
                            placeholder="Ví dụ: Cổng Tây Công viên Thống Nhất"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Registration & Links Section */}
                    <div className="md:col-span-4 space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Hạn đăng ký</label>
                        <input
                          type="datetime-local"
                          value={formData.registration_deadline}
                          onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Link Google Form</label>
                        <input
                          type="url"
                          value={formData.google_form_link}
                          onChange={(e) => setFormData({ ...formData, google_form_link: e.target.value })}
                          className="input-field"
                          placeholder="https://docs.google.com/forms/..."
                        />
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Trạng thái mặc định</p>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <CheckCircle2 size={16} />
                          Đang mở đăng ký
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="md:col-span-12">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Mô tả hoạt động và những gì tình nguyện viên sẽ làm..."
                      />
                    </div>

                    {/* Image Section */}
                    <div className="md:col-span-12 pt-4 border-t border-stone-100">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div className="md:col-span-7 space-y-6">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Ảnh bìa hoạt động</label>
                            <div className="flex gap-4">
                              <input
                                type="url"
                                value={formData.image_url || ''}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="input-field flex-1"
                                placeholder="Dán link ảnh (https://...)"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setFormData({ ...formData, image_url: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="btn-secondary h-full px-4 flex items-center justify-center gap-2 whitespace-nowrap">
                                  <Plus size={18} />
                                  Tải lên
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Hoặc tạo ảnh từ chữ</p>
                            <div className="flex gap-2">
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={imageText}
                                  onChange={(e) => handleImageTextChange(e.target.value)}
                                  className={cn(
                                    "input-field w-full",
                                    imageTextError && "border-red-500 focus:border-red-500 ring-red-500/10"
                                  )}
                                  placeholder="Nhập chữ cho ảnh..."
                                />
                                {imageTextError && (
                                  <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    {imageTextError}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (imageText.trim()) {
                                    const dataUrl = generateTextImage(imageText.trim());
                                    setFormData({ ...formData, image_url: dataUrl });
                                  }
                                }}
                                className="btn-secondary h-[46px] px-6 flex items-center gap-2"
                              >
                                <Sparkles size={18} />
                                Tạo
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Xem trước ảnh bìa</p>
                          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 shadow-inner">
                            {formData.image_url ? (
                              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <ImageIcon size={48} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-12 py-3"
                    >
                      <Check size={20} />
                      Tạo hoạt động
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
