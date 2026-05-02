import axios from 'axios';
import { useState, useEffect } from 'react';
import { Sparkles, Dumbbell, Flame, Utensils, Settings, Check, Loader2, AlertCircle, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. Interface yang sudah diperbarui sesuai Output Flask & MySQL
interface UIExtractedData {
    detail_aktivitas: Array<{ 
        nama: string; 
        durasi_menit: number; 
        met: number; 
        kalori_terbakar: number; 
    }>;
    detail_makanan: Array<{ 
        nama: string; 
        porsi: string; 
        kalori: number; 
        karbo_gram: number; 
        indeks_glikemik: number; 
        beban_glikemik: number; 
        kategori_bg: string; 
    }>;
    ringkasan: { 
        kalori_masuk: number; 
        kalori_keluar: number; 
        total_beban_glikemik: number; 
        target_masuk: number; 
        target_keluar: number; 
    };
    insight_medis: { 
        status: string; 
        pesan: string; 
    };
    tidak_ditemukan: string[];
}

export default function ChatPage() {
    const [journalInput, setJournalInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [extractedData, setExtractedData] = useState<UIExtractedData | null>(null);

    const [userName, setUserName] = useState<string>('...');
    const [userEmail, setUserEmail] = useState<string>('...');
    const [activeAvatar, setActiveAvatar] = useState('User');

    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            const user = JSON.parse(userDataString);
            setUserName(user.nama || 'User');
            setUserEmail(user.email || 'user@email.com');
        }

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
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!journalInput.trim()) return;
        setIsAnalyzing(true);
        
        try {
            const response = await fetch('https://alifnay-glukosense-ai.hf.space/api/analisis-jurnal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teks_jurnal: journalInput,
                    berat_badan: 65 
                })
            });

            if (!response.ok) {
                const errorText = await response.text(); 
                console.error("🚨 ALASAN ERROR DARI SERVER AI:", errorText);
                throw new Error(`Server menolak dengan status: ${response.status}`);
            }

            const data = await response.json();
            setExtractedData({
                ...data,
                ringkasan: { 
                    ...data.ringkasan,
                    target_masuk: 2200, 
                    target_keluar: 500   
                }
            });
            setHasData(true);
        } catch (error) {
            console.error("Gagal terhubung ke AI:", error);
            alert("Maaf, server AI sedang tidak merespons.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] px-4 py-5 sm:px-6 md:pl-32 md:pr-10 md:py-8 pb-24 md:pb-8 font-sans text-slate-800">
            <header className="flex items-center justify-between gap-3 mb-6 md:mb-10">
                <div className="min-w-0 pr-2">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight truncate leading-none md:leading-tight">Daily <span className="hidden sm:inline">Nutrition</span> Log</h1>
                    <p className="text-slate-400 font-medium mt-1 text-xs md:text-sm truncate">Sistem Pemantau Risiko Diabetes Berbasis AI</p>
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

            {!hasData || !extractedData ? (
                /* --- INPUT STATE --- */
                <div className="max-w-3xl mx-auto mt-10 lg:mt-20">
                    <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles size={24} className="text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-800">Smart Journal</h2>
                        </div>
                        <form onSubmit={handleAnalyze}>
                            <textarea 
                                value={journalInput}
                                onChange={(e) => setJournalInput(e.target.value)}
                                placeholder="Contoh: Tadi pagi makan bubur ayam 1 porsi, lalu sore lari 30 menit..."
                                className="w-full h-40 p-5 rounded-2xl bg-slate-50 border-none outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 text-lg"
                            ></textarea>
                            <div className="flex justify-end mt-6">
                                <button type="submit" disabled={isAnalyzing} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition flex items-center gap-2">
                                    {isAnalyzing ? <><Loader2 className="animate-spin" /> Analyzing...</> : 'Analyze Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* --- RESULTS STATE --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-500">
                    
                    {/* KOLOM KIRI: DETAILS */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* JOURNAL INPUT RECAP */}
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles size={18} className="text-blue-600"/> Transcript</h2>
                                <button onClick={() => setHasData(false)} className="text-sm text-blue-600 font-semibold">Edit Text</button>
                            </div>
                            <p className="italic text-slate-500 bg-slate-50 p-4 rounded-xl">"{journalInput}"</p>
                        </div>

                        {/* MEAL ENTRIES (MAP) */}
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Utensils size={18} /></div>
                                    Meal Entries
                                </h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                {extractedData.detail_makanan.map((item, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{item.nama}</h3>
                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{item.porsi}</span>
                                                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{item.karbo_gram}g Carbs</span>
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{item.kalori} kCal</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 mb-1">GL STATUS</p>
                                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                                                    item.kategori_bg.includes("TINGGI") ? "bg-red-100 text-red-600" : 
                                                    item.kategori_bg.includes("SEDANG") ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-600"
                                                }`}>
                                                    {item.kategori_bg}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* WARNING UNTUK ITEM TAK DIKENALI */}
                                {extractedData.tidak_ditemukan.length > 0 && (
                                    <div className="mt-2 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700">
                                        <AlertCircle size={20}/>
                                        <p className="text-sm font-medium">Beberapa item tidak dikenali database: <span className="font-bold">{extractedData.tidak_ditemukan.join(', ')}</span></p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTIVITY LOG (MAP) */}
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Dumbbell size={18} /></div>
                                Activity Log
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {extractedData.detail_aktivitas.map((act, idx) => (
                                    <div key={idx} className="bg-[#5A54FF] rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
                                        <h4 className="font-bold text-lg mb-1">{act.nama}</h4>
                                        <div className="flex justify-between items-end mt-4">
                                            <div>
                                                <p className="text-[10px] opacity-70 font-bold uppercase">Duration</p>
                                                <p className="text-xl font-black">{act.durasi_menit} <span className="text-sm font-normal">min</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] opacity-70 font-bold uppercase">Burned</p>
                                                <p className="text-xl font-black">{act.kalori_terbakar} <span className="text-sm font-normal">kCal</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: METRICS */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* GLYCEMIC LOAD SCORE (Main Metric for Diabetes) */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-blue-600 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-600"><Droplet size={120}/></div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Daily Glycemic Load</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900">{extractedData.ringkasan.total_beban_glikemik}</span>
                                <span className="text-slate-400 font-bold">Points</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Batas aman harian: &lt; 100 GL</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intake</p>
                                    <div className="font-bold text-lg text-slate-800">{extractedData.ringkasan.kalori_masuk} <span className="text-[10px] text-slate-400">kcal</span></div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Utensils size={14}/></div>
                            </div>
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Burned</p>
                                    <div className="font-bold text-lg text-slate-800">{extractedData.ringkasan.kalori_keluar} <span className="text-[10px] text-slate-400">kcal</span></div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Flame size={14}/></div>
                            </div>
                        </div>

                        {/* AI INSIGHT CARD */}
                        <div className={`rounded-[2rem] p-6 text-white relative shadow-xl ${
                            extractedData.insight_medis.status.includes("AMAN") ? "bg-gradient-to-br from-emerald-600 to-teal-800" : "bg-gradient-to-br from-slate-800 to-slate-900"
                        }`}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full border border-white/10">
                                    {extractedData.insight_medis.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold leading-tight">{extractedData.insight_medis.pesan}</h3>
                        </div>

                        <button 
                            onClick={async () => {
                                try {
                                    // Ambil data user yang sedang login
                                    const userDataString = localStorage.getItem('user');
                                    const user = userDataString ? JSON.parse(userDataString) : null;

                                    if (!user) {
                                        alert("Sesi login tidak valid!");
                                        return;
                                    }

                                    const token = localStorage.getItem('token');
                                    await axios.post('https://glikosense-backend.vercel.app/api/simpan-jurnal', {
                                        userId: user.id,
                                        ...extractedData.ringkasan,
                                        status_kesehatan: extractedData.insight_medis.status,
                                        pesan_insight: extractedData.insight_medis.pesan,
                                        detail_makanan: extractedData.detail_makanan,
                                        detail_aktivitas: extractedData.detail_aktivitas
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` } 
                                    });
                                    alert("Jurnal Berhasil Disimpan! 🎉");
                                    setHasData(false);
                                } catch (e) {
                                    alert("Gagal menyimpan ke MySQL.");
                                }
                            }}
                            className="w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer transition-all"
                        >
                            <Check size={20} /> Save Entry to Database
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}