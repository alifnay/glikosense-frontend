import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Sparkles, ArrowRight, Bot, User, Scale, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [beratBadan, setBeratBadan] = useState(''); // State baru untuk Berat Badan
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Mengirim data form ke API Node.js
            await axios.post('https://glikosense-backend.vercel.app/api/register', {
                nama: name,
                email: email,
                password: password,
                berat_badan: beratBadan
            });

            toast.success("Pendaftaran berhasil! Silakan Login.");
            // Arahkan ke Login setelah sukses register
            navigate('/login'); 
        } catch (error: any) {
            console.error("Gagal mendaftar:", error);
            const pesanError = error.response?.data?.pesan || "Terjadi kesalahan saat pendaftaran.";
            toast.error(pesanError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FA] flex items-center justify-center p-5 font-sans text-slate-800 overflow-hidden">
            
            {/* 💡 INJEKSI CSS ANIMASI UNTUK TRANSISI */}
            <style>
                {`
                    @keyframes slideInRight {
                        from { opacity: 0; transform: translateX(50px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    .animate-slide-in-right {
                        animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}
            </style>

            {/* --- MAIN REGISTER CARD --- */}
            <div className="w-full max-w-6xl min-h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-slide-in-right">
                
                {/* === KIRI: Register Form === */}
                <div className="relative p-10 md:p-12 flex flex-col justify-center order-2 md:order-1">

                    <button 
                        onClick={() => navigate('/')}
                        title="Kembali ke Beranda"
                        className="absolute top-6 left-6 md:top-8 md:left-8 h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 ml-8 tracking-tight">Buat Akun</h2>
                    <p className="text-slate-400 font-medium text-sm mb-6">Bergabunglah dan mulai perjalanan kesehatan Anda.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Name Input */}
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Nama Lengkap</label>
                            <div className="absolute left-4 top-[35px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                required
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                            />
                        </div>

                        {/* Flex Container untuk Email & Berat Badan agar sejajar di layar besar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email Input */}
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Alamat Email</label>
                                <div className="absolute left-4 top-[35px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@gmail.com"
                                    required
                                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                                />
                            </div>

                            {/* Weight Input (BARU) */}
                            <div className="relative group">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Berat Badan (kg)</label>
                                <div className="absolute left-4 top-[35px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Scale size={18} />
                                </div>
                                <input 
                                    type="number" 
                                    value={beratBadan}
                                    onChange={(e) => setBeratBadan(e.target.value)}
                                    placeholder="65"
                                    required
                                    min="30"
                                    max="200"
                                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Password</label>
                            <div className="absolute left-4 top-[35px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                minLength={6}
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-12 pr-12 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[35px] text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-2 px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition group ${
                                isLoading ? 'bg-blue-400 cursor-not-allowed text-white/70' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                            }`}
                        >
                            {isLoading ? 'Memproses...' : 'Register'}
                            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                        Sudah memiliki akun?{' '} 
                        <button onClick={() => navigate('/login')} className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                            Login
                        </button>.
                    </p>

                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 leading-tight">
                            <strong>Perhatian:</strong> Aplikasi ini ditujukan untuk tindakan preventif (pencegahan) bagi individu berisiko, bukan untuk pengganti diagnosis atau terapi pasien diabetes.
                        </p>
                    </div>
                </div>

                {/* === KANAN: Branding & Experience === */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 p-12 text-white flex flex-col justify-between overflow-hidden group order-1 md:order-2">
                    <div className="absolute left-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-[90px] -ml-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center justify-end gap-2">
                        <span className="font-extrabold text-xl tracking-tight text-white">GlukoSense</span>
                        <div className="h-9 w-9 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-lg">G</div>
                    </div>

                    <div className="relative z-10 text-right mt-16 md:mt-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                            <Sparkles size={14} /> Bergabunglah Bersama Kami
                        </div>
                        <h1 className="text-4xl md:text-5xl font-[900] leading-[1.1] tracking-tighter mb-6">
                            Mulai Masa Depan<br/> Anda Di Sini.
                        </h1>
                        <p className="text-blue-100 font-medium text-sm md:text-base leading-relaxed ml-auto max-w-sm">
                            Hanya butuh beberapa detik untuk mendaftar dan membiarkan AI menganalisis pola kesehatan Anda setiap hari.
                        </p>
                    </div>

                    <div className="absolute bottom-[-50px] left-[-50px] text-blue-500 group-hover:scale-105 transition-transform duration-1000">
                        <Bot size={250} className="opacity-10"/>
                    </div>
                </div>

            </div>
        </div>
    );
}