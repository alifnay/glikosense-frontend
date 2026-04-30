import { Home, MessageSquare, Activity, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function NavRail() {
  const menus = [
    { id: 1, icon: <Home size={22} />, path: '/dashboard', label: 'Journal' },
    { id: 2, icon: <MessageSquare size={22} />, path: '/chat', label: 'AI Chat' },
    { id: 3, icon: <Activity size={22} />, path: '/logs', label: 'History' },
    { id: 4, icon: <User size={22} />, path: '/profile', label: 'Profile' },
  ];

  return (
    <>
      {/* =========================================
          VERSI DESKTOP (Vertical Floating Pill di Kiri)
          ========================================= */}
      <nav className="hidden md:flex fixed left-6 top-1/2 z-50 -translate-y-1/2 flex-col justify-between h-[85vh] py-6">
        <div className="flex justify-center">
          <div className="">
            
          </div>
        </div>

        {/* Menu Container (Glassmorphism Pill) */}
        <div className="flex flex-col items-center gap-4 rounded-full bg-white/90 backdrop-blur-xl px-3 py-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100/50">
          {menus.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.path}
              className={({ isActive }) => `
                group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 translate-y-[-2px] scale-105' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:scale-105'
                }
              `}
            >
              {menu.icon}
              <span className="absolute left-16 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                {menu.label}
              </span>
            </NavLink>
          ))}
        </div>
        
        {/* Placeholder untuk balance layout */}
        <div className="h-10"></div>
      </nav>

      {/* =========================================
          VERSI MOBILE (Horizontal Floating Dock di Bawah)
          ========================================= */}
      {/* Container ini ditaruh di tengah bawah layar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-fit">
        
        {/* Menu Container (Glassmorphism Pill persis kayak PC) */}
        <div className="flex items-center justify-center gap-3 rounded-full bg-white/90 backdrop-blur-xl px-4 py-3 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100/50">
          {menus.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.path}
              className={({ isActive }) => `
                group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 translate-y-[-4px] scale-110' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'
                }
              `}
            >
              <div className="scale-90">
                 {menu.icon}
              </div>
              
              {/* Tooltip Hover (Muncul di atas tombol kalau dipencet/tahan) */}
              <span className="absolute -top-10 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-all duration-300 translate-y-[10px] group-hover:translate-y-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                {menu.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}