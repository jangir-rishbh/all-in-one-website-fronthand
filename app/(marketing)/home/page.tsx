'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import ProductCard from "@components/ProductCard";

// Clothing collection with different categories
const featuredProducts = [
  // Sarees
  {
    id: "s1",
    name: "Banarasi Silk Saree",
    price: 5499,
    image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
    category: "Saree"
  },
  {
    id: "s2",
    name: "Kanjivaram Silk",
    price: 6999,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Saree"
  },
  
  // Suits
  {
    id: "st1",
    name: "Designer Suit Set",
    price: 4299,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1136&q=80",
    category: "Suit"
  },
  {
    id: "st2",
    name: "Party Wear Suit",
    price: 3599,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    category: "Suit"
  },
  
  // Jeans
  {
    id: "j1",
    name: "Slim Fit Jeans",
    price: 1799,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    category: "Jeans"
  },
  {
    id: "j2",
    name: "Ripped Jeans",
    price: 2199,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    category: "Jeans"
  },
  
  // Pants
  {
    id: "p1",
    name: "Formal Trousers",
    price: 1599,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
    category: "Pants"
  },
  {
    id: "p2",
    name: "Casual Chinos",
    price: 1399,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1136&q=80",
    category: "Pants"
  }
];

// Categories
const categories = [
  { name: "Sarees", image: "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", link: "/products?category=saree" },
  { name: "Suits", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", link: "/products?category=suit" },
  { name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", link: "/products?category=jeans" },
  { name: "Pants", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", link: "/products?category=pants" },
];

export default function HomePage() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');
  const [custom, setCustom] = useState<Array<{ id: string; name: string; price: number; image?: string | null; category?: string | null }>>([]);
  const [websiteName, setWebsiteName] = useState('Ma Baba');

  useEffect(() => {
    api.getWebsiteInfo()
      .then((res) => {
        if (res.success && res.websiteInfo?.name) {
          setWebsiteName(res.websiteInfo.name);
        }
      })
      .catch(() => {/* ignore error */});
  }, []);

  useEffect(() => {
    if (redirectedFrom) {
      console.log(`Please log in to access ${redirectedFrom}`);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('redirectedFrom');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [redirectedFrom]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products/custom');
        if (!res.ok) {
          setCustom([]);
          return;
        }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setCustom([]);
          return;
        }
        const data = await res.json();
        setCustom(Array.isArray(data) ? data : []);
      } catch (error) {
        setCustom([]);
      }
    })();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          {redirectedFrom && (
            <div className="mb-8 inline-block px-6 py-3 bg-yellow-100/10 backdrop-blur-md text-yellow-300 rounded-full border border-yellow-500/30">
              Please log in to access {redirectedFrom}
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
            <span className="block text-yellow-400 mb-2 text-3xl md:text-4xl font-light tracking-widest">WELCOME TO</span>
            <span className="relative inline-block">
              <span className="relative z-10">
                <span className="text-yellow-400">{websiteName}</span>
              </span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-yellow-400/30 -z-0 transform -rotate-1"></span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover the perfect blend of tradition and trend in our exclusive collection of ethnic and contemporary fashion
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link 
              href="/products" 
              className="relative group px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-full overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/contact" 
              className="px-8 py-4 border-2 border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 hover:border-white/40"
            >
              Contact Us
            </Link>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-yellow-300 text-lg md:text-xl font-medium mb-2">🏪 In-Store Shopping Experience</p>
            <p className="text-white/80">Visit our store to explore our exclusive collection and enjoy personalized assistance from our fashion experts.</p>
          </div>
          
        </div>
      </section>

      {/* Categories Section - visible only when logged in */}
      {session && (
        <section className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">Our Collections</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Discover Our Categories</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  href={category.link} 
                  className="group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      priority={index < 3} // Preload first 3 images
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <span className="text-white/80 text-sm font-medium group-hover:text-yellow-300 transition-colors duration-300">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none group-hover:border-yellow-400/50 transition-all duration-500"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-yellow-600 text-sm font-semibold tracking-widest uppercase mb-3">Our Selection</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Featured Products</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...custom.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), image: p.image || '', category: p.category || 'Custom' })), ...featuredProducts].map((product) => (
              <div key={product.id} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-300 group-hover:duration-200"></div>
                <div className="relative h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-transparent dark:border-gray-700">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Upgrade Your Wardrobe?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Visit our store today and experience the perfect blend of style, comfort, and tradition.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-white text-indigo-900 font-medium rounded-full hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Us
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 border-2 border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
