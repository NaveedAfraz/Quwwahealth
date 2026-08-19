import React, { useState, useEffect } from 'react';
// Corrected import from 'react-router-dom'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCog, FaSearch } from 'react-icons/fa';
// Assuming this is your slice
import Logo from '../assets/images/header.png'; // Assuming this is your logo path
import { Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout , setUser , setIsAuthenticated} = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  // Provide a fallback for state.auth if it's undefined
  // const { isAuthenticated, user } = useSelector((state) => state.auth) || { isAuthenticated: false, user: null };
  const location = useLocation();
  
  console.log('auth state', isAuthenticated, user);
  // Function to handle navigation clicks in the mobile menu
  const handleMobileNavClick = () => {
    window.scrollTo(0, 0); // Scroll to the top of the page
    setIsMenuOpen(false); // Close the menu
  };

  // Toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle the desktop user dropdown
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isUserMenuOpen && !event.target.closest('#user-menu-button') && !event.target.closest('#user-menu-dropdown')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isUserMenuOpen]);


  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Logout handler
  const handleLogout = () => {
    logout()
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
    setIsUserMenuOpen(false);
    handleMobileNavClick(); // Close mobile menu and scroll to top
  };

  const authPage = location.pathname === '/auth/login' || location.pathname === '/auth/register';
  const homePage = location.pathname === '/';

  // Navigation links array for cleaner mapping 
  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/about', text: 'About Us' },
    { to: '/programs', text: 'Our Programs' },
    { to: '/blogs', text: 'Blogs' },
    { to: '/contact', text: 'Contact Us' },
  ];

  // Classes for desktop nav links
  const navLinkClasses = ({ isActive }) =>
    `text-sm sm:text-base md:text-[1.05rem] lg:text-lg font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'font-semibold text-black' : 'text-[#A6A6A6] hover:text-black'}`;

  // Classes for mobile nav links
  const mobileNavLinkClasses = ({ isActive }) =>
    `block w-full text-left p-3 rounded-md font-medium transition-colors text-lg ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`;

  // Render user avatar or a default icon
  const renderUserAvatar = () => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />;
    }
    return <FaUserCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />;
  };

  return (
    <>
      <header className={`${!authPage && !homePage ? 'bg-gradient-to-r from-[#DFF2E0] to-[#F7F6ED]' : 'bg-white'} sticky top-0 z-30`}>
        {authPage ? (
          // Simplified header for auth pages: Centered Logo Only
          <div className="mx-auto flex items-center justify-center p-2 sm:p-4 md:py-4">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={Logo} alt="QuwwaHealth Logo" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x50?text=Logo'; }} />
            </Link>
          </div>
        ) : (
          // Full header for all other pages
          <div className="mx-auto flex items-center justify-between p-2 sm:p-4 md:py-4">
            {/* Logo */}
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={Logo} alt="QuwwaHealth Logo" className="h-10 ml-2 sm:ml-5 md:ml-10 lg:ml-14 sm:h-12 md:h-14 lg:h-16 w-auto" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x50?text=Logo'; }} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex float-right space-x-8">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>{link.text}</NavLink>
              ))}
            </div>

            {/* Desktop Action Buttons & User Menu */}
            <div className="hidden xl:flex items-center space-x-6">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    id="user-menu-button"
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 cursor-pointer mr-10"
                  >
                    {renderUserAvatar()}
                  </button>

                  {isUserMenuOpen && (
                    <div id="user-menu-dropdown" className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-3 border-b">
                        <div className="font-bold text-gray-800 truncate">{user?.name || user?.school_name || user?.displayName || user?.email}</div>
                        <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin/blogs" onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                          <FaCog /> <span>Admin Panel</span>
                        </Link>
                      )}
                      {/* <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <FaUserCircle /> <span>Profile</span>
                      </Link> */}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <FaSignOutAlt /> <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="contained" sx={{ p: 1.7, mx: 1, background: '#54BD95', color: 'white' }}> <FaSearch /></Button>
                  <Link to="/auth/login" className="text-base font-medium pl-3  text-gray-600 hover:text-black">Login</Link>
                  <Link to="/auth/register" className="text-base font-medium bg-[#54BD95] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden lg:mr-15 sm:mr-5">
              <button onClick={toggleMenu} className="text-black focus:outline-none p-2">
                <FaBars className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu (Slide-in Panel) - This will not appear on auth pages because the button to open it is hidden */}
      {!authPage && (
        <div className={`xl:hidden fixed inset-0 z-50 flex justify-end ${isMenuOpen ? '' : 'pointer-events-none'}`}>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={toggleMenu}
          ></div>

          {/* Panel */}
          <div
            className={`relative w-full max-w-sm bg-white h-full shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-xl text-gray-800">Menu</h2>
              <button onClick={toggleMenu} className="p-2">
                <FaTimes className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow p-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={handleMobileNavClick} className={mobileNavLinkClasses}>
                  {link.text}
                </NavLink>
              ))}
            </nav>

            {/* Panel Footer (Auth section) */}
            <div className="p-4 border-t bg-gray-50">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 mb-4">
                    {renderUserAvatar()}
                    <div>
                      <div className="font-bold text-gray-800 truncate">{user?.display_name || user?.name || user?.school_name || user?.displayName || user?.email}</div>
                      <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/blogs" onClick={handleMobileNavClick} className="flex items-center space-x-3 p-3 rounded-md text-gray-700 font-medium hover:bg-gray-200 w-full">
                      <FaCog className="w-5 h-5" /> <span>Admin Panel</span>
                    </Link>
                  )}
                  {/* <Link to="/profile" onClick={handleMobileNavClick} className="flex items-center space-x-3 p-3 rounded-md text-gray-700 font-medium hover:bg-gray-200 w-full">
                    <FaUserCircle className="w-5 h-5" /> <span>Profile</span>
                  </Link> */}
                  <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-md text-gray-700 font-medium hover:bg-gray-200 w-full">
                    <FaSignOutAlt className="w-5 h-5" /> <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/auth/register" onClick={handleMobileNavClick} className="block w-full text-center font-medium text-white bg-[#54BD95] px-5 py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Sign Up
                  </Link>
                  <Link to="/auth/login" onClick={handleMobileNavClick} className="block w-full text-center font-medium text-gray-700 bg-gray-200 px-5 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;