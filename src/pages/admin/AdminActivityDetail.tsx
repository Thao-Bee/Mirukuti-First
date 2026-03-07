import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Image as ImageIcon,
  X, 
  Save, 
  Edit3,
  ExternalLink,
  Trash2,
  UserCheck,
  UserX,
  Info,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { Activity, Registration } from '../../types';
import { cn, generateTextImage } from '../../lib/utils';
import { format } from 'date-fns';

export function AdminActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [imageText, setImageText] = useState('');
  const [imageTextError, setImageTextError] = useState<string | null>(null);
  const [isListVisible, setIsListVisible] = useState(false);
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);
  const [localParticipants, setLocalParticipants] = useState<Registration[]>([]);
  const [hasAttendanceChanges, setHasAttendanceChanges] = useState(false);

  const handleImageTextChange = (text: string) => {
    setImageText(text);
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 20) {
      setImageTextError('Vượt quá giới hạn 20 từ. Chữ có thể bị tràn ra ngoài ảnh!');
    } else {
      setImageTextError(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [actRes, partRes] = await Promise.all([
        fetch(`/api/activities/${id}`),
        fetch(`/api/activities/${id}/participants`)
      ]);
      
      if (!actRes.ok) {
        console.error('Failed to fetch activity:', await actRes.text());
        setActivity(null);
        return;
      }

      const actData = await actRes.json();
      const partData = await partRes.json();
      
      if (!actData || actData.error) {
        setActivity(null);
      } else {
        setActivity(actData);
        setEditForm(actData);
      }
      setParticipants(partData);
      setLocalParticipants(partData);
      setHasAttendanceChanges(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setActivity(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalAttendanceChange = (userId: number, field: 'attendance_status' | 'note', value: string) => {
    setLocalParticipants(prev => prev.map(p => 
      p.user_id === userId ? { ...p, [field]: value } : p
    ));
    setHasAttendanceChanges(true);
  };

  const handleSaveAttendance = async () => {
    setIsUpdatingAttendance(true);
    try {
      // Find changed participants
      const changes = localParticipants.filter(lp => {
        const original = participants.find(p => p.user_id === lp.user_id);
        return original && (original.attendance_status !== lp.attendance_status || original.note !== lp.note);
      });

      if (changes.length === 0) {
        setHasAttendanceChanges(false);
        return;
      }

      // Update each change
      await Promise.all(changes.map(p => 
        fetch('/api/registrations/attendance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: p.user_id,
            activity_id: Number(id),
            attendance_status: p.attendance_status,
            note: p.note
          }),
        })
      ));

      setMessage({ type: 'success', text: 'Cập nhật điểm danh thành công!' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu điểm danh.' });
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  const handleExportExcel = () => {
    if (!activity) return;

    const exportDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    const wb = XLSX.utils.book_new();
    const ws_data = [
      [`DS ĐK THAM GIA ${activity.title.toUpperCase()}`],
      [`Ngày xuất file: ${exportDate}`],
      [],
      ['NO', 'Tên', 'Mã học sinh', 'SV năm', 'Địa chỉ Gmail', 'Ngày đăng ký', 'Điểm danh', 'Ghi chú'],
      ...participants.map((p, index) => [
        index + 1,
        p.full_name,
        p.student_id || '',
        p.university_year || '',
        p.email,
        format(new Date(p.registered_at), 'dd/MM/yyyy HH:mm'),
        p.attendance_status === 'present' ? 'Có mặt' : 
        p.attendance_status === 'absent_with_permission' ? 'Vắng có phép' :
        p.attendance_status === 'absent_without_permission' ? 'Vắng không phép' : 'Chưa điểm danh',
        p.note || ''
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Set column widths
    const wscols = [
      {wch: 5},  // NO
      {wch: 25}, // Tên
      {wch: 15}, // Mã học sinh
      {wch: 10}, // SV năm
      {wch: 30}, // Gmail
      {wch: 20}, // Ngày đăng ký
      {wch: 20}, // Điểm danh
      {wch: 30}, // Ghi chú
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Danh sách đăng ký");
    XLSX.writeFile(wb, `DS_DK_${activity.title.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Cập nhật hoạt động thành công!' });
        setIsEditing(false);
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: `Lỗi: ${errorData.error || 'Có lỗi xảy ra'}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi kết nối với máy chủ.' });
    }
  };

  const handleCancelActivity = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy hoạt động này? Trạng thái sẽ được chuyển thành "Đã hủy".')) return;
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Đã hủy hoạt động.' });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra.' });
    }
  };

  const handleDeleteActivity = async () => {
    if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn hoạt động này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        navigate('/admin/activities');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa.' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!activity) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Không tìm thấy hoạt động</h2></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-stone-500 hover:text-stone-900 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary px-6">
                <X size={20} />
                Hủy
              </button>
              <button onClick={handleSave} className="btn-primary px-8">
                <Save size={20} />
                Lưu thay đổi
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary px-8">
              <Edit3 size={20} />
              Chỉnh sửa
            </button>
          )}
        </div>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-3xl flex items-center gap-4 border shadow-lg",
            message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-12">
            <div className="flex items-center gap-4 mb-8">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                activity.status === 'open' ? "bg-blue-50 text-blue-700 border-blue-100" : 
                activity.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-100" :
                "bg-stone-100 text-stone-600 border-stone-200"
              )}>
                {activity.status === 'open' ? 'Đang mở đăng kí' : 
                 activity.status === 'cancelled' ? 'Đã hủy' : 'Đã kết thúc'}
              </span>
              <span className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                {format(new Date(activity.date), 'dd/MM/yyyy • HH:mm')}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="md:col-span-8 space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Tiêu đề hoạt động</label>
                      <input 
                        type="text" 
                        value={editForm.title} 
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        className="input-field text-xl font-bold"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Ngày diễn ra</label>
                        <input 
                          type="datetime-local" 
                          value={editForm.date ? editForm.date.slice(0, 16) : ''} 
                          onChange={e => setEditForm({...editForm, date: e.target.value})}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Địa điểm</label>
                        <input 
                          type="text" 
                          value={editForm.location} 
                          onChange={e => setEditForm({...editForm, location: e.target.value})}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Registration Info */}
                  <div className="md:col-span-4 space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Hạn đăng ký</label>
                      <input 
                        type="datetime-local" 
                        value={editForm.registration_deadline ? editForm.registration_deadline.slice(0, 16) : ''} 
                        onChange={e => setEditForm({...editForm, registration_deadline: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Số lượng tối đa</label>
                        <input 
                          type="number" 
                          value={editForm.capacity || ''} 
                          onChange={e => setEditForm({...editForm, capacity: e.target.value ? Number(e.target.value) : null})}
                          className="input-field"
                          placeholder="∞"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Trạng thái</label>
                        <select
                          value={editForm.status}
                          onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                          className="input-field"
                        >
                          <option value="open">Đang mở</option>
                          <option value="closed">Đã đóng</option>
                          <option value="completed">Đã kết thúc</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Full Width - Google Form & Description */}
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Link Google Form</label>
                      <input 
                        type="url" 
                        value={editForm.google_form_link || ''} 
                        onChange={e => setEditForm({...editForm, google_form_link: e.target.value})}
                        className="input-field"
                        placeholder="https://docs.google.com/forms/..."
                      />
                    </div>
                    <div className="md:col-span-8">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                      <textarea 
                        rows={2}
                        value={editForm.description} 
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                        className="input-field resize-none"
                      />
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="md:col-span-12 pt-6 border-t border-stone-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      <div className="md:col-span-7 space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Ảnh bìa hoạt động</label>
                          <div className="flex gap-4">
                            <input
                              type="url"
                              value={editForm.image_url || ''}
                              onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
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
                                      setEditForm({ ...editForm, image_url: reader.result as string });
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
                                  setEditForm({ ...editForm, image_url: dataUrl });
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
                          {editForm.image_url ? (
                            <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
              </div>
            ) : (
              <div className="space-y-10">
                {activity.image_url && (
                  <div className="w-full aspect-[21/9] rounded-4xl overflow-hidden border border-stone-200 shadow-sm">
                    <img 
                      src={activity.image_url} 
                      alt={activity.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight">{activity.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Thời gian</p>
                      <p className="text-sm font-bold text-stone-900">{format(new Date(activity.date), 'HH:mm • dd/MM')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Địa điểm</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{activity.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Số lượng</p>
                      <p className="text-sm font-bold text-stone-900">{activity.participant_count} / {activity.capacity || '∞'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Mô tả hoạt động</h3>
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-8 rounded-4xl border border-stone-100 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <button 
              onClick={() => setIsListVisible(!isListVisible)}
              className="w-full p-10 flex items-center justify-between hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Danh sách đăng ký</h3>
                <span className="px-4 py-2 bg-stone-100 rounded-2xl text-xs font-bold text-stone-600 uppercase tracking-widest">
                  {participants.length} Thành viên
                </span>
              </div>
              <div className="flex items-center gap-4">
                {isListVisible ? <ChevronUp size={24} className="text-stone-400" /> : <ChevronDown size={24} className="text-stone-400" />}
              </div>
            </button>
            
            <AnimatePresence>
              {isListVisible && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-10 pb-10 border-t border-stone-100"
                >
                  <div className="flex justify-between items-center mb-6 pt-6">
                    <div>
                      {hasAttendanceChanges && (
                        <button 
                          onClick={handleSaveAttendance}
                          disabled={isUpdatingAttendance}
                          className="btn-primary px-8 py-3 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                        >
                          {isUpdatingAttendance ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang lưu...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Save size={18} />
                              Lưu thay đổi
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleExportExcel}
                      className="btn-secondary flex items-center gap-2 text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                    >
                      <FileSpreadsheet size={18} />
                      Xuất file Excel
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="pb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Thành viên</th>
                          <th className="pb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Thời gian đăng ký</th>
                          <th className="pb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Điểm danh</th>
                          <th className="pb-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {localParticipants.map((p, i) => (
                          <tr key={i} className="group">
                            <td className="py-5">
                              <p className="font-bold text-stone-900">{p.full_name}</p>
                              <p className="text-xs text-stone-400 font-medium">{p.email}</p>
                              <p className="text-[10px] text-stone-400 mt-1">{p.student_id} • Năm {p.university_year}</p>
                            </td>
                            <td className="py-5">
                              <p className="text-xs font-bold text-stone-600">{format(new Date(p.registered_at), 'dd/MM/yyyy HH:mm')}</p>
                            </td>
                            <td className="py-5">
                              <div className="relative inline-block w-48">
                                <select 
                                  value={p.attendance_status}
                                  onChange={(e) => handleLocalAttendanceChange(p.user_id!, 'attendance_status', e.target.value)}
                                  className={cn(
                                    "w-full text-[11px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 border appearance-none transition-all cursor-pointer focus:ring-2 focus:ring-offset-1",
                                    p.attendance_status === 'present' ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500" : 
                                    p.attendance_status === 'absent_with_permission' ? "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500" :
                                    p.attendance_status === 'absent_without_permission' ? "bg-red-50 text-red-700 border-red-200 focus:ring-red-500" :
                                    "bg-stone-100 text-stone-500 border-stone-200 focus:ring-stone-400"
                                  )}
                                >
                                  <option value="pending">Chưa điểm danh</option>
                                  <option value="present">Có mặt</option>
                                  <option value="absent_with_permission">Vắng có phép</option>
                                  <option value="absent_without_permission">Vắng không phép</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50">
                                  <ChevronDown size={14} />
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <input 
                                type="text"
                                value={p.note || ''}
                                onChange={(e) => handleLocalAttendanceChange(p.user_id!, 'note', e.target.value)}
                                placeholder="Thêm ghi chú..."
                                className="text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 w-full transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="card p-8 space-y-8">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={16} />
              Thông tin bổ sung
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">Hạn đăng ký</p>
                <div className="flex items-center gap-3 text-stone-900 font-bold">
                  <Clock size={18} className="text-stone-300" />
                  {activity.registration_deadline ? format(new Date(activity.registration_deadline), 'dd/MM/yyyy HH:mm') : 'Không giới hạn'}
                </div>
              </div>
              
              {activity.google_form_link && (
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">Google Form</p>
                  <a 
                    href={activity.google_form_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 font-bold hover:underline"
                  >
                    <ExternalLink size={18} />
                    Mở form đăng ký
                  </a>
                </div>
              )}

              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">Ghi chú quản trị</p>
                <p className="text-sm text-stone-600 font-medium italic">
                  {activity.notes || 'Không có ghi chú.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-8 border-red-100 bg-red-50/30 space-y-6">
            <h4 className="text-lg font-bold text-red-900">Hành động</h4>
            <div className="space-y-3">
              <button 
                onClick={handleCancelActivity}
                className="w-full btn-secondary text-red-600 border-red-200 hover:bg-red-100 py-4"
              >
                Hủy hoạt động
              </button>
              <button 
                onClick={handleDeleteActivity}
                className="w-full btn-secondary text-stone-400 border-stone-200 hover:bg-stone-100 py-4"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
