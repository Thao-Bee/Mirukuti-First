import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Calendar, Sparkles, X, Mail, Instagram, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function HomePage() {
  const { user } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section - Recipe 2 Inspired */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/volunteer/1920/1080?blur=10" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="inline-block px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-[0.3em] bg-white/5 backdrop-blur-sm">
              Volunteer Club System
            </span>
            
            <h1 className="text-6xl md:text-9xl font-serif italic font-bold leading-tight tracking-tighter">
              Kết nối <br />
              <span className="text-emerald-400">Trái tim</span>
            </h1>
            
            <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Nền tảng quản lý và kết nối các hoạt động tình nguyện ý nghĩa dành cho sinh viên. Hãy cùng nhau tạo nên những thay đổi tích cực.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              {user ? (
                <>
                  <Link to="/profile" className="btn-primary px-10 py-5 text-lg shadow-2xl shadow-emerald-600/20">
                    My page
                  </Link>
                  <Link to="/activities" className="btn-secondary px-10 py-5 text-lg bg-transparent text-white border-white/20 hover:bg-white/10 flex items-center gap-2">
                    Xem hoạt động
                    <ArrowRight size={24} />
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/activities" 
                    className="group relative px-10 py-5 bg-white text-stone-900 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-2xl shadow-white/10 overflow-hidden"
                  >
                    <span className="relative z-10">Các hoạt động của chúng tôi</span>
                    <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/0 via-emerald-100/50 to-emerald-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>
                  <button 
                    onClick={() => setShowJoinModal(true)}
                    className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 flex items-center gap-2 active:scale-95"
                  >
                    Hãy tham gia với chúng tôi
                    <Sparkles size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce text-white/40 opacity-60">
          <div className="w-px h-6 bg-white/20 mx-auto mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Cuộn xuống</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: 'Thành viên active', value: '500+', icon: Users, color: 'text-blue-500' },
            { label: 'Hoạt động mỗi năm', value: '100+', icon: Calendar, color: 'text-emerald-500' },
            { label: 'Giờ tình nguyện', value: '5000+', icon: Sparkles, color: 'text-amber-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-4"
            >
              <div className={cn("w-16 h-16 mx-auto rounded-3xl bg-stone-100 flex items-center justify-center", stat.color)}>
                <stat.icon size={32} />
              </div>
              <h3 className="text-5xl font-bold text-stone-900">{stat.value}</h3>
              <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="card p-12 md:p-24 bg-emerald-600 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">Sứ mệnh của <br /> chúng tôi</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Chúng tôi tin rằng mỗi hành động nhỏ đều có thể tạo nên sự khác biệt lớn. VolunteerClub không chỉ là nơi quản lý hoạt động, mà là nơi nuôi dưỡng tinh thần cống hiến và trách nhiệm cộng đồng.
              </p>
              <ul className="space-y-4">
                {['Minh bạch trong quản lý', 'Kết nối cộng đồng sinh viên', 'Tôn vinh tinh thần tình nguyện'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden rotate-3 shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/mission/800/800" 
                  alt="Mission" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-400 rounded-[2rem] -rotate-6 flex items-center justify-center p-8 text-stone-900 font-bold text-center leading-tight shadow-xl">
                Cùng nhau <br /> lan tỏa <br /> yêu thương
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>
      {/* Join Us Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinModal(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-stone-900 tracking-tight">Liên hệ với chúng tôi</h3>
                    <p className="text-stone-500 font-medium">Ban quản lý Volunteer Club luôn sẵn sàng hỗ trợ bạn.</p>
                  </div>
                  <button 
                    onClick={() => setShowJoinModal(false)}
                    className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-5 p-6 bg-stone-50 rounded-3xl border border-stone-100 group hover:border-emerald-200 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                      <User size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Trưởng ban</p>
                      <p className="text-stone-900 font-bold text-lg">Nguyễn Văn A</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 p-6 bg-stone-50 rounded-3xl border border-stone-100 group hover:border-emerald-200 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Mail size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-stone-900 font-bold text-lg">admin@volunteerclub.vn</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href="https://line.me" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 group hover:bg-emerald-100 transition-all"
                    >
                      <MessageCircle size={32} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-emerald-700">Line App</span>
                    </a>
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-6 bg-pink-50 rounded-3xl border border-pink-100 group hover:bg-pink-100 transition-all"
                    >
                      <Instagram size={32} className="text-pink-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-pink-700">Instagram</span>
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <Link 
                    to="/login" 
                    onClick={() => setShowJoinModal(false)}
                    className="w-full btn-primary py-5 rounded-2xl text-lg shadow-xl shadow-emerald-600/20"
                  >
                    Đăng nhập để tham gia ngay
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
