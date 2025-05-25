import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; // Import the new Sidebar
import TopBar from './TopBar';   // Import the new TopBar
import AuthService from '../services/authService';

const MainLayout = () => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    // Load sidebar pinned state from localStorage or default to false (expanded)
    const savedState = localStorage.getItem('sidebarPinned');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    // No changes needed here for loading initial state as it's handled in useState initializer
  }, []);

  const handleToggleSidebarPin = () => {
    setIsSidebarPinned(prevPinned => {
      const newPinnedState = !prevPinned;
      localStorage.setItem('sidebarPinned', JSON.stringify(newPinnedState));
      return newPinnedState;
    });
  };
  
  const mainContentMarginLeftClass = isSidebarPinned ? 'ml-20' : 'ml-64';

  const showLayout = user && !['/login', '/register'].includes(location.pathname);

  if (!showLayout) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Outlet /> {/* Render LoginPage or RegisterPage directly */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <Sidebar
        isPinned={isSidebarPinned}
        onTogglePin={handleToggleSidebarPin}
      />
      <TopBar sidebarIsPinned={isSidebarPinned} />
      <div className={`flex-grow flex flex-col transition-all duration-300 ease-in-out pt-16`} style={{ marginLeft: isSidebarPinned ? '5rem' : '16rem' }}>
        <main className="flex-grow p-6">
          <Outlet /> {/* Child routes will render here */}
        </main>
        {/* Optional: Footer can be added here, ensuring it also respects the sidebar margin */}
        {/* <footer className={`bg-content-bg text-center p-4 border-t border-border-color ${mainContentMarginLeftClass}`}>
          © {new Date().getFullYear()} SIAP Application
        </footer> */}
      </div>
    </div>
  );
};

export default MainLayout;
