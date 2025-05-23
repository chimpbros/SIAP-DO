import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

// Importing SVGs as React components if your setup supports it (e.g., Create React App with SVGR)
// Otherwise, you might use them as <img> tags with public URLs.
// For this example, I'll assume direct public URL usage for simplicity,
// but using them as components is often cleaner.

const Sidebar = ({ isPinned, onTogglePin }) => {
  // isPinned is the prop determining the pinned state, controlled by MainLayout
  // isHovered is for temporary expansion on mouse hover
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
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
  
  // Determine effective collapsed state for rendering text
  const effectivelyCollapsed = isPinned && !isHovered;
  const sidebarWidthClass = isPinned && !isHovered ? 'w-20' : 'w-64';

  return (
    <div
      className={`bg-sidebar-bg text-sidebar-text ${sidebarWidthClass} min-h-screen flex flex-col transition-all duration-300 ease-in-out fixed top-0 left-0 z-40 pt-16`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle button for pinning */}
      <button
        onClick={onTogglePin}
        className="absolute top-4 right-0 mr-4 text-sidebar-text hover:text-white p-1 z-50" // Ensure button is clickable
        title={isPinned ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isPinned ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> {/* Hamburger icon */}
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" /> {/* Icon indicating collapse */}
          </svg>
        )}
      </button>

      <nav className="flex-grow mt-10"> {/* Added more margin top for toggle button */}
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
                  className={`flex items-center py-3 px-6 hover:bg-sidebar-hover-bg transition-colors duration-200 ${
                    isActive ? 'bg-sidebar-active-bg text-sidebar-active-text font-semibold' : ''
                  }`}
                  title={item.name}
                >
                  <img src={process.env.PUBLIC_URL + item.icon} alt="" className="w-6 h-6 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                  {!effectivelyCollapsed && <span className="ml-4 text-sm whitespace-nowrap">{item.name}</span>} {/* Added whitespace-nowrap */}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-3 px-6 hover:bg-sidebar-hover-bg transition-colors duration-200"
          title="Logout"
        >
          <img src={process.env.PUBLIC_URL + '/sign-out-alt.svg'} alt="" className="w-6 h-6 flex-shrink-0" /> {/* Added flex-shrink-0 */}
          {!effectivelyCollapsed && <span className="ml-4 text-sm whitespace-nowrap">Logout</span>} {/* Added whitespace-nowrap */}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;