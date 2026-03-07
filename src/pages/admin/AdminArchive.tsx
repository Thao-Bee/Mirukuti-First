import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Archive, 
  Download, 
  AlertCircle,
  ChevronRight,
  FileText,
  History,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useYear } from '../../contexts/YearContext';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface AcademicYear {
  year: string;
  is_current: number;
  created_at: string;
}

export function AdminArchive() {
  const { selectedYear, setSelectedYear } = useYear();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = () => {
    setIsLoading(true);
    fetch('/api/years')
      .then(res => res.json())
      .then(data => {
        setYears(data);
        setIsLoading(false);
      });
  };

  const exportMembers = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export/members?year=${selectedYear}`);
      const data = await res.json();
      
      const worksheetData = data.map((u: any, index: number) => ({
        'Stt': index + 1,
        'Tên': u.full_name,
        'Mã sinh viên': u.student_id,
        'Email': u.email,
        'Sinh viên năm': u.university_year,
        'Ngày vào CLB': format(new Date(u.created_at), 'dd/MM/yyyy'),
        'Số điện thoại': u.phone,
        'Tên trên ứng dụng Line': u.line_name || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Thành viên");
      XLSX.writeFile(workbook, `Danh_sach_thanh_vien_${selectedYear}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportActivities = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export/activities?year=${selectedYear}`);
      const data = await res.json();
      
      const worksheetData = data.map((a: any) => ({
        'Tên hoạt động': a.title,
        'Ngày tháng năm đã tổ chức': format(new Date(a.date), 'dd/MM/yyyy'),
        'Số lượng thành viên đã tham gia': a.attended_count,
        'Số lượng thành viên vắng': a.absent_count,
        'Ghi chú': a.status === 'cancelled' ? 'ĐÃ HUỶ' : (a.notes || '')
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hoạt động");
      XLSX.writeFile(workbook, `Danh_sach_hoat_dong_${selectedYear}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Lưu trữ & Báo cáo</h1>
          <p className="text-stone-500 mt-2 font-medium">Năm học {selectedYear} • Xem lại dữ liệu lịch sử và xuất báo cáo tổng kết.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Years List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3 tracking-tight">
            <History size={24} className="text-emerald-600" />
            Danh sách năm học
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-stone-100 rounded-[2.5rem] animate-pulse" />)
            ) : years.map((y) => (
              <motion.div
                key={y.year}
                layout
                className={cn(
                  "card p-8 transition-all flex items-center justify-between group",
                  y.year === selectedYear ? "border-emerald-500 shadow-xl ring-1 ring-emerald-500/20" : "hover:border-stone-300"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110",
                    y.is_current ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                  )}>
                    <Archive size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-stone-900 text-xl tracking-tight">Năm học {y.year}</h3>
                      {y.is_current === 1 && (
                        <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Hiện tại</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1.5">Khởi tạo: {format(new Date(y.created_at), 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedYear(y.year)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold transition-all uppercase tracking-widest",
                      y.year === selectedYear 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                        : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                    )}
                  >
                    {y.year === selectedYear ? 'Đang xem' : 'Xem dữ liệu'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reports & Tools */}
        <div className="space-y-8">
          <div className="card p-10 bg-stone-900 text-white relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 tracking-tight">
              <FileText size={24} className="text-emerald-500" />
              Xuất báo cáo
            </h2>
            <div className="space-y-4 relative z-10">
              <button 
                onClick={exportMembers}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group border border-white/5"
              >
                <div className="text-left">
                  <p className="font-bold text-sm">Danh sách thành viên</p>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mt-2">EXCEL (.xlsx)</p>
                </div>
                <Download size={20} className="text-stone-600 group-hover:text-white transition-colors" />
              </button>
              <button 
                onClick={exportActivities}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group border border-white/5"
              >
                <div className="text-left">
                  <p className="font-bold text-sm">Danh sách hoạt động</p>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mt-2">EXCEL (.xlsx)</p>
                </div>
                <Download size={20} className="text-stone-600 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="mt-10 p-6 bg-emerald-600/10 border border-emerald-600/20 rounded-3xl flex gap-4 relative z-10">
              <AlertCircle size={24} className="text-emerald-500 shrink-0" />
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Dữ liệu báo cáo được tổng hợp từ tất cả các hoạt động và đăng ký trong năm học {selectedYear}.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>

          <div className="card p-10">
            <h2 className="text-2xl font-bold text-stone-900 mb-8 tracking-tight">Trạng thái hệ thống</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500 font-bold uppercase tracking-widest">Lưu trữ</span>
                <span className="text-sm font-bold text-stone-900">12% / 100GB</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[12%] rounded-full shadow-lg shadow-emerald-500/20"></div>
              </div>
              <div className="flex items-center gap-3 mt-6 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                Tất cả dữ liệu an toàn
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exporting Overlay */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/80 backdrop-blur-xl text-white">
            <div className="text-center space-y-8">
              <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-emerald-500/20"></div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold tracking-tight">Đang xuất dữ liệu...</h3>
                <p className="text-stone-400 text-lg font-medium">Hệ thống đang chuẩn bị file Excel của bạn. Vui lòng đợi.</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
