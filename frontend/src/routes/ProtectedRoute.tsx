import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
