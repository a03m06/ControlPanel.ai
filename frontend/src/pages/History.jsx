import React from 'react';
import { Navigate } from 'react-router-dom';

export default function History() {
  return <Navigate to="/dashboard" replace />;
}
