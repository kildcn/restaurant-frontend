import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BookingForm from './components/booking/BookingForm';
import BookingConfirmation from './components/booking/BookingConfirmation';
import BookingLookup from './components/booking/BookingLookup';
import UserBookings from './components/booking/UserBookings';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBookings from './components/admin/AdminBookings';
import AdminTables from './components/admin/AdminTables';
import AdminRestaurant from './components/admin/AdminRestaurant';
import AdminUsers from './components/admin/AdminUsers';
import AdminLayout from './components/admin/AdminLayout';
import FloorPlan from './components/admin/FloorPlan';

// Styles
import './styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/bookings" element={<BookingForm />} />
              <Route path="/bookings/confirmation" element={<BookingConfirmation />} />
              <Route path="/bookings/lookup" element={<BookingLookup />} />

              {/* Protected user routes */}
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <UserBookings />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin', 'manager', 'staff']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="tables" element={<AdminTables />} />
                <Route path="restaurant" element={<AdminRestaurant />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="floor-plan" element={<FloorPlan />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
