"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Grid2X2, 
  List, 
  Heart, 
  Download, 
  Share2, 
  Eye, 
  Sparkles, 
  Camera, 
  Palette, 
  Brush,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Zap,
  Award,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Gallery data structure
interface GalleryItem {
  id: string;
  title: string;
  description: string;
  originalImage: string;
  sketchImage: string;
  category: string;
  style: string;
  likes: number;
  views: number;
  author: string;
  authorAvatar: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
}

// Mock gallery data - you can replace this with actual images from your public folder
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Portrait Study',
    description: 'A beautiful portrait transformation showcasing detailed facial features and expressions.',
    originalImage: '/users/1.webp',
    sketchImage: '/sketches/s1.jpg',
    category: 'portraits',
    style: 'Classic Pencil',
    likes: 124,
    views: 856,
    author: 'Sarah Chen',
    authorAvatar: '/users/2.webp',
    featured: true,
    tags: ['portrait', 'pencil', 'realistic'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Urban Landscape',
    description: 'City skyline transformed into an artistic charcoal sketch with dramatic shadows.',
    originalImage: '/users/3.webp',
    sketchImage: '/sketches/s2.jpg',
    category: 'landscapes',
    style: 'Charcoal',
    likes: 89,
    views: 542,
    author: 'Michael Rodriguez',
    authorAvatar: '/users/4.webp',
    featured: false,
    tags: ['landscape', 'charcoal', 'urban'],
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Nature Scene',
    description: 'Peaceful nature scene converted to a delicate line art sketch.',
    originalImage: '/users/2.webp',
    sketchImage: '/sketches/s3.webp',
    category: 'nature',
    style: 'Line Art',
    likes: 156,
    views: 734,
    author: 'Emma Thompson',
    authorAvatar: '/users/1.webp',
    featured: true,
    tags: ['nature', 'line-art', 'peaceful'],
    createdAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'Abstract Composition',
    description: 'Modern abstract piece transformed into sophisticated pencil work.',
    originalImage: '/users/4.webp',
    sketchImage: '/sketches/s4.png',
    category: 'abstract',
    style: 'Advanced Pencil',
    likes: 203,
    views: 1247,
    author: 'David Kim',
    authorAvatar: '/users/3.webp',
    featured: true,
    tags: ['abstract', 'modern', 'sophisticated'],
    createdAt: '2024-01-08'
  },
  // Additional mock items to demonstrate variety
  {
    id: '5',
    title: 'Street Photography',
    description: 'Candid street moment captured and transformed into artistic sketch.',
    originalImage: '/users/1.webp',
    sketchImage: '/sketches/s1.jpg',
    category: 'street',
    style: 'Artistic',
    likes: 67,
    views: 423,
    author: 'Lisa Wang',
    authorAvatar: '/users/2.webp',
    featured: false,
    tags: ['street', 'candid', 'artistic'],
    createdAt: '2024-01-05'
  },
  {
    id: '6',
    title: 'Pet Portrait',
    description: 'Adorable pet portrait with incredible detail and personality.',
    originalImage: '/users/3.webp',
    sketchImage: '/sketches/s2.jpg',
    category: 'animals',
    style: 'Classic Pencil',
    likes: 298,
    views: 1856,
    author: 'John Miller',
    authorAvatar: '/users/4.webp',
    featured: true,
    tags: ['pet', 'animal', 'portrait'],
    createdAt: '2024-01-03'
  }
];

const categories = [
  { value: 'all', label: 'All Categories', icon: Grid3X3 },
  { value: 'portraits', label: 'Portraits', icon: Users },
  { value: 'landscapes', label: 'Landscapes', icon: Camera },
  { value: 'nature', label: 'Nature', icon: Sparkles },
  { value: 'abstract', label: 'Abstract', icon: Palette },
  { value: 'street', label: 'Street', icon: Eye },
  { value: 'animals', label: 'Animals', icon: Heart }
];

const styles = [
  { value: 'all', label: 'All Styles' },
  { value: 'Classic Pencil', label: 'Classic Pencil' },
  { value: 'Charcoal', label: 'Charcoal' },
  { value: 'Line Art', label: 'Line Art' },
  { value: 'Advanced Pencil', label: 'Advanced Pencil' },
  { value: 'Artistic', label: 'Artistic' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'featured', label: 'Featured' }
];

export default function GalleryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>('masonry');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort gallery items
  const filteredItems = useMemo(() => {
    const filtered = galleryItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle;
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesStyle && matchesSearch;
    });

    // Sort items
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [selectedCategory, selectedStyle, sortBy, searchTerm]);

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.sketchImage;
    link.download = `${item.title.replace(/\s+/g, '_')}_sketch.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (item: GalleryItem) => {
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Sketch Gallery
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Discover Amazing Art</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/app')}
                className="rounded-xl"
              >
                <Brush className="w-4 h-4 mr-2" />
                Create Your Own
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-primary/10 border-primary/20">
              <Award className="w-4 h-4 mr-2" />
              Featured Gallery
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Artistic Masterpieces
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Explore a curated collection of stunning photo-to-sketch transformations created by our AI-powered platform. 
              Get inspired and see what's possible.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Artworks</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600">25K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Artists</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600">1M+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Views</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-600">4.9★</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="relative py-8 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search artworks, styles, or artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg text-lg"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300",
                      selectedCategory === category.value
                        ? "bg-primary text-white border-primary shadow-lg"
                        : "bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Filters and View Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="w-40 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('masonry')}
                    className="rounded-lg"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-primary">{filteredItems.length}</span> artworks
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="popLayout">
            {viewMode === 'masonry' && (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="break-inside-avoid mb-6"
                  >
                    <GalleryCard 
                      item={item} 
                      onView={() => setSelectedItem(item)}
                      onDownload={() => handleDownload(item)}
                      onShare={() => handleShare(item)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GalleryCard 
                      item={item} 
                      onView={() => setSelectedItem(item)}
                      onDownload={() => handleDownload(item)}
                      onShare={() => handleShare(item)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GalleryListItem 
                      item={item} 
                      onView={() => setSelectedItem(item)}
                      onDownload={() => handleDownload(item)}
                      onShare={() => handleShare(item)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                No artworks found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStyle('all');
                }}
                className="rounded-xl"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0 shadow-none">
          {selectedItem && (
            <GalleryLightbox 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)}
              onDownload={() => handleDownload(selectedItem)}
              onShare={() => handleShare(selectedItem)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Call to Action */}
      <section className="relative py-20 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Your Own <span className="text-primary">Masterpiece?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of artists and transform your photos into stunning sketches with our AI-powered platform.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/app')}
              className="gap-3 px-8 py-4 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Brush className="w-5 h-5" />
              Start Creating Now
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Gallery Card Component
function GalleryCard({ 
  item, 
  onView, 
  onDownload, 
  onShare 
}: { 
  item: GalleryItem; 
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <Card className="group overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
      <div className="relative overflow-hidden" onClick={onView}>
        <Image 
          src={item.sketchImage} 
          alt={item.title}
          width={400}
          height={600}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {item.featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500/90 text-yellow-900 border-0">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-between items-end">
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm opacity-90">{item.style}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image 
              src={item.authorAvatar} 
              alt={item.author}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.author}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {item.likes}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.views}
            </span>
          </div>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Gallery List Item Component
function GalleryListItem({ 
  item, 
  onView, 
  onDownload, 
  onShare 
}: { 
  item: GalleryItem; 
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <Card className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="relative w-48 h-32 rounded-xl overflow-hidden cursor-pointer group" onClick={onView}>
            <Image 
              src={item.sketchImage} 
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {item.featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-900 border-0 text-xs">
                Featured
              </Badge>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">{item.title}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Image 
                      src={item.authorAvatar} 
                      alt={item.author}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    {item.author}
                  </div>
                  <span>•</span>
                  <span>{item.style}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onDownload}
                  className="rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onShare}
                  className="rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {item.likes} likes
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {item.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <Button onClick={onView} className="rounded-lg">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Gallery Lightbox Component
function GalleryLightbox({ 
  item, 
  onClose, 
  onDownload, 
  onShare 
}: { 
  item: GalleryItem; 
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <motion.div 
      className="relative bg-slate-900/95 backdrop-blur-lg rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        <div className="relative">
          <Image 
            src={item.sketchImage} 
            alt={item.title}
            width={600}
            height={800}
            className="w-full h-auto rounded-xl shadow-2xl"
          />
          {item.featured && (
            <Badge className="absolute top-3 left-3 bg-yellow-500/90 text-yellow-900 border-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <div className="text-white space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{item.title}</h2>
            <p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Image 
              src={item.authorAvatar} 
              alt={item.author}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <div className="font-semibold">{item.author}</div>
              <div className="text-slate-400 text-sm">Artist</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{item.likes}</div>
              <div className="text-slate-400 text-sm">Likes</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">{item.views}</div>
              <div className="text-slate-400 text-sm">Views</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-slate-400">Style: </span>
              <Badge variant="outline" className="text-white border-white/20">
                {item.style}
              </Badge>
            </div>
            <div>
              <span className="text-slate-400">Category: </span>
              <Badge variant="outline" className="text-white border-white/20">
                {item.category}
              </Badge>
            </div>
            <div>
              <span className="text-slate-400">Created: </span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={onDownload}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={onShare}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-slate-300 border-slate-600 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
