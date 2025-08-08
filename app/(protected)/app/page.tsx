"use client";

import { AdvancedSketchify } from '@/components/AdvancedSketchify';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Settings, 
  User, 
  HelpCircle,
  Brush,
  Sparkles,
  ChevronLeft,
  Star,
  Heart,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function MainApp() {
  const [showSidebar, setShowSidebar] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <motion.nav 
        className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/20 dark:border-slate-700/20 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Brush className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    ImageToSketch
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Studio</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                <span className="text-green-700 dark:text-green-400 font-medium">Live Processing</span>
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help & Support</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Professional AI Studio
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Transform Your <span className="text-primary">Images</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Upload your photos and watch as our advanced AI creates stunning pencil sketches, charcoal drawings, and artistic renderings.
              </p>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Processing Speed</p>
                  <p className="text-lg font-semibold">2.5s Average</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Quality Rating</p>
                  <p className="text-lg font-semibold">4.9/5 Stars</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Satisfaction</p>
                  <p className="text-lg font-semibold">98% Happy</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Processing Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <AdvancedSketchify />
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 mt-16 py-8 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>© {new Date().getFullYear()} ImageToSketch. Powered by advanced AI technology.</p>
            <div className="flex justify-center items-center space-x-4 mt-2">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default MainApp;
