import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animated particle grid background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const dots: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
        for (let i = 0; i < 55; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 0.4,
            });
        }

        let raf: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const d of dots) {
                d.x += d.vx; d.y += d.vy;
                if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
                if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(99,102,241,0.35)';
                ctx.fill();
            }
            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 130)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#05060f] font-sans text-white overflow-x-hidden">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500;600&display=swap');

                * { font-family: 'Inter', sans-serif; }
                .font-display { font-family: 'Syne', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50%       { opacity: 0.8; transform: scale(1.08); }
                }
                .anim-1 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.1s both; }
                .anim-2 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.25s both; }
                .anim-3 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.4s both; }
                .anim-4 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.55s both; }

                .glow-orb { animation: glow-pulse 4s ease-in-out infinite; }

                .card-hover {
                    transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 24px 48px -12px rgba(99,102,241,0.2);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    transition: all 0.25s ease;
                    box-shadow: 0 0 0 0 rgba(99,102,241,0.5);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px -6px rgba(99,102,241,0.7);
                }

                .badge {
                    background: rgba(99,102,241,0.1);
                    border: 1px solid rgba(99,102,241,0.25);
                    color: #a5b4fc;
                }

                .glass {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    backdrop-filter: blur(12px);
                }

                .stat-border {
                    border: 1px solid rgba(255,255,255,0.06);
                }
            `}</style>

            {/* Particle canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

            {/* Ambient glow orbs */}
            <div className="fixed top-[-20vh] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] glow-orb pointer-events-none z-0" />
            <div className="fixed bottom-[-10vh] right-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] glow-orb pointer-events-none z-0" style={{ animationDelay: '2s' }} />

            {/* ─── NAVBAR ─── */}
            <nav className="fixed top-0 w-full z-50 px-6 py-5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-display font-800 text-sm shadow-lg shadow-indigo-500/30">G</div>
                        <span className="font-display font-bold text-lg tracking-tight text-white">GlukoSense</span>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/40">
                        <a href="#features" className="hover:text-white/80 transition">Features</a>
                        <a href="#about" className="hover:text-white/80 transition">About</a>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2 rounded-full text-[13px] font-semibold text-white/60 hover:text-white transition"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-primary px-5 py-2.5 rounded-full text-[13px] font-bold text-white"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">

                {/* Badge */}
                <div className="badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-8 anim-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    AI-Powered Diabetes Companion
                </div>

                {/* Headline */}
                <h1 className="font-display font-800 text-5xl sm:text-7xl md:text-[88px] leading-[0.92] tracking-tighter text-white mb-6 max-w-4xl anim-2">
                    Monitor Your
                    <br />
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #e879f9)' }}>
                        Glucose,
                    </span>
                    <br />
                    Effortlessly.
                </h1>

                {/* Sub */}
                <p className="text-white/40 text-lg md:text-xl font-light max-w-xl leading-relaxed mb-10 anim-3">
                    Ceritakan harimu, biarkan AI kami menghitung beban glikemik, kalori, dan aktivitasmu secara otomatis.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 anim-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="btn-primary px-8 py-4 rounded-2xl text-base font-bold text-white"
                    >
                        Mulai Gratis
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="glass px-8 py-4 rounded-2xl text-base font-semibold text-white/70 hover:text-white transition"
                    >
                        Sudah punya akun?
                    </button>
                </div>

                {/* Floating stats */}
                <div className="mt-20 grid grid-cols-3 gap-4 max-w-lg w-full anim-4">
                    {[
                        { val: '10K+', label: 'Jenis Makanan' },
                        { val: 'Real-time', label: 'AI Analysis' },
                        { val: '100%', label: 'Data Privasi' },
                    ].map((s, i) => (
                        <div key={i} className="stat-border rounded-2xl py-4 px-3 text-center glass">
                            <p className="font-display font-bold text-xl text-white">{s.val}</p>
                            <p className="text-[11px] text-white/30 font-medium mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="relative z-10 py-24 px-6">
                <div className="max-w-5xl mx-auto">

                    <div className="text-center mb-14">
                        <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-3">Kenapa GlukoSense?</p>
                        <h2 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight">Dirancang untuk hidupmu.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                icon: <Brain size={22} className="text-indigo-400" />,
                                title: 'AI Journaling',
                                desc: 'Cukup ceritakan apa yang kamu makan. AI kami mengenali ribuan jenis makanan dan langsung menghitung nutrisinya.',
                                accent: 'rgba(99,102,241,0.08)',
                                border: 'rgba(99,102,241,0.15)',
                            },
                            {
                                icon: <Activity size={22} className="text-violet-400" />,
                                title: 'Glycemic Tracking',
                                desc: 'Pantau beban glikemik harianmu secara real-time. Tahu kapan tubuhmu dalam kondisi aman atau waspada.',
                                accent: 'rgba(139,92,246,0.08)',
                                border: 'rgba(139,92,246,0.15)',
                            },
                            {
                                icon: <ShieldCheck size={22} className="text-pink-400" />,
                                title: 'Health Insights',
                                desc: 'Dapatkan rekomendasi personal berbasis data aktivitas dan pola makan kamu selama ini.',
                                accent: 'rgba(236,72,153,0.08)',
                                border: 'rgba(236,72,153,0.15)',
                            },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="card-hover rounded-3xl p-7 flex flex-col gap-5"
                                style={{ background: f.accent, border: `1px solid ${f.border}` }}
                            >
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: f.border }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed font-light">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA BANNER ─── */}
            <section id="about" className="relative z-10 py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="glass rounded-[2.5rem] p-12 relative overflow-hidden">
                        <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }} />
                        <div className="relative z-10">
                            <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight mb-4">
                                Mulai perjalanan<br/>kesehatanmu hari ini.
                            </h2>
                            <p className="text-white/35 font-light mb-8 max-w-md mx-auto">
                                Daftar gratis dan mulai memahami tubuhmu lebih baik bersama GlukoSense.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-primary px-10 py-4 rounded-2xl text-base font-bold text-white"
                            >
                                Buat Akun Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── DISCLAIMER BANNER ─── */}
            <section className="relative z-10 pb-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="text-amber-400 font-semibold text-sm mb-1 uppercase tracking-wider">Perhatian</h4>
                            <p className="text-white/50 text-[13px] leading-relaxed">
                                Aplikasi ini ditujukan murni untuk <strong>tindakan preventif (pencegahan) </strong> bagi individu berisiko, dan <strong>bukan sebagai pengganti diagnosis, perawatan medis, atau terapi pasien diabetes.</strong> Harap selalu berkonsultasi dengan dokter untuk keputusan medis Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="relative z-10 py-10 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-indigo-500 flex items-center justify-center font-bold text-xs">G</div>
                        <span className="font-display font-bold text-sm text-white/50">GlukoSense</span>
                    </div>
                    <p className="text-white/20 text-[11px] font-medium uppercase tracking-widest">
                        © 2026 GlukoSense. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-[11px] font-medium text-white/25 uppercase tracking-widest">
                        <a href="#" className="hover:text-white/50 transition">Privacy</a>
                        <a href="#" className="hover:text-white/50 transition">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}