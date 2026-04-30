import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// Pelindung untuk halaman yang WAJIB Login (Dashboard, Chat, Logs)
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
        // Jika tidak ada data user di localStorage, tendang ke Login
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Pelindung untuk halaman yang TIDAK BOLEH diakses jika sudah Login (Landing, Login, Register)
export const PublicRoute = ({ children }: { children: ReactNode }) => {
    const user = localStorage.getItem('user');
    
    if (user) {
        // Jika sudah login tapi coba buka Landing/Login, arahkan ke Dashboard
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};