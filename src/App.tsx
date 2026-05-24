import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDealers from './pages/admin/Dealers';
import AdminCars from './pages/admin/Cars';
import AdminUsers from './pages/admin/Users';
import AdminBookings from './pages/admin/Bookings';

// Dealer Pages
import DealerDashboard from './pages/dealer/Dashboard';
import DealerMyCars from './pages/dealer/MyCars';
import DealerBookings from './pages/dealer/Bookings';
import DealerQuotations from './pages/dealer/Quotations';
import DealerProfile from './pages/dealer/Profile';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import MyBookings from './pages/user/MyBookings';
import MyQuotations from './pages/user/MyQuotations';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<Layout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/dealers" element={<AdminDealers />} />
                <Route path="/admin/cars" element={<AdminCars />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
              </Route>
            </Route>

            {/* Dealer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['dealer']} />}>
              <Route element={<Layout />}>
                <Route path="/dealer/dashboard" element={<DealerDashboard />} />
                <Route path="/dealer/my-cars" element={<DealerMyCars />} />
                <Route path="/dealer/bookings" element={<DealerBookings />} />
                <Route path="/dealer/quotations" element={<DealerQuotations />} />
                <Route path="/dealer/profile" element={<DealerProfile />} />
              </Route>
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route element={<Layout />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/my-bookings" element={<MyBookings />} />
                <Route path="/user/my-quotations" element={<MyQuotations />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
