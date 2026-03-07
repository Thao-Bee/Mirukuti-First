import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Shield, 
  Edit3, 
  Save, 
  X,
  User as UserIcon,
  Info,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export function AdminMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = () => {
    setIsLoading(true);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setMember(data);
        setEditForm(data);
        setIsLoading(false);
      });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        setIsEditing(false);
        fetchMember();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật.' });
    }
  };

  const handleDeleteMember = async () => {
    if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn thành viên này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        navigate('/admin/members');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa.' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!member) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Không tìm thấy thành viên</h2></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
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
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <Info size={24} />}
          <p className="font-bold">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card p-10 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-[3rem] bg-stone-100 flex items-center justify-center text-stone-300 text-5xl font-bold overflow-hidden border-4 border-white shadow-2xl mx-auto">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : member.full_name[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                <Shield size={20} />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{member.full_name}</h2>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mt-2">{member.role === 'admin' ? 'Administrator' : member.role === 'board' ? 'Ban cán sự' : 'Thành viên'}</p>
            </div>

            <div className="pt-6 border-t border-stone-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Trạng thái</p>
                <p className="text-emerald-600 font-bold mt-1">Hoạt động</p>
              </div>
              <div className="text-center border-l border-stone-100">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Năm học</p>
                <p className="text-stone-900 font-bold mt-1">{member.academic_year}</p>
              </div>
            </div>
          </div>

          <div className="card p-8 space-y-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={16} />
              Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-stone-900">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Số điện thoại</p>
                  <p className="text-sm font-bold text-stone-900">{member.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Quê quán</p>
                  <p className="text-sm font-bold text-stone-900">{member.hometown || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-12">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight mb-10">Thông tin chi tiết</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <UserIcon size={14} />
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.full_name} 
                      onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-bold text-stone-900">{member.full_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <GraduationCap size={14} />
                    Mã sinh viên
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.student_id} 
                      onChange={e => setEditForm({...editForm, student_id: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-bold text-stone-900">{member.student_id || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Briefcase size={14} />
                    Khoa / Ngành
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.department} 
                      onChange={e => setEditForm({...editForm, department: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-bold text-stone-900">{member.department || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={14} />
                    Tên ứng dụng Line
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.line_name || ''} 
                      onChange={e => setEditForm({...editForm, line_name: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-bold text-stone-900">{member.line_name || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar size={14} />
                    Ngày sinh
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={editForm.birthday} 
                      onChange={e => setEditForm({...editForm, birthday: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-bold text-stone-900">{member.birthday ? format(new Date(member.birthday), 'dd/MM/yyyy') : 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <GraduationCap size={14} />
                    Năm sinh viên
                  </label>
                  {isEditing ? (
                    <select 
                      value={editForm.university_year} 
                      onChange={e => setEditForm({...editForm, university_year: parseInt(e.target.value)})}
                      className="input-field"
                    >
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-stone-900">Năm thứ {member.university_year}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield size={14} />
                    Vai trò trong CLB
                  </label>
                  {isEditing ? (
                    <select 
                      value={editForm.role} 
                      onChange={e => setEditForm({...editForm, role: e.target.value as any})}
                      className="input-field"
                    >
                      <option value="member">Thành viên</option>
                      <option value="board">Ban cán sự</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-stone-900 capitalize">{member.role === 'board' ? 'Ban cán sự' : member.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Giới thiệu bản thân</label>
                {isEditing ? (
                  <textarea 
                    rows={4}
                    value={editForm.bio} 
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="input-field resize-none"
                    placeholder="Viết vài dòng giới thiệu..."
                  />
                ) : (
                  <p className="text-stone-600 leading-relaxed bg-stone-50 p-6 rounded-3xl border border-stone-100 italic">
                    "{member.bio || 'Chưa có giới thiệu.'}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="card p-10 border-red-100 bg-red-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-red-900">Vùng nguy hiểm</h4>
                  <p className="text-sm text-red-600 font-medium">Xóa thành viên này khỏi hệ thống. Hành động này không thể hoàn tác.</p>
                </div>
                <button 
                  onClick={handleDeleteMember}
                  className="btn-secondary text-red-600 border-red-200 hover:bg-red-100"
                >
                  <Trash2 size={20} />
                  Xóa thành viên
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
