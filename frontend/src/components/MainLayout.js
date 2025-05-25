import React, { useState, useEffect } from 'react'; // Removed useRef
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; // Import the new Sidebar
import TopBar from './TopBar';   // Import the new TopBar
import AuthService from '../services/authService';

const MainLayout = () => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    const savedState = localStorage.getItem('sidebarPinned');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  // const mainContentRef = useRef(null); // Logging removed

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Moved this definition up to be before the useEffect that uses it
  const mainContentMarginLeftClass = isSidebarPinned ? 'md:ml-20' : 'md:ml-64'; // Applied md prefix

  // useEffect(() => { // Logging removed
  //   const logWidth = () => {
  //     if (mainContentRef.current) {
  //       console.log(`MainLayout content width: ${mainContentRef.current.offsetWidth}px, marginClass: ${mainContentMarginLeftClass}`);
  //     }
  //   };
  //   logWidth();
  //   window.addEventListener('resize', logWidth);
  //   return () => {
  //     window.removeEventListener('resize', logWidth);
  //   };
  // }, [location, mainContentMarginLeftClass]);
  
  // const mainContentMarginLeftClass = isSidebarPinned ? 'md:ml-20' : 'md:ml-64'; // MOVED UP

  const handleToggleSidebarPin = () => {
    setIsSidebarPinned(prevPinned => {
      const newPinnedState = !prevPinned;
      localStorage.setItem('sidebarPinned', JSON.stringify(newPinnedState));
      return newPinnedState;
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Adjusted for mobile: main content margin is 0 on small screens
  // const mainContentMarginLeftClass = isSidebarPinned ? 'md:ml-20' : 'md:ml-64'; // MOVED UP

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
        isMobileMenuOpen={isMobileMenuOpen} // Pass mobile menu state
        toggleMobileMenu={toggleMobileMenu} // Pass toggle function
      />
      <TopBar
        sidebarIsPinned={isSidebarPinned}
        toggleMobileMenu={toggleMobileMenu} // Pass toggle function for hamburger
      />
      {/* Apply Tailwind classes for responsive margin */}
      <div /* ref={mainContentRef} // Logging removed */ className={`flex-grow flex flex-col transition-all duration-300 ease-in-out pt-16 ml-0 ${mainContentMarginLeftClass} overflow-x-hidden`}> {/* Added overflow-x-hidden */}
        <main className="flex-grow p-4 sm:p-6"> {/* Reduced padding for smaller screens */}
          <Outlet /> {/* Child routes will render here */}
        </main>
        {/* Optional: Footer can be added here, ensuring it also respects the sidebar margin */}
        {/* <footer className={`bg-content-bg text-center p-4 border-t border-border-color ml-0 ${mainContentMarginLeftClass}`}>
          © {new Date().getFullYear()} SIAP Application
        </footer> */}
      </div>
    </div>
  );
};

export default MainLayout;
