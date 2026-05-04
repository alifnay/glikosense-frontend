import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavRail from './components/layout/NavRail';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import LogsPage from './pages/LogsPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage'; // Import Landing
import LoginPage from './pages/LoginPage';     // Import Login
import RegisterPage from './pages/RegisterPage'; // Import Register
import NotFoundPage from './pages/NotFoundPage'; // Import 404

// ✅ Cek JWT token untuk auth
const getAuthToken = () =>
	localStorage.getItem('token');

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	if (!getAuthToken()) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
	if (getAuthToken()) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
};

// 💡 Komponen Layout untuk menangani logika Sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();
	
	// Daftar rute di mana Sidebar (NavRail) TIDAK BOLEH muncul
	const noSidebarRoutes = ['/', '/login', '/register', '/404'];
	const showSidebar = !noSidebarRoutes.includes(location.pathname);

	return (
		<div className="flex min-h-screen">
		{/* Hanya tampilkan sidebar jika showSidebar true */}
		{showSidebar && <NavRail />}
		
		{/* Konten Utama */}
		<main className="flex-1 w-full">
			{children}
		</main>
		</div>
	);
};

function App() {
	return (
		<BrowserRouter>
		{/* Bungkus Routes dengan AppLayout */}
		<AppLayout>
			<Routes>
                {/* --- RUTE PUBLIK --- */}
                <Route path="/" element={
                    <PublicRoute><LandingPage /></PublicRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute><LoginPage /></PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute><RegisterPage /></PublicRoute>
                } />

                {/* --- RUTE TERPROTEKSI --- */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Home /></ProtectedRoute>
                } />
                <Route path="/chat" element={
                    <ProtectedRoute><ChatPage /></ProtectedRoute>
                } />
                <Route path="/logs" element={
                    <ProtectedRoute><LogsPage /></ProtectedRoute>
                } />
                {/* ✅ FIX: Route /profile yang sebelumnya tidak terdaftar */}
                <Route path="/profile" element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />

                {/* ✅ 404 — semua route yang tidak terdaftar */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
		</AppLayout>
		</BrowserRouter>
	);
}

export default App;