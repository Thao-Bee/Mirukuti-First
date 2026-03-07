import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  GraduationCap,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { useYear } from '../../contexts/YearContext';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function AdminMembers() {
  const { selectedYear } = useYear();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'board' | 'member'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    phone: '',
    role: 'member',
    university_year: '1',
    department: '',
    line_name: ''
  });

  const fetchMembers = () => {
    setIsLoading(true);
    fetch(`/api/users?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          university_year: parseInt(formData.university_year),
          academic_year: selectedYear,
          status: 'active'
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          full_name: '',
          email: '',
          student_id: '',
          phone: '',
          role: 'member',
          university_year: '1',
          department: '',
          line_name: ''
        });
        fetchMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) || 
                         m.email.toLowerCase().includes(search.toLowerCase()) ||
                         m.student_id?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-1.5"><Shield size={12} /> Admin</span>;
      case 'board': return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 flex items-center gap-1.5"><Shield size={12} /> Ban cán sự</span>;
      default: return <span className="px-3 py-1 bg-stone-50 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-100 flex items-center gap-1.5"><UserIcon size={12} /> Thành viên</span>;
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Quản lý thành viên</h1>
          <p className="text-stone-500 mt-2 font-medium">Năm học {selectedYear} • {members.length} thành viên đã đăng ký</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus size={20} />
          Thêm thành viên
        </button>
      </header>

      {/* Controls */}
      <div className="card p-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc mã sinh viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'board', 'member'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-6 py-4 rounded-2xl text-sm font-bold capitalize transition-all",
                roleFilter === r 
                  ? "bg-stone-900 text-white shadow-lg" 
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              )}
            >
              {r === 'all' ? 'Tất cả' : r === 'board' ? 'Ban cán sự' : 'Thành viên'}
            </button>
          ))}
        </div>
      </div>

      {/* Table - Recipe 1 Style */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-bottom border-stone-200">
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Thành viên</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Vai trò</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Thông tin học tập</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Liên hệ</th>
                <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-stone-50 rounded-2xl" /></td>
                  </tr>
                ))
              ) : filtered.map((member) => (
                <tr key={member.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-lg overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : member.full_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">{member.full_name}</p>
                        <p className="text-xs text-stone-400 font-medium mt-0.5">ID: {member.student_id || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
                        <GraduationCap size={14} className="text-stone-400" />
                        Năm {member.university_year}
                      </p>
                      <p className="text-xs text-stone-400 font-medium">{member.department || 'Chưa cập nhật'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-600 flex items-center gap-2">
                        <Mail size={12} className="text-stone-400" />
                        {member.email}
                      </p>
                      <p className="text-xs font-bold text-stone-600 flex items-center gap-2">
                        <Phone size={12} className="text-stone-400" />
                        {member.phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link
                      to={`/admin/members/${member.id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 text-stone-400 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-stone-400 font-bold uppercase tracking-widest">Không tìm thấy thành viên nào</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 md:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-bold text-stone-900 tracking-tight">Thêm thành viên mới</h3>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Họ và tên</label>
                      <input
                        required
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="input-field"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Mã sinh viên</label>
                      <input
                        required
                        type="text"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="input-field"
                        placeholder="SV001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                        placeholder="09xxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Sinh viên năm</label>
                      <select
                        value={formData.university_year}
                        onChange={(e) => setFormData({ ...formData, university_year: e.target.value })}
                        className="input-field"
                      >
                        <option value="1">Năm 1</option>
                        <option value="2">Năm 2</option>
                        <option value="3">Năm 3</option>
                        <option value="4">Năm 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Khoa / Ngành</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input-field"
                        placeholder="CNTT"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Tên Line</label>
                      <input
                        type="text"
                        value={formData.line_name}
                        onChange={(e) => setFormData({ ...formData, line_name: e.target.value })}
                        className="input-field"
                        placeholder="line_id"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Vai trò</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="input-field"
                      >
                        <option value="member">Thành viên</option>
                        <option value="board">Ban cán sự</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-secondary flex-1 py-4"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1 py-4"
                    >
                      <Check size={20} />
                      Thêm thành viên
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
