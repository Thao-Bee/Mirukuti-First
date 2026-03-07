import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  AlertCircle,
  Clock,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Activity } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/activities/${id}`);
        const data = await res.json();
        setActivity(data);

        if (user) {
          const regRes = await fetch(`/api/registrations/user/${user.id}`);
          const registrations = await regRes.json();
          setIsAlreadyRegistered(registrations.some((r: any) => r.activity_id === Number(id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    setMessage(null);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, activity_id: Number(id) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');

      setMessage({ type: 'success', text: 'Đăng ký tham gia hoạt động thành công!' });
      setIsAlreadyRegistered(true);
      const updatedRes = await fetch(`/api/activities/${id}`);
      setActivity(await updatedRes.json());
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !activity) return;

    const registrationDeadline = activity.registration_deadline ? new Date(activity.registration_deadline) : new Date(activity.date);
    const now = new Date();

    if (now >= registrationDeadline || activity.status !== 'open') {
      setMessage({ type: 'error', text: 'hãy liên hệ với ban quản lý để được tư vấn!' });
      return;
    }

    setIsCancelling(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/registrations?user_id=${user.id}&activity_id=${Number(id)}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Hủy đăng ký thất bại');
      }

      setMessage({ type: 'success', text: 'bạn đã huỷ đăng kí tham gia hoạt động này!' });
      setIsAlreadyRegistered(false);
      
      // Refresh activity data to update participant count
      const updatedRes = await fetch(`/api/activities/${id}`);
      if (updatedRes.ok) {
        const updatedActivity = await updatedRes.json();
        setActivity(updatedActivity);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!activity) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Không tìm thấy hoạt động</h2><Link to="/activities" className="text-emerald-600 font-bold mt-4 inline-block">Quay lại danh sách</Link></div>;

  const isFull = activity.capacity && activity.participant_count >= activity.capacity;
  const isClosed = activity.status !== 'open';

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-stone-500 hover:text-stone-900 font-bold uppercase tracking-widest text-xs transition-colors"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <div className="card p-12 md:p-20 space-y-12">
        <header className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              {format(new Date(activity.date), 'EEEE, dd/MM/yyyy')}
            </span>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              activity.status === 'open' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-stone-100 text-stone-600 border-stone-200"
            )}>
              {activity.status === 'open' ? 'Đang mở đăng kí' : 'Đã kết thúc'}
            </span>
          </div>

          {activity.image_url && (
            <div className="w-full aspect-[21/9] rounded-[3rem] overflow-hidden border border-stone-200 shadow-sm">
              <img 
                src={activity.image_url} 
                alt={activity.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-7xl font-bold text-stone-900 tracking-tight leading-tight">
            {activity.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Thời gian</p>
                <p className="text-stone-900 font-bold">{format(new Date(activity.date), 'HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                <MapPin size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Địa điểm</p>
                <p className="text-stone-900 font-bold truncate">{activity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Số lượng</p>
                <p className="text-stone-900 font-bold">{activity.participant_count} / {activity.capacity || '∞'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-600 shadow-sm">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Hạn đăng ký</p>
                <p className="text-stone-900 font-bold">
                  {activity.registration_deadline ? format(new Date(activity.registration_deadline), 'dd/MM HH:mm') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Mô tả hoạt động</h3>
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap bg-stone-50 p-10 rounded-[2.5rem] border border-stone-100 font-medium">
                {activity.description}
              </p>
            </div>

            {activity.google_form_link && isAlreadyRegistered && (
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl shadow-blue-600/20">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
                    <Info size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight">Bước tiếp theo</h4>
                    <p className="text-blue-100 font-medium">Vui lòng hoàn tất form đăng ký chi tiết bên dưới.</p>
                  </div>
                </div>
                <a 
                  href={activity.google_form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-blue-600 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  Mở Google Form đăng ký
                  <ExternalLink size={24} />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="card p-8 bg-stone-50 border-stone-100 space-y-6">
              <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={16} />
                Lưu ý quan trọng
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed font-medium italic">
                {activity.notes || 'Không có lưu ý đặc biệt cho hoạt động này.'}
              </p>
            </div>

            <div className="space-y-6">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-6 rounded-3xl flex items-center gap-4 border",
                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  )}
                >
                  {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  <p className="font-bold">{message.text}</p>
                </motion.div>
              )}

              {user ? (
                isAlreadyRegistered ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] space-y-6 shadow-2xl shadow-emerald-600/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <CheckCircle2 size={28} />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight">Đã đăng ký</h4>
                      </div>
                      <p className="text-emerald-100 text-sm font-medium">Hẹn gặp lại bạn tại hoạt động này. Kiểm tra trang cá nhân để xem lịch trình.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelRegistration}
                      disabled={isCancelling}
                      className="w-full px-6 py-5 bg-white text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isCancelling ? 'Đang xử lý...' : 'Hủy đăng ký'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || isFull || isClosed}
                      className={cn(
                        "w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl",
                        isFull || isClosed 
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                      )}
                    >
                      {isRegistering ? 'Đang xử lý...' : isFull ? 'Đã hết chỗ' : isClosed ? 'Đã đóng' : 'Đăng ký ngay'}
                    </button>
                    <p className="text-center text-stone-400 text-xs font-bold uppercase tracking-widest">
                      {isFull ? 'Hoạt động đã đạt giới hạn thành viên' : isClosed ? 'Hoạt động đã kết thúc hoặc đóng đăng ký' : 'Nhấn để giữ chỗ cho bạn'}
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <Link
                    to="/login"
                    className="w-full py-6 rounded-[2rem] font-bold text-xl bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/20 flex items-center justify-center gap-3"
                  >
                    Đăng nhập để tham gia
                    <ArrowRight size={20} />
                  </Link>
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                    <p className="text-stone-500 text-xs font-medium leading-relaxed text-center">
                      Bạn cần có tài khoản thành viên để đăng ký tham gia các hoạt động tình nguyện.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
