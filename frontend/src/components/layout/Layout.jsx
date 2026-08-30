import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationToast from '../common/NotificationToast';
import { getReviewQueue } from '../../services/api';

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cp_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [toast, setToast] = useState(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(5);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('cp_sidebar_collapsed', String(next));
      return next;
    });
  };

  const fetchPendingReviews = async () => {
    try {
      const queue = await getReviewQueue();
      const pending = queue.filter(item => !item.status || item.status === 'PENDING').length;
      setPendingReviewCount(pending);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingReviews();
    const interval = setInterval(fetchPendingReviews, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleShowToast = (newToast) => {
    setToast(newToast);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* Left Sidebar */}
      <Sidebar 
        reviewCount={pendingReviewCount} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-300">
        <Topbar 
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} 
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet context={{ showToast: handleShowToast, refreshReviews: fetchPendingReviews }} />
          </div>
        </main>
      </div>

      {/* Floating Notification Toast */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

