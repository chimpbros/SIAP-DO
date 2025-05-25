import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

// Importing SVGs as React components if your setup supports it (e.g., Create React App with SVGR)
// Otherwise, you might use them as <img> tags with public URLs.
// For this example, I'll assume direct public URL usage for simplicity,
// but using them as components is often cleaner.

const Sidebar = ({ isPinned, onTogglePin, isMobileMenuOpen, toggleMobileMenu }) => { // Added new props
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false); // Moved hook to top

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsClient(true); // Moved setIsClient to an existing effect or a new one at the top
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Removed internal toggleCollapse, now uses onTogglePin from props
  // const toggleCollapse = () => {
  //   setIsCollapsed(!isCollapsed);
  // };

  const navItems = [
    { name: 'Akun', path: '/profile', icon: '/user.svg', adminOnly: false },
    { name: 'Dashboard', path: '/dashboard', icon: '/apps.svg', adminOnly: false },
    { name: 'Daftar Arsip', path: '/archive', icon: '/list.svg', adminOnly: false },
    { name: 'Tambah Surat', path: '/add', icon: '/plus.svg', adminOnly: false },
    { name: 'Admin', path: '/admin', icon: '/users.svg', adminOnly: true },
  ];

  const showSidebar = !['/login', '/register'].includes(location.pathname);

  if (!showSidebar || !user) {
    return null; // Don't render sidebar on login/register pages or if no user
  }
  
  // Determine effective collapsed state for rendering text (for desktop)
  const desktopEffectivelyCollapsed = isPinned && !isHovered;
  
  // Determine sidebar classes based on screen size and state
  const baseClasses = "bg-sidebar-bg text-sidebar-text min-h-screen flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 pt-16 shadow-xl"; // Added shadow-xl and z-50
  
  // Mobile specific classes: transform for slide-in/out, fixed width when open
  const mobileTransform = isMobileMenuOpen ? "translate-x-0" : "-translate-x-full";
  const mobileVisibilityClasses = `transform ${mobileTransform} w-3/4 sm:w-64`; // Use w-3/4 on very small, sm:w-64 otherwise

  // Desktop specific classes: override transform, set width based on pin/hover state
  const desktopWidthClass = desktopEffectivelyCollapsed ? 'md:w-20' : 'md:w-64';
  const desktopVisibilityClasses = `md:translate-x-0 ${desktopWidthClass}`;

  // Text visibility: always show on mobile open, or if not collapsed on desktop
  // A bit more robust check for window object for SSR or testing environments
  // const [isClient, setIsClient] = useState(false); // Moved to top
  // useEffect(() => { // Moved to top
  //   setIsClient(true);
  // }, []);

  const showText = isClient && ((window.innerWidth < 768 && isMobileMenuOpen) || (window.innerWidth >= 768 && !desktopEffectivelyCollapsed));

  // Overlay for mobile menu
  const MobileOverlay = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={toggleMobileMenu} // Close menu when overlay is clicked
    />
  );

  return (
    <>
      <MobileOverlay />
      <div
        className={`${baseClasses} ${mobileVisibilityClasses} ${desktopVisibilityClasses}`}
        onMouseEnter={() => { if (isClient && window.innerWidth >= 768) setIsHovered(true); }} // Hover only on desktop
        onMouseLeave={() => { if (isClient && window.innerWidth >= 768) setIsHovered(false); }} // Hover only on desktop
      >
        {/* Mobile Close Button (Top Right of Sidebar) */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden absolute top-4 right-4 text-sidebar-text hover:text-white p-1 z-[51]" // z-index higher than sidebar itself
          title="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Desktop Toggle Pin button (Top Right of Sidebar) */}
        <button
          onClick={onTogglePin}
          className="absolute top-4 right-4 text-sidebar-text hover:text-white p-1 z-[51] hidden md:block" // Hidden on mobile, z-index higher
          title={isPinned ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isPinned ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> {/* Hamburger icon for "expand" state */}
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" /> {/* Icon indicating collapse */}
            </svg>
          )}
        </button>

        <nav className="flex-grow mt-10"> {/* Adjusted mt for buttons */}
          <ul>
            {navItems.map((item) => {
              if (item.adminOnly && (!user || !user.is_admin)) {
                return null;
              }
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <li key={item.name} className="mb-1">
                  <Link
                    to={item.path}
                    className={`flex items-center py-3 px-6 hover:bg-sidebar-hover-bg hover:text-text-primary transition-colors duration-200 ${
                      isActive ? 'bg-sidebar-active-bg text-sidebar-active-text font-semibold' : ''
                    }`}
                    title={item.name}
                    onClick={() => { if (isClient && window.innerWidth < 768 && isMobileMenuOpen) toggleMobileMenu(); }} // Close mobile menu on item click
                  >
                    <img src={process.env.PUBLIC_URL + item.icon} alt="" className="w-6 h-6 flex-shrink-0" />
                    {showText && <span className="ml-4 text-sm whitespace-nowrap">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 mt-auto">
          <button
            onClick={() => {
              handleLogout();
              if (isClient && window.innerWidth < 768 && isMobileMenuOpen) toggleMobileMenu(); // Close mobile menu on logout
            }}
            className="flex items-center w-full py-3 px-2 hover:bg-sidebar-hover-bg transition-colors duration-200" // Adjusted padding for consistency
            title="Logout"
          >
            <img src={process.env.PUBLIC_URL + '/sign-out-alt.svg'} alt="" className="w-6 h-6 flex-shrink-0" />
            {showText && <span className="ml-4 text-sm whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;