"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  Zap, 
  ChevronRight,
  Star,
  Users,
  Clock,
  Shield,
  Download,
  Palette,
  Cpu,
  Eye,
  Award,
  TrendingUp,
  Heart,
  Quote,
  Play,
  Camera,
  Brush
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
  
    const userImages: string[] = [
      '/users/1.webp',
      '/users/2.webp',
      '/users/3.webp',
      '/users/4.webp',
    ];

  const beforeAfterExamples = [
    {
      before: '/sketches/s1.jpg',
      after: '/sketches/s1.jpg',
      style: 'Classic Pencil'
    },
    {
      before: '/sketches/s2.jpg',
      after: '/sketches/s2.jpg',
      style: 'Artistic Charcoal'
    },
    {
      before: '/sketches/s3.webp',
      after: '/sketches/s3.webp',
      style: 'Fine Line Art'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Artist",
      content: "The quality of sketches is absolutely incredible. It's like having a professional artist at your fingertips.",
      avatar: "/users/1.webp",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Photographer",
      content: "I use this for all my portrait work. The AI understands facial features better than any other tool I've tried.",
      avatar: "/users/2.webp",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Content Creator",
      content: "Perfect for social media content. My followers love the artistic touch it adds to regular photos.",
      avatar: "/users/3.webp",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Photos Transformed", icon: <ImageIcon className="w-6 h-6" /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Heart className="w-6 h-6" /> },
    { number: "2.5s", label: "Average Process Time", icon: <Clock className="w-6 h-6" /> },
    { number: "24/7", label: "Available", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ImageToSketch
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-primary transition-colors">Features</Link>
              <Link href="#gallery" className="text-slate-600 hover:text-primary transition-colors">Gallery</Link>
              <Link href="#pricing" className="text-slate-600 hover:text-primary transition-colors">Pricing</Link>
              <Button size="sm" className="rounded-full" onClick={() => router.push('/app')}>
                Try Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm bg-primary/10 border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Sketch Transformation
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                Transform Photos into{" "}
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Stunning Sketches
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience the magic of AI artistry. Convert any photo into professional-quality pencil sketches, 
                charcoal drawings, or fine line art in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="gap-3 group px-8 py-4 text-lg rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => router.push('/app')}
                >
                  <Camera className="w-5 h-5" />
                  Start Creating Free
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-3 px-8 py-4 text-lg rounded-full border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                  onClick={() => router.push('/gallery')}
                >
                  <Play className="w-5 h-5" />
                  View Examples
                </Button>
              </div>
              
              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                  {userImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image 
                          src={image} 
                          alt={`User ${index + 1}`} 
                          width={48} 
                          height={48} 
                          className="rounded-full border-3 border-white shadow-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">50,000+</span> creators trust us
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Live processing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Before/After Gallery Section */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/20">
              <Eye className="w-4 h-4 mr-2" />
              See the Magic
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Real Photos, <span className="text-primary">Stunning Results</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Witness the transformation power of our AI. From ordinary photos to extraordinary artistic sketches.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {beforeAfterExamples.map((example, index) => (
              <motion.div 
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image 
                    src={example.before} 
                    alt={`Example ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/90 text-slate-900 hover:bg-white">
                      {example.style}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 px-8 py-4 rounded-full border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              onClick={() => router.push('/gallery')}
            >
              <ImageIcon className="w-5 h-5" />
              View Full Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/20">
              <Award className="w-4 h-4 mr-2" />
              Premium Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-primary">ImageToSketch Pro</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Industry-leading technology meets intuitive design. Experience the difference with our premium sketch conversion platform.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-8 h-8" />,
                title: "Advanced AI Engine",
                description: "State-of-the-art neural networks trained on millions of artistic sketches for unmatched quality.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Process images in under 3 seconds with our optimized cloud infrastructure.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Multiple Art Styles",
                description: "Choose from 12+ artistic styles including pencil, charcoal, ink, and watercolor effects.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Privacy Protected",
                description: "Your images are automatically deleted after processing. We never store your personal photos.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: <Download className="w-8 h-8" />,
                title: "HD Downloads",
                description: "Get high-resolution outputs up to 4K. Perfect for printing and professional use.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Batch Processing",
                description: "Upload and process multiple images simultaneously to save time on large projects.",
                gradient: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 hover:bg-white dark:hover:bg-slate-750 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/20 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-white border-primary/20">
              <Quote className="w-4 h-4 mr-2" />
              Customer Love
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our <span className="text-primary">Creators Say</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of satisfied artists, photographers, and content creators who trust ImageToSketch.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Amazing Art?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join over 50,000 creators who have transformed millions of photos into stunning sketches. Start your artistic journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="gap-3 px-8 py-4 text-lg rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:from-yellow-300 hover:to-orange-400 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300" 
                onClick={() => router.push('/app')}
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-4 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center items-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Premium Quality</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Brush className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">ImageToSketch</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                Transform your photos into stunning artistic sketches with the power of AI. Professional quality, instant results.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-3 text-slate-400">
                <Link href="/features" className="block hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block hover:text-white transition-colors">Pricing</Link>
                <Link href="/gallery" className="block hover:text-white transition-colors">Gallery</Link>
                <Link href="/api" className="block hover:text-white transition-colors">API</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-3 text-slate-400">
                <Link href="/about" className="block hover:text-white transition-colors">About Us</Link>
                <Link href="/blog" className="block hover:text-white transition-colors">Blog</Link>
                <Link href="/careers" className="block hover:text-white transition-colors">Careers</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-3 text-slate-400">
                <Link href="/help" className="block hover:text-white transition-colors">Help Center</Link>
                <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/status" className="block hover:text-white transition-colors">Status</Link>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400">
              © {new Date().getFullYear()} ImageToSketch. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span>Made with ❤️ for creators</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}