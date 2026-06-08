'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ArrowRight, Flower2, Code, Sparkles } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8 mt-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pink-500/5 to-purple-500/5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Flower2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Feminaflow
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering women to understand their bodies through intelligent period tracking and personalized health insights.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              {[
                { icon: "📘", name: "Facebook", href: "#", color: "hover:bg-blue-600" },
                { icon: "📷", name: "Instagram", href: "#", color: "hover:bg-pink-600" },
                { icon: "🐦", name: "Twitter", href: "#", color: "hover:bg-sky-600" },
                { icon: "💼", name: "LinkedIn", href: "#", color: "hover:bg-blue-700" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className={`w-9 h-9 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 ${social.color}`}
                >
                  <span className="text-base">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4"></div>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "#" },
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#" },
                { name: "Success Stories", href: "#" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-gray-400 hover:text-pink-400 transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-pink-500 transition-all duration-300 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4"></div>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "#" },
                { name: "Blog", href: "#" },
                { name: "Community", href: "#" },
                { name: "Webinars", href: "#" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-gray-400 hover:text-pink-400 transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-pink-500 transition-all duration-300 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Newsletter</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4"></div>
            <p className="text-gray-400 text-sm">
              Get weekly health tips, product updates, and wellness insights.
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              <p className="text-gray-400 text-sm">
                2024 Feminaflow. All rights reserved.
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Secure & Private
              </span>
              <span className="text-xs text-gray-500">SSL Encrypted</span>
              <span className="text-xs text-gray-500">GDPR Compliant</span>
            </div>
            
            {/* Back to Top */}
            <motion.button
              whileHover={{ y: -3 }}
              onClick={scrollToTop}
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors group"
            >
              <span className="text-sm">Back to Top</span>
              <ArrowRight className="w-4 h-4 rotate-[-90deg] group-hover:-translate-y-1 transition" />
            </motion.button>
          </div>
        </div>

        {/* Developer Credit - Unique Stylish Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-white/5"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Decorative line */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-pink-500"></div>
              <Sparkles className="w-4 h-4 text-pink-400" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-pink-500"></div>
            </div>
            
            {/* Developer Info */}
            <div className="text-center">
              <p className="text-gray-500 text-xs tracking-wider uppercase mb-1">Created with</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Code className="w-4 h-4 text-pink-400" />
                <span className="text-gray-300 text-sm font-medium">by</span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-base font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent cursor-pointer"
                >
                  Hemant Raj
                </motion.span>
                <span className="text-gray-600 text-sm mx-1">•</span>
                <span className="text-gray-500 text-xs">Full Stack Developer</span>
              </div>
            </div>
            
            {/* Animated dot */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-300"></div>
              <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse delay-600"></div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </footer>
  );
}