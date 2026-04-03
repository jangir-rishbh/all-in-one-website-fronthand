"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [websiteInfo, setWebsiteInfo] = useState({ 
    name: 'Ma Baba Cloth Store', 
    address: 'Post office gadli, Gadli, District - Jhunjhunu, State - Rajasthan, PIN - 333033',
    phone: '+91 86967 90758',
    email: 'manishjangir348@gmail.com'
  });

  // Fetch website identity info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.getWebsiteInfo();
        if (res.success && res.websiteInfo) {
          setWebsiteInfo(prevState => ({
            ...prevState,
            ...res.websiteInfo
          }));
        }
      } catch (err) {
        console.error('Failed to fetch website info:', err);
      }
    };
    fetchInfo();
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-6">
              <div className="text-4xl md:text-5xl font-serif font-black text-white mb-2">
                <span className="relative text-yellow-400 drop-shadow-lg">
                  {websiteInfo.name === 'Ma Baba Cloth Store' ? (
                    <>
                      <span>Ma</span> <span className="text-white">Baba</span>
                    </>
                  ) : (
                    <span>{websiteInfo.name}</span>
                  )}
                </span>
              </div>
              <div className="text-sm font-sans font-semibold tracking-widest text-gray-100 uppercase">Elegant Clothing & Fashion</div>
              <div className="w-16 h-0.5 bg-yellow-400 mt-3 mb-4"></div>
            </div>
            <p className="text-gray-300">
              We have all types of clothing available. We guarantee quality and affordable prices.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/home" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="text-gray-300 space-y-1">
              {websiteInfo.address?.split(',').map((line, i) => (
                <p key={i}>{line.trim()}</p>
              )) || (
                <>
                  <p>Post office gadli, Gadli</p>
                  <p>District - Jhunjhunu</p>
                  <p>State - Rajasthan, PIN - 333033</p>
                </>
              )}
            </div>
            <p className="text-gray-300 mt-2">
              <a href={`tel:${websiteInfo.phone?.replace(/\s+/g, '') || '+918696790758'}`} className="hover:text-white">
                Phone: {websiteInfo.phone || '+91 86967 90758'}
              </a>
            </p>
            <p className="text-gray-300 mt-1">
              <a href={`mailto:${websiteInfo.email || 'manishjangir348@gmail.com'}`} className="hover:text-white">
                Email: {websiteInfo.email || 'manishjangir348@gmail.com'}
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} 
            <span className="font-serif italic ml-1">
              {websiteInfo.name === 'Ma Baba Cloth Store' ? (
                <>
                  <span className="text-yellow-400">Ma Baba</span>
                  <span className="text-white"> Cloth Store</span>
                </>
              ) : (
                <span className="text-white">{websiteInfo.name}</span>
              )}
            </span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}