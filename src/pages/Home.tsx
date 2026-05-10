import { useEffect, useState } from 'react';
import { Settings, Sparkles, TrendingUp, Activity, Droplets, CheckCircle2, Loader2, HelpCircle, X, BookOpen, Zap, Apple, Utensils, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Tipe data dari endpoint /api/dashboard
interface DashboardUser {
    id: number;
    nama: string;
    email: string;
    berat_badan: number | null;
}

interface JurnalMakanan {
    id: number;
    nama_makanan: string;
    porsi: string;
    kalori: number;
    karbo_gram: number;
    beban_glikemik: number;
}

interface JurnalAktivitas {
    id: number;
    nama_aktivitas: string;
    durasi_menit: number;
    kalori_terbakar: number;
}

interface JurnalHariIni {
    total_kalori_masuk: number;
    total_kalori_keluar: number;
    total_beban_glikemik: number;
    status_kesehatan: string;
    pesan_insight: string;
    makanan: JurnalMakanan[];
    aktivitas: JurnalAktivitas[];
}

interface DashboardData {
    user: DashboardUser;
    jurnal_hari_ini: JurnalHariIni | null;
}

interface StreakDay {
    tanggal: string;
    label: string;
    isToday: boolean;
    isFuture: boolean;
    hasJurnal: boolean;
    status: string | null;
    total_beban_glikemik?: number;
}

const TARGET_KALORI_KELUAR = 600;

export default function Home() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [streakData, setStreakData] = useState<StreakDay[]>([]);
    const [streakCount, setStreakCount] = useState<number>(0);
    const [showGlModal, setShowGlModal] = useState(false);
    const [activeAvatar, setActiveAvatar] = useState('User');

    useEffect(() => {
        const CACHE_KEY_DASHBOARD = 'cache_dashboard';
        const CACHE_KEY_STREAK    = 'cache_streak';
        const MAX_RETRY = 3;
        const RETRY_DELAY_MS = 1500;

        const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

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

const fetchWithRetry = async (url: string, retries = MAX_RETRY): Promise<any> => {
            // ✅ 1. Ambil token dari brankas browser (localStorage)
            const token = localStorage.getItem('token'); 

            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const res = await axios.get(url, { 
                        timeout: 8000,
                        // ✅ 2. Sisipkan token ke dalam Header layaknya tiket VIP
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    return res.data;
                } catch (err) {
                    console.warn(`Attempt ${attempt} gagal untuk ${url}`);
                    if (attempt < retries) await sleep(RETRY_DELAY_MS);
                }
            }
            throw new Error(`Gagal fetch setelah ${retries} percobaan`);
        };

        const fetchDashboard = async () => {
            const userString = localStorage.getItem('user');
            if (!userString) return;
            const user = JSON.parse(userString);

            // ✅ STEP 1: Tampilkan cache dulu agar dashboard tidak kosong
            const cachedDash   = localStorage.getItem(CACHE_KEY_DASHBOARD);
            const cachedStreak = localStorage.getItem(CACHE_KEY_STREAK);

            if (cachedDash && cachedStreak) {
                // Tampilkan data lama, loading langsung selesai
                setData(JSON.parse(cachedDash));
                const streakCache = JSON.parse(cachedStreak);
                setStreakData(streakCache.streakData);
                setStreakCount(streakCache.streakCount);
                setIsLoading(false);
            }

            // ✅ STEP 2: Fetch data baru di background (dengan retry otomatis)
            try {
                const [dashData, streakData] = await Promise.all([
                    fetchWithRetry(`https://glikosense-backend.vercel.app/api/dashboard?userId=${user.id}`),
                    fetchWithRetry(`https://glikosense-backend.vercel.app/api/streak?userId=${user.id}`)
                ]);

                // Update state dengan data fresh
                setData(dashData);
                setStreakData(streakData.streakData);
                setStreakCount(streakData.streakCount);

                // Simpan ke cache untuk kunjungan berikutnya
                localStorage.setItem(CACHE_KEY_DASHBOARD, JSON.stringify(dashData));
                localStorage.setItem(CACHE_KEY_STREAK, JSON.stringify(streakData));
            } catch (error) {
                console.error("Gagal memuat data dashboard setelah retry:", error);
                // Kalau fetch tetap gagal, data cache tetap tampil — tidak blank
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    const jurnal = data?.jurnal_hari_ini;
    const userName = data?.user.nama ?? '...';
    const userEmail = data?.user.email ?? '...';
    const kaloriMasuk = jurnal?.total_kalori_masuk ?? 0;
    const kaloriKeluar = jurnal?.total_kalori_keluar ?? 0;
    const bebanGlikemik = jurnal?.total_beban_glikemik ?? 0;
    const totalKarbo = jurnal?.makanan.reduce((sum, m) => sum + m.karbo_gram, 0) ?? 0;
    const pctBurnTarget = Math.min(Math.round((kaloriKeluar / TARGET_KALORI_KELUAR) * 100), 100);
    const pctGlikemik = Math.min(Math.round((bebanGlikemik / 100) * 100), 100);
    const insightPesan = jurnal?.pesan_insight ?? "Belum ada jurnal hari ini. Yuk catat makanan dan aktivitasmu!";
    const insightStatus = jurnal?.status_kesehatan ?? "—";

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#F6F8FA] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="font-medium animate-pulse">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen w-full bg-[#F6F8FA] px-4 py-5 sm:px-6 md:pl-32 md:pr-10 md:py-8 pb-24 md:pb-8 font-sans text-slate-800">
            
            {/* --- 1. HEADER --- */}
            <header className="flex items-center justify-between gap-3 mb-6 md:mb-10">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg text-sm md:text-base">G</div>
                    <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 truncate">GlukoSense</span>
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
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 object-cover shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* --- 2. MAIN BENTO GRID --- */}
            <div className="grid grid-cols-12 gap-6 md:gap-8">
                
                {/* Title Area */}
                <div className="col-span-12 xl:col-span-4 flex flex-col justify-center">
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                        Pemantauan <br/> Harian
                    </h1>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <p className="text-slate-500 text-sm font-medium">Catatan Asisten Kesehatan AI</p>
                    </div>
                </div>

                {/* AI Medical Insight Card */}
                <div className="col-span-12 xl:col-span-8">
                    <div className="h-full rounded-[2rem] bg-gradient-to-r from-[#4F75FF] to-[#7A5AF8] p-8 text-white flex gap-5 shadow-[0_20px_40px_-15px_rgba(79,117,255,0.4)] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="shrink-0 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                                <Sparkles size={24} className="text-white"/>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg text-white tracking-wide">Insight Kesehatan AI</h3>
                                {/* ✅ Button info GL */}
                                <button
                                    onClick={() => setShowGlModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-bold transition-all backdrop-blur-sm shrink-0 cursor-pointer"
                                >
                                    <HelpCircle size={13} /> Apa itu GL?
                                </button>
                            </div>
                            <p className="text-blue-50 text-sm md:text-base leading-relaxed opacity-90">{insightPesan}</p>
                        </div>
                    </div>
                </div>

                {/* ✅ Calorie Summary Card - lebih relevan untuk monitoring diabetes */}
                <div className="col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="h-full rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ringkasan Kalori</p>
                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><Utensils size={16}/></div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Asupan Hari Ini</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{kaloriMasuk}</span>
                                <span className="text-sm font-semibold text-slate-400">kcal masuk</span>
                            </div>
                        </div>
                        {/* Progress bar menuju target kalori harian */}
                        <div className="mt-6">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                <span>Progress</span>
                                <span>Target: 2000 kcal</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${kaloriMasuk > 2000 ? 'bg-red-400' : kaloriMasuk > 1500 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                                    style={{ width: `${Math.min(Math.round((kaloriMasuk / 2000) * 100), 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 flex-1 bg-slate-50 rounded-2xl p-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Droplets size={14} className="text-blue-500"/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total Karbo</p>
                                        <p className="font-extrabold text-slate-800 text-sm">{totalKarbo.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">gram</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-1 bg-slate-50 rounded-2xl p-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><Apple size={14} className="text-emerald-500"/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Jenis Makanan</p>
                                        <p className="font-extrabold text-slate-800 text-sm">{jurnal?.makanan.length ?? 0} <span className="text-[10px] font-normal text-slate-400">item</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glycemic Load Card - ✅ Dari total_beban_glikemik & status_kesehatan */}
                <div className="col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="h-full rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Glycemic Index</p>
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Droplets size={16}/></div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Glycemic Load</h2>
                            <div className="text-center">
                                <span className="text-[5rem] font-extrabold text-blue-600 leading-none tracking-tighter">{bebanGlikemik.toFixed(1)}</span>
                                <div className="flex items-center justify-center gap-1 mt-2 text-green-500">
                                    <CheckCircle2 size={14} />
                                    <span className="text-xs font-bold">Status: {insightStatus}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                <span>Level Harian</span>
                                <span>Batas: 100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                {/* ✅ Warna progress bar berubah sesuai level risiko */}
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${pctGlikemik > 80 ? 'bg-red-400' : pctGlikemik > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                                    style={{ width: `${pctGlikemik}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Physical Activity Card - ✅ Loop JurnalAktivitas[] hari ini */}
                <div className="col-span-12 xl:col-span-4 xl:row-span-2">
                    <div className="h-full rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Aktivitas Fisik</h2>
                        </div>

                        {jurnal && jurnal.aktivitas.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {jurnal.aktivitas.map((act) => (
                                    <div key={act.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-b-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{act.nama_aktivitas}</p>
                                                <p className="text-xs text-slate-400 font-medium">{act.durasi_menit} min</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-green-500">-{act.kalori_terbakar}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Kcal</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-sm font-medium">
                                Belum ada aktivitas hari ini.
                            </div>
                        )}

                        {/* Activity Tip - ✅ Pesan menyesuaikan data */}
                        <div className="mt-6 rounded-3xl bg-[#F4F7FB] p-6 border border-blue-50/50 relative overflow-hidden">
                            <div className="flex items-center gap-2 text-blue-600 mb-3">
                                <TrendingUp size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Tips Aktivitas</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {kaloriKeluar > 0
                                    ? <>Kamu sudah membakar <span className="text-blue-600 font-bold">{kaloriKeluar} kcal</span> hari ini. Aktivitas fisik rutin sangat membantu menjaga sensitivitas insulin.</>
                                    : "Belum ada aktivitas hari ini. Yuk mulai gerak untuk menjaga kesehatan gula darahmu!"
                                }
                            </p>
                        </div>

                        {/* ✅ Progress burn target dinamis */}
                        <div className="mt-auto pt-8">
                            <div className="flex items-end justify-between mb-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Burn Target</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-extrabold text-slate-800">{TARGET_KALORI_KELUAR}</span>
                                        <span className="text-xs font-semibold text-slate-400">kcal</span>
                                    </div>
                                </div>
                                <span className="text-2xl font-extrabold text-blue-600">{pctBurnTarget}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                                    style={{ width: `${pctBurnTarget}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Journaling Streak Card - 7 hari rolling */}
                <div className="col-span-12 xl:col-span-8">
                    <div className="h-full rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Journaling Streak</h2>
                                <p className="text-xs font-medium text-slate-400 mt-1">Riwayat catatan harian 7 hari terakhir</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 border border-orange-100">
                                <Zap size={16} className="text-orange-500" />
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-extrabold text-orange-600 leading-none">{streakCount}</span>
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">hari streak</span>
                                </div>
                            </div>
                        </div>

                        {/* 7 Kotak Streak */}
                        <div className="grid grid-cols-7 gap-1.5 md:gap-3 mt-6">
                            {streakData.map((day, idx) => {
                                const isAman = day.status?.includes('AMAN');
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-1.5 md:gap-2 group cursor-pointer relative">
                                        {/* Tooltip Hover untuk Beban Glikemik (Hanya untuk Hari yang Punya Jurnal) */}
                                        {day.hasJurnal && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] md:text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                                GL: {day.total_beban_glikemik !== undefined ? (typeof day.total_beban_glikemik === 'number' ? day.total_beban_glikemik.toFixed(1) : day.total_beban_glikemik) : '?'}
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
                                            </div>
                                        )}

                                        {/* Label hari (Sen, Sel, dll) */}
                                        <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${day.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {day.label.split(' ')[0]}
                                        </p>

                                        {/* Kotak utama */}
                                        <div className={`
                                            w-full aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center relative transition-all group-hover:-translate-y-1
                                            ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 md:ring-offset-2' : ''}
                                            ${day.isFuture
                                                ? 'bg-slate-50 border-2 border-dashed border-slate-200'
                                                : day.hasJurnal
                                                    ? isAman
                                                        ? 'bg-emerald-500 shadow-md md:shadow-lg shadow-emerald-500/30'
                                                        : 'bg-orange-400 shadow-md md:shadow-lg shadow-orange-400/30'
                                                    : 'bg-slate-100 border border-slate-200'
                                            }
                                        `}>
                                            {day.isFuture ? (
                                                <span className="text-slate-300 text-sm md:text-lg">·</span>
                                            ) : day.hasJurnal ? (
                                                <>
                                                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white" />
                                                    <span className={`text-[6px] sm:text-[7px] md:text-[9px] font-bold mt-0.5 md:mt-1 tracking-tighter sm:tracking-normal ${isAman ? 'text-emerald-100' : 'text-orange-100'}`}>
                                                        {isAman ? 'AMAN' : 'WASPADA'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-slate-300 text-sm md:text-lg">—</span>
                                            )}
                                            {/* Badge "TODAY" */}
                                            {day.isToday && (
                                                <span className="absolute -top-2.5 md:-top-3 text-[6px] md:text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap hidden sm:block">
                                                    HARI INI
                                                </span>
                                            )}
                                        </div>
                                        {/* Tanggal */}
                                        <p className={`text-[9px] md:text-[10px] font-bold ${day.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {day.label.split(' ')[1]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
                                <span className="text-[11px] font-bold text-slate-500">Jurnal — Status Aman</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-orange-400"></div>
                                <span className="text-[11px] font-bold text-slate-500">Jurnal — Waspada</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-slate-200"></div>
                                <span className="text-[11px] font-bold text-slate-500">Belum ada jurnal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-700 leading-relaxed font-medium">
                        <strong>Perhatian:</strong> Aplikasi ini ditujukan untuk tindakan preventif (pencegahan) bagi individu berisiko, bukan untuk pengganti diagnosis atau terapi pasien diabetes.
                    </p>
                </div>

            </div>
        </div>
            {/* --- MODAL: Penjelasan Glycemic Index & Load --- */}
            {showGlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
                                    <BookOpen size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Indeks & Beban Glikemik</h3>
                                    <p className="text-xs text-slate-400 font-medium">Panduan untuk penderita diabetes</p>
                                </div>
                            </div>
                            <button onClick={() => setShowGlModal(false)} className="text-slate-400 hover:text-slate-600 shrink-0 mt-1 cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Indeks Glikemik */}
                            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
                                <h4 className="font-extrabold text-blue-800 mb-2 flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                                    Apa itu Indeks Glikemik (GI)?
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Indeks Glikemik mengukur <span className="font-bold text-slate-800">seberapa cepat</span> suatu makanan menaikkan kadar gula darah. Skala 0–100, di mana glukosa murni = 100.
                                </p>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                                    <div className="bg-green-100 text-green-700 p-2 rounded-xl">GI ≤ 55<br/><span className="font-normal">Rendah ✓</span></div>
                                    <div className="bg-yellow-100 text-yellow-700 p-2 rounded-xl">GI 56–69<br/><span className="font-normal">Sedang ⚠</span></div>
                                    <div className="bg-red-100 text-red-700 p-2 rounded-xl">GI ≥ 70<br/><span className="font-normal">Tinggi ✗</span></div>
                                </div>
                            </div>

                            {/* Beban Glikemik */}
                            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                                <h4 className="font-extrabold text-indigo-800 mb-2 flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                                    Apa itu Beban Glikemik (GL)?
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Beban Glikemik lebih akurat dari GI karena memperhitungkan <span className="font-bold text-slate-800">jumlah porsi</span> yang dimakan. GL = (GI × gram karbo) ÷ 100.
                                </p>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                                    <div className="bg-green-100 text-green-700 p-2 rounded-xl">GL ≤ 10<br/><span className="font-normal">Rendah ✓</span></div>
                                    <div className="bg-yellow-100 text-yellow-700 p-2 rounded-xl">GL 11–19<br/><span className="font-normal">Sedang ⚠</span></div>
                                    <div className="bg-red-100 text-red-700 p-2 rounded-xl">GL ≥ 20<br/><span className="font-normal">Tinggi ✗</span></div>
                                </div>
                            </div>

                            {/* Pengaruh ke Diabetes */}
                            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100">
                                <h4 className="font-extrabold text-rose-800 mb-2 flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">3</span>
                                    Pengaruhnya untuk Diabetes
                                </h4>
                                <ul className="text-sm text-slate-600 leading-relaxed space-y-2">
                                    <li className="flex gap-2"><span className="text-rose-400 font-black shrink-0">•</span> Makanan dengan GL tinggi menyebabkan lonjakan gula darah mendadak yang berbahaya bagi penderita diabetes.</li>
                                    <li className="flex gap-2"><span className="text-emerald-500 font-black shrink-0">•</span> Makanan GL rendah membuat gula darah naik perlahan dan stabil, membantu menjaga HbA1c tetap normal.</li>
                                    <li className="flex gap-2"><span className="text-blue-500 font-black shrink-0">•</span> Target total GL harian untuk penderita diabetes: di bawah 100 per hari.</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowGlModal(false)}
                            className="mt-6 w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 cursor-pointer"
                        >
                            Mengerti!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}