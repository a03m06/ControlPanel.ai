import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Conversation from './pages/Conversation';
import EventDetail from './pages/EventDetail';
import ReviewQueue from './pages/ReviewQueue';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Default Route -> Conversation */}
            <Route index element={<Navigate to="/conversation" replace />} />
            
            {/* Main Views */}
            <Route path="conversation" element={<Conversation />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="evaluate" element={<Navigate to="/conversation" replace />} />
            <Route path="review" element={<ReviewQueue />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="events/:id" element={<EventDetail />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/conversation" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
