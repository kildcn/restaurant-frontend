import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // If not logged in, redirect to login page with the return url
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to homepage if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and has required role, render the protected component
  return children;
};

export default ProtectedRoute;
