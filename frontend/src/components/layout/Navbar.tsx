'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, Home, Calendar, Activity, BarChart3, MessageCircle, User, LogOut, Heart, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items for all users
  const publicNavItems = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  // Navigation items for authenticated users
  const privateNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { href: '/calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { href: '/tracker', label: 'Tracker', icon: <Activity className="w-4 h-4" /> },
    { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/chat', label: 'AI Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { href: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const navItems = isAuthenticated ? [...publicNavItems, ...privateNavItems] : publicNavItems;

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'}`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo with Professional Text */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/logo.jpg"
                  alt="Feminaflow Logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-rose-500 transition-all duration-300">
                  Feminaflow
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider -mt-1">TRACK • UNDERSTAND • THRIVE</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons or User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-50 to-purple-50">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-gray-700">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-pink-600 transition">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:shadow-lg transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-white pt-16 md:hidden"
        >
          <div className="container mx-auto px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="mt-4 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}