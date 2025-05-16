"use client";

import { Sketchify } from "@/components/sketchify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Image as ImageIcon, Sparkles, CheckCircle, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() 
{
    const router = useRouter();
    const userImages: string[] = [
      '/users/1.webp',
      '/users/2.webp',
      '/users/3.webp',
      '/users/4.webp',
    ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Sketch Transformation
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Transform Photos into <br className="hidden md:block" />
                <span className="text-primary">Artistic Sketches</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Turn your ordinary photos into extraordinary pencil sketches with our advanced AI technology. Fast, simple, and stunning results in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full lg:justify-start">
                <Button size="lg" className="gap-2 group rounded-full w-full lg:w-48" onClick={() => router.push('/app')}>
                  Try It Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full w-full lg:w-48" onClick={() => router.push('/gallery')}>
                  View Gallery
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  {userImages.map((image, index) => (
                    <Image key={index} src={image} alt={`User ${index + 1}`} width={50} height={50} className="overflow-clip rounded-full"/>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">500+</span> satisfied users
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 w-full max-w-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-background/70 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <Sketchify />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ImageToSketch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our platform offers unmatched features that make sketch creation simple, fast, and beautiful.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-10 h-10 text-primary" />,
                title: "Instant Transformation",
                description: "Convert your photos to sketches in seconds with our powerful AI engine."
              },
              {
                icon: <Sparkles className="w-10 h-10 text-primary" />,
                title: "Multiple Styles",
                description: "Choose from various sketch styles including basic, advanced, and artistic renderings."
              },
              {
                icon: <ImageIcon className="w-10 h-10 text-primary" />,
                title: "High Quality Output",
                description: "Get high-resolution sketches that preserve the details of your original photos."
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-primary" />,
                title: "Easy to Use",
                description: "Simple drag-and-drop interface makes the process intuitive for everyone."
              },
              {
                icon: <ArrowRight className="w-10 h-10 text-primary" />,
                title: "Instant Download",
                description: "Download your sketches immediately after processing, no waiting required."
              },
              {
                icon: <Sparkles className="w-10 h-10 text-primary" />,
                title: "Batch Processing",
                description: "Transform multiple photos at once to save time and effort."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-background rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="bg-primary/10 rounded-2xl p-8 md:p-12 relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your photos?</h2>
                <p className="text-muted-foreground max-w-xl">Start creating beautiful sketches today with our easy-to-use platform.</p>
              </div>
              
              <Button size="lg" className="gap-2 group w-full md:w-auto rounded-full" onClick={() => router.push('/app')}>
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">ImageToSketch</h2>
              <p className="text-muted-foreground">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            
            <div className="flex gap-8">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
