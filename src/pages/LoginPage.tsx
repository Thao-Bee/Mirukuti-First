import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email);
      // The user state will be updated by the context
      // We need to check the user role from the context or just navigate based on the email
      // But since we don't have the user object yet in the local scope, 
      // it's better to let the AuthContext handle the fetch and then navigate.
      // However, we need to know where to navigate.
      
      // Let's fetch the user one more time or change AuthContext to return the user.
      // Actually, I'll just update LoginPage to use the login function from context properly.
    } catch (err: any) {
      setError(err.message || 'Email không tồn tại trong hệ thống.');
    } finally {
      setIsLoading(false);
    }
  };

  // Use useEffect to navigate when user is set
  const { user } = useAuth();
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-1 bg-stone-900 text-white p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 font-bold text-white text-3xl tracking-tight">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">V</div>
            <span>VolunteerClub</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-7xl font-serif italic font-bold leading-tight tracking-tighter">
            Lan tỏa <br />
            <span className="text-emerald-400">Yêu thương</span>
          </h1>
          <p className="text-stone-400 text-xl max-w-md font-medium leading-relaxed">
            Tham gia cùng hàng nghìn sinh viên khác trong hành trình thay đổi thế giới bằng những hành động nhỏ bé.
          </p>
        </div>

        <div className="relative z-10 flex gap-12 text-sm font-bold text-stone-500 uppercase tracking-[0.2em]">
          <span>Community</span>
          <span>Impact</span>
          <span>Growth</span>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <Sparkles className="absolute top-1/4 right-1/4 w-64 h-64" />
          <Heart className="absolute bottom-1/4 left-1/4 w-48 h-48" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight">Chào mừng trở lại</h2>
            <p className="text-stone-500 font-medium">Nhập email của bạn để truy cập hệ thống.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu.vn"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-stone-200 rounded-[2rem] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
                />
              </div>
              {error && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-5 text-lg shadow-emerald-600/30"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Tiếp tục
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-stone-100">
            <div className="bg-stone-100 p-6 rounded-3xl flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400">
                <Shield size={20} />
              </div>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Hệ thống sử dụng email để định danh. Nếu bạn chưa có tài khoản, vui lòng liên hệ Ban cán sự để được cấp quyền truy cập.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/" className="text-stone-400 hover:text-stone-900 text-sm font-bold uppercase tracking-widest transition-colors">
              Quay lại trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
