import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#F6F8FA] flex items-center justify-center px-6 font-sans text-slate-800">
            <div className="flex flex-col items-center text-center max-w-md">

                {/* Angka 404 besar */}
                <div className="relative mb-8 select-none">
                    <span className="text-[180px] font-extrabold text-slate-100 leading-none tracking-tighter">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center">
                            <span className="text-3xl font-extrabold text-blue-600">G</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10">
                    Halaman yang kamu cari tidak ada atau mungkin sudah dipindahkan. Cek kembali URL-nya ya!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </button>
                    <button
                        onClick={() => {
                            const user = localStorage.getItem('user');
                            navigate(user ? '/dashboard' : '/');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Home size={16} /> Ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
