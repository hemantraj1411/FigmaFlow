'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  BarChart3,
  MessageCircle,
  User,
  LogOut,
  Heart,
  Droplet,
  Brain,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
  { href: '/tracker', label: 'Tracker', icon: <Activity className="w-5 h-5" /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/chat', label: 'AI Chat', icon: <MessageCircle className="w-5 h-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r shadow-lg z-30 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b">
        <div className="relative w-10 h-10">
          <Image
            src="/images/logo.jpg"
            alt="Feminaflow Logo"
            width={40}
            height={40}
            className="object-cover rounded-xl"
            priority
          />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Feminaflow
          </h1>
          <p className="text-xs text-gray-500">Track. Understand. Thrive.</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={isActive ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-600'}>
                {item.icon}
              </div>
              <span className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}