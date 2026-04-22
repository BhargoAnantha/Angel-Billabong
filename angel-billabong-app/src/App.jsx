import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import './i18n/config';

// Layout Components
import Navbar from './components/Navbar/Navbar'; 
import Footer from './components/Footer/Footer';

// Page Views
import HomeView from './pages/HomeView';
import BookingView from './pages/BookingView';
import ResultView from './pages/ResultView';
import PaymentView from './pages/PaymentView';
import ProcessPayment from './pages/ProcessPayment';
import TripDetailView from './pages/TripDetailView';
import TripBookingView from './pages/TripBookingView'; 
import GalleryView from './pages/GalleryView';
import ContactView from './pages/ContactView';

// Admin Views (Pastikan path import sesuai dengan folder yang kamu buat)
import AdminLayout from './pages/Admin/AdminLayout';
import DashboardUserList from './pages/Admin/DashboardUserList';

/**
 * Komponen pembungkus untuk layout publik (memiliki Navbar & Footer)
 */
const PublicLayout = () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Outlet /> 
    </main>
    <Footer />
  </>
);

/**
 * ScrollToTop untuk navigasi
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop /> 
      
      <Routes>
        {/* Rute Publik: Menggunakan PublicLayout (Navbar + Footer) */}
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

        {/* Rute Admin: Menggunakan AdminLayout (Tanpa Navbar/Footer Publik) */}
        {/* Kamu bisa akses di: http://localhost:5173/admin-dashboard */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminLayout>
              <DashboardUserList />
            </AdminLayout>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<HomeView />} />
      </Routes>
    </Router>
  );
}

export default App;