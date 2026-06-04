'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, Heart, MessageCircle, Shield, Sparkles, Activity, Brain, Star, Flower2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play hero video
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(error => {
        console.log("Hero video autoplay failed:", error);
      });
    }
    // Auto-play background video
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch(error => {
        console.log("Background video autoplay failed:", error);
      });
    }
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: "Period Tracking",
      description: "Log your periods and get accurate predictions for your next cycle",
      bg: "from-pink-500 to-rose-500",
      delay: 0.1
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Mood & Symptoms",
      description: "Track how you feel daily and identify patterns in your cycle",
      bg: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "AI Chatbot",
      description: "Get answers to your health questions with our intelligent assistant",
      bg: "from-blue-500 to-indigo-500",
      delay: 0.3
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties",
      bg: "from-green-500 to-teal-500",
      delay: 0.4
    },
    {
      icon: <Sparkles className="w-8 h-8 text-white" />,
      title: "Smart Insights",
      description: "Receive personalized insights about your menstrual health",
      bg: "from-yellow-500 to-orange-500",
      delay: 0.5
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "Health Analytics",
      description: "Visualize your cycles and track your health trends",
      bg: "from-cyan-500 to-blue-500",
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Video Animation - Full Page Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={bgVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{ filter: "brightness(0.35) contrast(1.05)" }}
        >
          <source src="/images/img2.mp4" type="video/mp4" />
        </video>
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-purple-900/50 to-rose-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-center lg:text-left"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-pink-300 mr-2" />
                  <span className="text-sm text-white font-medium">AI-Powered Women's Health</span>
                </motion.div>
                
                <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                  <span className="text-white">Track Your Cycle.</span>
                  <br />
                  <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
                    Understand Your Body.
                  </span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Experience intelligent period tracking, personalized insights, and AI-powered health guidance - all in one beautiful app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <Link href="/dashboard" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all inline-flex items-center justify-center group shadow-lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                    </Link>
                  ) : (
                    <>
                      <Link href="/register" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all inline-flex items-center justify-center group shadow-lg">
                        Start Tracking Free
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                      </Link>
                      <Link href="#features" className="border-2 border-white/50 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all inline-flex items-center justify-center backdrop-blur-sm">
                        Learn More
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
              
              {/* Right Side - Hero Video Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative"
              >
                <div className="relative animate-float">
                  <div className="w-full max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-purple-500 p-1">
                    <video
                      ref={heroVideoRef}
                      className="w-full h-auto rounded-2xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    >
                      <source src="/images/img1.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  {/* Decorative floating elements */}
                  <div className="absolute -top-5 -right-5 w-20 h-20 bg-pink-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-purple-400 rounded-full blur-2xl opacity-40 animate-pulse delay-1000"></div>
                  
                  {/* Floating hearts */}
                  <motion.div 
                    className="absolute -top-10 -left-10"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-6 h-6 text-pink-300 fill-pink-300" />
                  </motion.div>
                  <motion.div 
                    className="absolute -bottom-8 right-8"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Heart className="w-4 h-4 text-purple-300 fill-purple-300" />
                  </motion.div>
                  <motion.div 
                    className="absolute top-1/2 -right-8"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  >
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section with Glassmorphism */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-white">
                Amazing Features for You
              </h2>
              <p className="text-xl text-white/80">Everything you need to understand your body better</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:shadow-2xl transition-all group cursor-pointer border border-white/20"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: "50K+", label: "Active Users", delay: 0.1 },
                { value: "1M+", label: "Cycles Tracked", delay: 0.2 },
                { value: "98%", label: "Satisfaction Rate", delay: 0.3 },
                { value: "24/7", label: "AI Support", delay: 0.4 }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: stat.delay }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl font-bold text-pink-300 mb-2">{stat.value}</div>
                  <p className="text-white/80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-12 border border-white/20"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of women who are already using Feminaflow to understand their bodies better.
              </p>
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link 
                  href="/register" 
                  className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 shadow-lg"
                >
                  Get Started Today
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}