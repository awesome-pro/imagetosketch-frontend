"use client";

import { AdvancedSketchify } from '@/components/AdvancedSketchify';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Settings, 
  History, 
  BookOpen, 
  HelpCircle, 
  Bell, 
  User,
  ChevronDown,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

function MainApp() {
  
  
  return (
    <div className="h-screen w-screen flex items-center justify-center px-4 lg:px-10 bg-gradient-to-b from-slate-100 to-slate-300">
     
                    <AdvancedSketchify />
    
    </div>
  );
}

export default MainApp;
