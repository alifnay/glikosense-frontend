import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Settings, Calendar, Flame, Activity, ChevronRight, ChevronDown, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. Tipe data mentah dari Backend (Sesuai schema.prisma)
interface JurnalHistory {
    id: number;
    tanggal: string;
    status_kesehatan: string;
    total_kalori_masuk: number;
    total_kalori_keluar: number;
    total_beban_glikemik: number;
    makanan: { nama_makanan: string }[];
    aktivitas: { nama_aktivitas: string }[];
}

// 2. Tipe data yang sudah diformat untuk tampilan UI
interface FormattedLog {
    id: number;
    tanggal: string;
    rawDate: Date;
    status_bg: string;
    is_aman: boolean;
    ringkasan: {
        kalori_masuk: number;
        kalori_keluar: number;
        total_beban_glikemik: number;
    };
    makanan: string[];
    aktivitas: string[];
    items: string[];
}

export default function LogsPage() {
    const [historyLogs, setHistoryLogs] = useState<FormattedLog[]>([]);
    const [isLoading, setIsLoading] = useState(true); // State untuk animasi loading

    const [statusFilter, setStatusFilter] = useState<'ALL' | 'AMAN' | 'WASPADA'>('ALL');
    const [timeFilter, setTimeFilter] = useState<'TODAY' | '3_DAYS' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME'>('THIS_MONTH');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<FormattedLog | null>(null);

    const [userName, setUserName] = useState<string>('...');
    const [userEmail, setUserEmail] = useState<string>('...');
    const [activeAvatar, setActiveAvatar] = useState('User');

    // 3. Mengambil data otomatis saat halaman dibuka
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const userDataString = localStorage.getItem('user');
                if (!userDataString) return;
                
                const user = JSON.parse(userDataString);
                setUserName(user.nama || 'User');
                setUserEmail(user.email || 'user@email.com');

                const userString = localStorage.getItem('user');
                    if (userString) {
                        const user = JSON.parse(userString);
                        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
                        setActiveAvatar(savedAvatar || user.nama || 'User');
                }

                const handleAvatarUpdate = () => {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const u = JSON.parse(userStr);
                        const sa = localStorage.getItem(`avatar_${u.id}`);
                        setActiveAvatar(sa || u.nama || 'User');
                    }
                };

                window.addEventListener('avatarUpdated', handleAvatarUpdate);
                

                // ✅ FIX: Kirim userId sebagai query param agar backend filter per user
                const response = await axios.get(`https://glikosense-backend.vercel.app/api/riwayat-jurnal?userId=${user.id}`);
                const rawData: JurnalHistory[] = response.data;

                // 4. Format data agar sesuai dengan gaya tampilan React
                const formattedData = rawData.map((log) => {
                    // Gabungkan nama makanan & aktivitas jadi satu daftar (array) string
                    const makananNames = log.makanan.map(m => m.nama_makanan);
                    const aktivitasNames = log.aktivitas.map(a => a.nama_aktivitas);
                    const combinedItems = [...makananNames, ...aktivitasNames];

                    // Ubah format tanggal (Contoh: "Selasa, 14 Apr 2026")
                    const dateObj = new Date(log.tanggal);
                    const formattedDate = dateObj.toLocaleDateString('id-ID', {
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                    });

                    // Logika warna badge (Aman / Waspada)
                    const isAman = log.status_kesehatan.includes("AMAN");
                    let statusBgText = isAman ? "Normal" : "Waspada";
                    if (log.total_beban_glikemik < 50 && isAman) statusBgText = "Sangat Rendah";

                    return {
                        id: log.id,
                        tanggal: formattedDate,
                        rawDate: dateObj,
                        status_bg: statusBgText,
                        is_aman: isAman,
                        ringkasan: { 
                            kalori_masuk: log.total_kalori_masuk, 
                            kalori_keluar: log.total_kalori_keluar, 
                            total_beban_glikemik: log.total_beban_glikemik 
                        },
                        makanan: makananNames,
                        aktivitas: aktivitasNames,
                        items: combinedItems
                    };
                });

                // Urutkan dari yang terbaru
                const sortedData = formattedData.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
                setHistoryLogs(sortedData);
                return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
                } catch (error) {
                    console.error("Gagal memuat data riwayat:", error);
                } finally {
                    // Matikan loading animasi setelah data selesai dimuat
                    setIsLoading(false);
                }
        };
        fetchHistory();
    }, []);

    const timeFilterLabel = {
        'TODAY': 'Hari Ini',
        '3_DAYS': '3 Hari Terakhir',
        'THIS_WEEK': 'Minggu Ini',
        'THIS_MONTH': 'Bulan Ini',
        'THIS_YEAR': 'Tahun Ini',
        'ALL_TIME': 'Semua Waktu'
    };

    const filteredLogs = historyLogs.filter(log => {
        // Status Filter
        if (statusFilter === 'AMAN' && !log.is_aman) return false;
        if (statusFilter === 'WASPADA' && log.is_aman) return false;

        // Time Filter
        if (timeFilter !== 'ALL_TIME') {
            const now = new Date();
            // Start of today so we don't accidentally count today's hours as a full day etc., but this simple math works well enough
            const diffTime = Math.abs(now.getTime() - log.rawDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (timeFilter === 'TODAY' && now.toDateString() !== log.rawDate.toDateString()) return false;
            if (timeFilter === '3_DAYS' && diffDays > 3) return false;
            if (timeFilter === 'THIS_WEEK' && diffDays > 7) return false;
            if (timeFilter === 'THIS_MONTH' && diffDays > 31) return false;
            if (timeFilter === 'THIS_YEAR' && diffDays > 365) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] px-4 py-5 sm:px-6 md:pl-32 md:pr-10 md:py-8 pb-24 md:pb-8 font-sans text-slate-800">
            
            {/* --- HEADER --- */}
            <header className="flex items-center justify-between gap-3 mb-6 md:mb-10">
                <div className="min-w-0 pr-2">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight truncate leading-none md:leading-tight">History Logs</h1>
                    <p className="text-slate-400 font-medium text-xs md:text-sm mt-1 truncate">Riwayat jurnal kesehatan & gizi harian</p>
                </div>
                <div className="flex items-center gap-3 md:gap-5 shrink-0">
                    <Link to="/profile" className="text-slate-400 hover:text-blue-600 transition cursor-pointer"><Settings className="w-5 h-5 md:w-6 md:h-6" /></Link>
                    
                    {/* ✅ Nama & avatar dinamis dari data user */}
                    <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1 max-w-[100px] md:max-w-none">{userName}</p>
                            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[100px] md:max-w-none">{userEmail}</p>
                        </div>
                        <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeAvatar}`} 
                            alt="Profile Avatar" 
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 object-cover shadow-sm shrink-0"
                        />
                    </div>
                </div>
            </header>

            {/* --- FILTER BAR --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar scroll-smooth">
                    <button onClick={() => setStatusFilter('ALL')} className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition shadow-sm ${statusFilter === 'ALL' ? 'bg-slate-800 text-white shadow-slate-300' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Semua Data</button>
                    <button onClick={() => setStatusFilter('AMAN')} className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition shadow-sm ${statusFilter === 'AMAN' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Aman</button>
                    <button onClick={() => setStatusFilter('WASPADA')} className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition shadow-sm ${statusFilter === 'WASPADA' ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Waspada</button>
                </div>
                
                <div className="relative w-full sm:w-auto">
                    <button onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition w-full sm:w-auto justify-center">
                        <Calendar size={16} /> {timeFilterLabel[timeFilter]} <ChevronDown size={16} className={`transition-transform duration-300 ${isTimeDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {isTimeDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden">
                            {Object.entries(timeFilterLabel).map(([key, label]) => (
                                <button 
                                    key={key} 
                                    onClick={() => { setTimeFilter(key as any); setIsTimeDropdownOpen(false); }} 
                                    className={`cursor-pointer w-full text-left px-4 py-3 text-sm transition-colors ${timeFilter === key ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[50vh]">
                
                {/* 1. STATE: LOADING */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 h-full">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-slate-400 font-medium animate-pulse">Mengambil data dari database...</p>
                    </div>
                
                /* 2. STATE: DATA KOSONG */
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center h-full">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Tidak Ada Riwayat</h3>
                        <p className="text-slate-400 max-w-sm text-sm">Tidak ada data yang sesuai dengan filter saat ini.</p>
                    </div>
                
                /* 3. STATE: DATA ADA (LOOPING ARRAY) */
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} onClick={() => setSelectedLog(log)} className="group p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer bg-slate-50 hover:bg-white">
                                
                                {/* Bagian Kiri: Tanggal & Info */}
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-slate-800">{log.tanggal}</h3>
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                            log.is_aman ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {log.status_bg}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {/* Tampilkan maksimal 4 item agar UI tidak kepanjangan */}
                                        {log.items.slice(0, 4).map((item, index) => (
                                            <span key={index} className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                                                {item}
                                            </span>
                                        ))}
                                        {/* Jika item > 4, munculkan "+X lagi" */}
                                        {log.items.length > 4 && (
                                            <span className="text-[11px] font-bold text-slate-400 bg-slate-200 px-2.5 py-1 rounded-md">
                                                +{log.items.length - 4} lagi
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Bagian Kanan: Metrik & Tombol */}
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 mt-2 md:mt-0">
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-slate-400 mb-1 justify-center">
                                                <Flame size={12}/> <span className="text-[10px] uppercase font-bold">Masuk</span>
                                            </div>
                                            <p className="font-black text-slate-800">{log.ringkasan.kalori_masuk} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-slate-400 mb-1 justify-center">
                                                <Activity size={12}/> <span className="text-[10px] uppercase font-bold">Keluar</span>
                                            </div>
                                            <p className="font-black text-slate-800">{log.ringkasan.kalori_keluar} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shrink-0">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Tombol Load More hanya muncul jika loading selesai dan data tidak kosong */}
                {!isLoading && filteredLogs.length > 0 && (
                    <button className="cursor-pointer w-full mt-6 py-4 rounded-[1.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                        Muat Data Lebih Lama
                    </button>
                )}
            </div>

            {/* Modal / Popup Detail */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        {/* Header Modal */}
                        <div className={`p-6 border-b flex justify-between items-start ${selectedLog.is_aman ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedLog.tanggal}</h2>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedLog.is_aman ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {selectedLog.status_bg}
                                </span>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="cursor-pointer p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Konten Modal */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto customized-scrollbar">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                    <div className="flex justify-center text-orange-500 mb-2"><Flame size={20} /></div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 whitespace-nowrap">Kalori Masuk</p>
                                    <p className="text-lg font-black text-slate-800">{selectedLog.ringkasan.kalori_masuk}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                    <div className="flex justify-center text-blue-500 mb-2"><Activity size={20} /></div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 whitespace-nowrap">Kalori Keluar</p>
                                    <p className="text-lg font-black text-slate-800">{selectedLog.ringkasan.kalori_keluar}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                    <div className="flex justify-center text-purple-500 mb-2"><Activity size={20} /></div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 whitespace-nowrap">Total GI</p>
                                    <p className="text-lg font-black text-slate-800">{selectedLog.ringkasan.total_beban_glikemik}</p>
                                </div>
                            </div>

                            {/* Lists */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        🍔 Makanan Dikonsumsi
                                    </h3>
                                    {selectedLog.makanan.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedLog.makanan.map((m, idx) => (
                                                <li key={idx} className="bg-white border border-slate-100 p-3 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-3 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Tidak ada catatan makanan.</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                                        🏃‍♂️ Aktivitas Fisik
                                    </h3>
                                    {selectedLog.aktivitas.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedLog.aktivitas.map((a, idx) => (
                                                <li key={idx} className="bg-white border border-slate-100 p-3 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-3 shadow-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                                    {a}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Tidak ada catatan aktivitas.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                            <button onClick={() => setSelectedLog(null)} className="cursor-pointer w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition shadow-md">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}