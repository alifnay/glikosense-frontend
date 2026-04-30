import { useState, useEffect } from 'react';
import { User, Mail, Shield, ChevronRight, ChevronLeft, Heart, LogOut, Eye, EyeOff, Save, X, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
    const navigate = useNavigate();
    
    // States Modals
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false); // ✅ Modal Avatar Baru

    // States Edit Data
    const [userData, setUserData] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // States Health Bio
    const [isUpdatingBio, setIsUpdatingBio] = useState(false);
    const [editUmur, setEditUmur] = useState('');
    const [editBerat, setEditBerat] = useState('');
    const [editTinggi, setEditTinggi] = useState('');
    const [editGoldar, setEditGoldar] = useState('');

    // ✅ State Avatar Picker
    const [activeAvatar, setActiveAvatar] = useState('User');
    const [seedIndex, setSeedIndex] = useState(0);
    const avatarSeeds = [
        "Alif", "Felix", "Aneka", "Milo", "Oliver", "Bella", "Cleo", "Leo", "Zoe", "Sam", 
        "Mia", "Luna", "Aria", "Chloe", "Lily", "Nora", "Emma", "Maya", "Lia", "Sophia", 
        "Ava", "Isabella", "Mika", "Rani", "Aisha", "Tari", "Sari", "Dina", "Rina"
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData(user);
            
            // Cek apakah user punya avatar custom yang tersimpan
            const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
            setActiveAvatar(savedAvatar || user.nama);
        }
    }, []);

    // ==========================================
    // FUNGSI AVATAR PICKER
    // ==========================================
    const handleNextAvatar = () => {
        setSeedIndex((prev) => (prev + 1) % avatarSeeds.length);
    };

    const handlePrevAvatar = () => {
        setSeedIndex((prev) => (prev === 0 ? avatarSeeds.length - 1 : prev - 1));
    };

    const saveAvatar = () => {
        const chosenSeed = avatarSeeds[seedIndex];
        localStorage.setItem(`avatar_${userData.id}`, chosenSeed); // Simpan pilihan di browser
        setActiveAvatar(chosenSeed); // Terapkan ke tampilan
        setShowAvatarModal(false);
        window.dispatchEvent(new Event('avatarUpdated'));
    };

    

    // ==========================================
    // FUNGSI UMUM
    // ==========================================
    const handleLogout = () => {
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        navigate('/', { replace: true }); 
    };

    const handleOpenEditModal = async () => {
        setShowEditModal(true);
        setErrorMsg('');
        setEditName(userData?.nama || '');
        try {
            // ✅ Mengambil password asli dari database
            const response = await axios.get(`https://glikosense-backend.vercel.app/api/user/${userData.id}`);
            setEditPassword(response.data.password || '');
        } catch (error) {
            console.error('Gagal mengambil data user:', error);
        }
    };

    const handleOpenHealthModal = () => {
        setShowHealthModal(true);
        setEditUmur(userData?.umur?.toString() || '');
        setEditBerat(userData?.berat_badan?.toString() || '');
        setEditTinggi(userData?.tinggi_badan?.toString() || '');
        setEditGoldar(userData?.golongan_darah || '');
    };

    const handleSavePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editPassword.trim()) {
            setErrorMsg("Nama dan kata sandi wajib diisi!");
            return;
        }

        setIsUpdating(true);
        try {
            await axios.put(`https://glikosense-backend.vercel.app/api/update-personal-info/${userData.id}`, {
                nama: editName,
                password: editPassword
            });

            const updatedUser = { ...userData, nama: editName, password: editPassword };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
            setShowEditModal(false);
        } catch (error) {
            setErrorMsg("Gagal update profil di server.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveHealthBio = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingBio(true);
        try {
            const response = await axios.put(`https://glikosense-backend.vercel.app/api/update-health-bio/${userData.id}`, {
                umur: editUmur,
                berat_badan: editBerat,
                tinggi_badan: editTinggi,
                golongan_darah: editGoldar
            });

            // ✅ Menimpa data baru dari server ke memori browser
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUserData(response.data.user);
            setShowHealthModal(false);
        } catch (error) {
            console.error("Gagal update health bio:", error);
            alert("Gagal memperbarui Health Bio.");
        } finally {
            setIsUpdatingBio(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FA] px-4 py-5 sm:px-6 md:pl-32 md:pr-10 md:py-8 pb-24 md:pb-8 font-sans text-slate-800">
            
            <header className="flex items-center justify-between gap-3 mb-6 md:mb-10">
                <div className="min-w-0 pr-2">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight truncate leading-none md:leading-tight">
                        My Profile
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 truncate">Manage your personal information and health settings</p>
                </div>
                <div className="flex items-center gap-3 md:gap-5 shrink-0">
                    {/* ✅ Menu Kanan Profile */}
                    <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1 max-w-[100px] md:max-w-none">{userData?.nama || 'User'}</p>
                            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[100px] md:max-w-none">{userData?.email || ''}</p>
                        </div>
                        <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeAvatar}`} 
                            alt="Profile Avatar" 
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 object-cover shadow-sm shrink-0"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6 md:gap-8">
                
                {/* === KIRI: Kartu Profil Utama === */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                        
                        <div className="relative mt-12 mb-6 group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                            {/* ✅ Avatar tidak lagi berubah otomatis sesuai nama, tapi sesuai state activeAvatar */}
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeAvatar}`} 
                                alt="Profile Avatar" 
                                className="h-32 w-32 rounded-[2rem] bg-white p-1 border-4 border-white shadow-xl object-cover transition-transform group-hover:scale-105"
                            />
                            {/* Tombol Edit Avatar */}
                            <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 hover:scale-110 transition-transform border border-slate-100">
                                <Edit3 size={18} />
                            </button>
                        </div>

                        <h2 className="text-2xl font-extrabold text-slate-900">{userData?.nama || 'Loading...'}</h2>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">User</p>
                        
                        <div className="w-full mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <Mail size={18} className="text-slate-400" />
                                <div className="w-full overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                    <p className="text-sm font-bold text-slate-700 truncate w-full">{userData?.email || 'Loading...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === KANAN: Settings & Health Bio === */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 flex-1">
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h3>
                        
                        <div className="mb-8">
                            <div 
                                onClick={handleOpenEditModal}
                                className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Personal Information</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Update your basic details & password</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-100 my-8"></div>

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Heart size={22} className="text-red-500" /> Health Bio
                            </h3>
                            <button onClick={handleOpenHealthModal} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">Update Bio</button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Age", value: userData?.umur ? `${userData.umur} Yrs` : '-' },
                                { label: "Weight", value: userData?.berat_badan ? `${userData.berat_badan} Kg` : '-' },
                                { label: "Height", value: userData?.tinggi_badan ? `${userData.tinggi_badan} Cm` : '-' },
                                { label: "Blood Type", value: userData?.golongan_darah || '-' }
                            ].map((bio, idx) => (
                                <div key={idx} className="text-center p-4 rounded-3xl bg-blue-50/50 border border-blue-50">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{bio.label}</p>
                                    <p className="text-lg font-extrabold text-blue-900">{bio.value}</p>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowLogoutModal(true)}
                            className="mt-8 w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={20} /> Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 🌟 MODAL AVATAR PICKER (BARU) 🌟 --- */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setShowAvatarModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        
                        <h3 className="text-xl font-extrabold text-slate-900 mb-8">Pilih Karaktermu</h3>
                        
                        {/* Slider Avatar */}
                        <div className="flex items-center justify-between w-full mb-8">
                            <button onClick={handlePrevAvatar} className="h-10 w-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full flex items-center justify-center transition">
                                <ChevronLeft size={24} />
                            </button>
                            
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeeds[seedIndex]}`} 
                                alt="Avatar Preview" 
                                className="h-32 w-32 rounded-[2rem] bg-white border border-slate-100 shadow-xl object-cover scale-110"
                            />

                            <button onClick={handleNextAvatar} className="h-10 w-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full flex items-center justify-center transition">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <button 
                            onClick={saveAvatar}
                            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                            Gunakan Avatar Ini
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT PERSONAL INFORMATION --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-extrabold text-slate-900">Edit Profile</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleSavePersonalInfo} className="space-y-5">
                            {/* Input Nama */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => { setEditName(e.target.value); setErrorMsg(''); }}
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Input Email (Read Only) */}
                            <div className="space-y-1.5 opacity-60">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="email" 
                                        value={userData.email}
                                        readOnly
                                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            {/* Input Password */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-3 text-slate-400" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={editPassword}
                                        onChange={(e) => { setEditPassword(e.target.value); setErrorMsg(''); }}
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-12 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-slate-400 hover:text-blue-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUpdating || !editName.trim() || !editPassword.trim()}
                                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL UPDATE HEALTH BIO --- */}
            {showHealthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-extrabold text-slate-900">Update Health Bio</h3>
                            <button onClick={() => setShowHealthModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveHealthBio} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age (Years)</label>
                                    <input 
                                        type="number" 
                                        value={editUmur}
                                        onChange={(e) => setEditUmur(e.target.value)}
                                        placeholder="e.g. 25"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight (kg)</label>
                                    <input 
                                        type="number" 
                                        value={editBerat}
                                        onChange={(e) => setEditBerat(e.target.value)}
                                        placeholder="e.g. 65"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height (cm)</label>
                                    <input 
                                        type="number" 
                                        value={editTinggi}
                                        onChange={(e) => setEditTinggi(e.target.value)}
                                        placeholder="e.g. 170"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Type</label>
                                    <select 
                                        value={editGoldar}
                                        onChange={(e) => setEditGoldar(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    >
                                        <option value="">Pilih</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUpdatingBio}
                                className="w-full mt-4 py-4 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:bg-blue-400"
                            >
                                {isUpdatingBio ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Simpan Bio
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- LOGOUT MODAL --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <LogOut size={36} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Log Out</h3>
                        <p className="text-center text-slate-500 font-medium mb-8">Are you sure you want to log out?</p>
                        
                        <div className="flex w-full gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 px-4 rounded-full font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 py-4 px-4 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">Yes, Log Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}