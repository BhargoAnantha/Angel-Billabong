// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './i18n/config';

// Import AuthService
import { isAuthenticated, clearAdminSession } from './services/AuthService';

// Layout Components
import Navbar from './components/Navbar/Navbar'; 
import Footer from './components/Footer/Footer';

// Page Views - Public
import HomeView from './pages/HomeView';
import BookingView from './pages/BookingView';
import ResultView from './pages/ResultView';
import GalleryView from './pages/GalleryView';
import ContactView from './pages/ContactView';
import TripDetailView from './pages/TripDetailView';
import TripBookingView from './pages/TripBookingView';
import PaymentView from './pages/PaymentView';
import ProcessPayment from './pages/ProcessPayment';

// Page Views - Admin
import LoginView from './pages/Admin/LoginView'; 
import AdminLayout from './pages/Admin/AdminLayout';
import Transport from './pages/Admin/Transport'; 
import Trips from './pages/Admin/Trips';         
import TransportBook from './pages/admin/TransportBook';
// Update: Import komponen baru yang kamu buat
import TripsBook from './pages/admin/TripsBook'; 

// Komponen Proteksi Rute Admin
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout untuk Halaman Publik (User)
const PublicLayout = () => {
  const location = useLocation();
  
  useEffect(() => {
    const isInsideAdminArea = location.pathname.startsWith('/admin') || location.pathname === '/login';
    if (!isInsideAdminArea) {
      clearAdminSession();
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop /> 
      <Routes>
        {/* GROUP 1: RUTE PUBLIK */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeView />} />
          <Route path="/booking" element={<BookingView />} />
          <Route path="/results" element={<ResultView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="/trip-detail/:id" element={<TripDetailView />} />
          <Route path="/book-trip/:id" element={<TripBookingView />} />
          <Route path="/payment" element={<PaymentView />} />
          <Route path="/process-payment" element={<ProcessPayment />} />
        </Route>

        {/* GROUP 2: LOGIN */}
        <Route path="/login" element={<LoginView />} />

        {/* GROUP 3: RUTE ADMIN (DIPROTEKSI) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="transport" replace />} />
          <Route path="transport" element={<Transport />} />
          <Route path="trips" element={<Trips />} />
          <Route path="transport-book" element={<TransportBook/>} />
          {/* Update: Menghubungkan path ke komponen TripsBook asli */}
          <Route path="trips-book" element={<TripsBook />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;