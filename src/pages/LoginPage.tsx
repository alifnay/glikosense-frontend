import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Bot, X } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://glikosense-backend.vercel.app/api/login', { email, password });
            
            // Pastikan response memiliki data user sebelum menyimpan
            if (response.data && response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token); 
            
            navigate('/dashboard', { replace: true });
            } else {
                alert("Login Gagal. Response dari server tidak valid.");
            }
        } catch (error: any) {
            // Tampilkan pesan error spesifik dari server jika ada
            const pesanError = error?.response?.data?.pesan || "Login Gagal. Cek kembali email dan password.";
            alert(pesanError);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FA] flex items-center justify-center p-5 font-sans text-slate-800">

            {/* 💡 INJEKSI CSS ANIMASI UNTUK TRANSISI */}
            <style>
                {`
                    @keyframes slideInLeft {
                        from { opacity: 0; transform: translateX(-50px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    .animate-slide-in-left {
                        animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}
            </style>
            
            {/* --- MAIN LOGIN CARD --- */}
            <div className="w-full max-w-6xl min-h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-slide-in-left">                
                {/* === KIRI: Branding & Experience === */}
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-12 text-white flex flex-col justify-between overflow-hidden group">
                    {/* Decorative Background Blur */}
                    <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-[90px] -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-lg">G</div>
                        <span className="font-extrabold text-xl tracking-tight text-white">GlukoSense</span>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                            <Sparkles size={14} /> AI Pendamping Kesehatan
                        </div>
                        <h1 className="text-4xl md:text-5xl font-[900] leading-[1.1] tracking-tighter mb-6">
                            Pahami bahasa <br/> tubuh Anda.
                        </h1>
                        <p className="text-blue-100 font-medium text-sm md:text-base leading-relaxed max-w-sm">
                            Selamat datang kembali, Alif! Masuk untuk melanjutkan pemantauan kesehatan cerdasmu.
                        </p>
                    </div>

                    {/* Placeholder untuk ilustrasi 3D halus, opsional */}
                    <div className="absolute bottom-[-50px] right-[-50px] text-blue-500 group-hover:scale-105 transition-transform duration-1000">
                         <Bot size={250} className="opacity-10"/>
                    </div>
                </div>

                {/* === KANAN: Login Form === */}
                <div className="relative p-12 flex flex-col justify-center">

                    <button 
                        onClick={() => navigate('/')}
                        title="Kembali ke Beranda"
                        className="absolute top-6 right-6 h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Sign In</h2>
                    <p className="text-slate-400 font-medium text-sm mb-10">Masukkan kredensial Anda untuk mengakses aplikasi GlukoSense.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div className="relative group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                            <div className="absolute left-4 top-[38px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@gmail.com"
                                required
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Password</label>
                            </div>
                            <div className="absolute left-4 top-[38px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            className="w-full mt-4 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 group"
                        >
                            Sign In to App
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-10 font-medium">
                        Don't have an account?{' '} 
                        <button onClick={() => navigate('/register')} className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                            Create Account
                        </button>.
                    </p>
                </div>
            </div>
        </div>
    );
}