// src/components/layout/Sidebar.tsx
import { Plus, MessageSquare, User, GraduationCap } from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex h-screen">
        {/* Logo Area */}
        <div className="mb-6 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            A
            </div>
            <span className="text-lg font-bold text-slate-700">AlifAI.</span>
        </div>

        {/* New Chat Button */}
        <button className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 shadow-sm cursor-pointer hover:shadow-md">
            <Plus size={18} />
            New Chat
        </button>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto space-y-2">
            <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">History Skripsi</p>
            {['Analisis Diabetes', 'Bab 2 Teori RAG', 'Revisi Dosen Pembimbing'].map((item, i) => (
            <button key={i} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 truncate cursor-pointer transition-colors">
                <MessageSquare size={16} className="text-slate-400" />
                <span className="truncate">{item}</span>
            </button>
            ))}
        </div>

        {/* User Profile (Bottom) */}
        <div className="mt-auto border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3 px-2 rounded-lg hover:bg-slate-50 p-2 cursor-pointer transition">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <GraduationCap size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">Alif (Mahasiswa)</span>
                <span className="text-xs text-slate-400">Teknologi Informasi</span>
            </div>
            </div>
        </div>
        </aside>
    );
}