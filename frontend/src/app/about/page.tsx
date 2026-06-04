'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users, Award, Target, Sparkles, Star, Flower2, Shield, Clock, Globe, Zap, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-6 h-6" />, color: "from-pink-500 to-rose-500" },
    { value: "1M+", label: "Cycles Tracked", icon: <Target className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
    { value: "98%", label: "Satisfaction", icon: <Award className="w-6 h-6" />, color: "from-green-500 to-teal-500" },
    { value: "24/7", label: "AI Support", icon: <Clock className="w-6 h-6" />, color: "from-blue-500 to-cyan-500" }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Empathy First",
      description: "We understand every woman's journey is unique. Our approach is rooted in compassion and understanding.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy Guaranteed",
      description: "Your data is encrypted and never shared. Your health journey stays completely private.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Innovation",
      description: "Cutting-edge AI technology provides accurate predictions and personalized insights.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Community",
      description: "Join thousands of women worldwide in understanding and embracing their cycles.",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const team = [
    { name: "Dr. Sarah Johnson", role: "Chief Medical Officer", image: "/images/team1.jpg", delay: 0.1 },
    { name: "Emily Chen", role: "Lead Developer", image: "/images/team2.jpg", delay: 0.2 },
    { name: "Dr. Maria Garcia", role: "Health Advisor", image: "/images/team3.jpg", delay: 0.3 },
    { name: "Jessica Williams", role: "Community Manager", image: "/images/team4.jpg", delay: 0.4 }
  ];

  const journey = [
    { step: "01", title: "Sign Up", description: "Create your free account in seconds", icon: "📝" },
    { step: "02", title: "Track", description: "Log your periods, moods, and symptoms", icon: "📊" },
    { step: "03", title: "Analyze", description: "Get AI-powered insights and predictions", icon: "🤖" },
    { step: "04", title: "Thrive", description: "Understand and embrace your cycle", icon: "🌟" }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <Image
          src="/images/img6.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-rose-900/40 z-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-30">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6"
              >
                <Heart className="w-4 h-4 text-pink-300 mr-2" />
                <span className="text-sm text-white font-medium">Our Story</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                Empowering Women Through
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400 bg-clip-text text-transparent"> Technology & Compassion</span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Feminaflow was born from a simple idea: every woman deserves to understand her body 
                and feel empowered throughout her cycle journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-pink-300 mr-2" />
                  <span className="text-sm text-white">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold text-white">
                  Making Period Health
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> Accessible to All</span>
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  We believe that period tracking should be more than just marking dates on a calendar. 
                  It's about understanding your body's unique rhythm, predicting changes, and feeling 
                  confident in your health journey.
                </p>
                <p className="text-white/70 text-lg leading-relaxed">
                  Our AI-powered platform combines medical expertise with cutting-edge technology to 
                  provide personalized insights that help you thrive at every stage of your cycle.
                </p>
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all group"
                >
                  Join Our Community
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-center text-white shadow-xl`}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-pink-500/50 transition-all"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                    <div className="text-white">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-white/60 text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Your Journey With Us
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Simple steps to better understand your body
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {journey.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 -z-10"></div>
                    )}
                  </div>
                  <div className="text-pink-400 font-bold text-sm mb-2">{step.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
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
              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-12 border border-white/20 max-w-4xl mx-auto"
            >
              <Flower2 className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of women who have already taken control of their cycle health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register" 
                  className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-block border-2 border-white/50 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}