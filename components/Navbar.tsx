"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/context/I18nContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState({ name: 'Ma Baba Cloth Store', logoUrl: '' });
  const { session, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = !loading && session?.role === 'admin';
  const { t } = useI18n();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Fetch website identity info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.getWebsiteInfo();
        if (res.success && res.websiteInfo) {
          setWebsiteInfo(res.websiteInfo);
        }
      } catch (err) {
        console.error('Failed to fetch website info:', err);
      }
    };
    fetchInfo();
  }, []);

  // Fixed brand text as per request
  const brandText = 'MB';

  // No extra display name next to brand; only initials in the circle

  // Logout has been moved to Settings page

  // Handle logout using AuthContext
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/login';
    }
  };

  // Navigation items
  const baseNavItems = [
    { key: 'home', href: '/home' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
    { key: 'gallery', href: '/gallery' },
  ];
  const navItems = (!loading && session)
    ? [
        ...baseNavItems,
        { key: 'messages', href: '/messages' },
      ]
    : baseNavItems;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className={`mr-2 md:mr-3 p-2 rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600 focus:ring-white ${pathname === '/home' ? 'hidden' : ''}`}
              aria-label={t('back')}
              title={t('back')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <Link href="/home" className="group relative">
              <div className="flex items-center">
                <div className="mr-2 sm:mr-3 relative -ml-1 sm:-ml-2">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white text-purple-700 flex items-center justify-center font-extrabold border-2 border-white ring-2 ring-yellow-400" title={websiteInfo.name}>
                    {websiteInfo.logoUrl ? (
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src={websiteInfo.logoUrl} alt="Logo" className="w-full h-full object-contain p-1 rounded-full" />
                      </div>
                    ) : (
                      <span className="text-base sm:text-lg leading-none">{websiteInfo.name?.substring(0, 2).toUpperCase() || 'MB'}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-3xl md:text-4xl font-serif font-black leading-tight whitespace-nowrap">
                    {websiteInfo.name === 'Ma Baba Cloth Store' ? (
                      <>
                        <span className="text-yellow-400 drop-shadow-sm">Ma</span>
                        <span className="text-white"> </span>
                        <span className="text-white drop-shadow-sm">Baba</span>
                        <span className="inline text-white/80 text-base sm:text-2xl md:text-3xl font-semibold lowercase"> cloth store</span>
                      </>
                    ) : (
                      <span className="text-white drop-shadow-sm">{websiteInfo.name}</span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`px-3 py-2 md:px-4 md:py-2.5 rounded-md transition-colors text-sm md:text-base ${
                  pathname === item.href 
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
            
            {!loading && (
              session ? (
                <div className="relative ml-4">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600 focus:ring-white`}
                  >
                    <span className="sr-only">{t('openUserMenu')}</span>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-purple-600 font-semibold">
                      {(session.name?.[0] || session.email?.[0] || 'U').toUpperCase()}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      {!isAdmin && (
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7V7a7 7 0 00-7 7h-4a7 7 0 00-7 7v2a7 7 0 0014 0V11a7 7 0 00-7-7H7v2a7 7 0 0014 0z" />
                          </svg>
                          {t('yourProfile')}
                        </Link>
                      )}

                      {isAdmin && (
                        <Link 
                          href="/admin/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7V7a7 7 0 00-7 7h-4a7 7 0 00-7 7v2a7 7 0 0014 0V11a7 7 0 00-7-7H7v2a7 7 0 0014 0z" />
                          </svg>
                          Your Profile
                        </Link>
                      )}

                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('settings')}
                      </Link>

                      <Link 
                        href="/change-password" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {t('changePassword')}
                      </Link>


                      <button
                        type="button"
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                      
                    </div>
                  )}
                </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Login/Signup
                    </Link>
                  </div>
                )
              )}
          </div>
          
          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block fixed inset-0 bg-gradient-to-b from-purple-700 to-indigo-800 z-50' : 'hidden'} md:hidden`}>
            {/* Mobile header with back button */}
            <div className="flex items-center justify-between px-4 py-3 bg-purple-800 border-b border-purple-600">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center text-white p-2 rounded-full hover:bg-white/10"
                aria-label={t('closeMenu')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-white">{t('menu')}</h3>
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>
            <div className="px-6 pt-4 pb-8 space-y-3 h-[calc(100%-64px)] overflow-y-auto">
              <Link
                href="/home"
                className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('mobileHome')}
              </Link>

              <Link
                href="/about"
                className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('mobileAbout')}
              </Link>
              <Link
                href="/contact"
                className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('mobileContact')}
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('settings')}
              </Link>
              {(!loading && session) && (
                <Link
                  href="/messages"
                  className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('mobileMessages')}
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/admin/profile"
                  className="flex items-center px-5 py-3.5 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition-colors border-l-4 border-transparent hover:border-yellow-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('mobileAdminProfile')}
                </Link>
              )}
              
              {!loading && (
              session ? (
                  <div className="pt-4 pb-3 border-t border-white/20 mt-4">
                    <div className="flex items-center px-4">
                      <div className={`h-12 w-12 ${isAdmin ? 'rounded-md' : 'rounded-full'} bg-white flex items-center justify-center text-purple-600 font-semibold text-lg`}>
                        {session.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white truncate max-w-[200px]">
                          {session.name || session.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {!isAdmin && (
                        <Link
                          href="/profile"
                          className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('yourProfile')}
                        </Link>
                      )}

                      <Link
                        href="/change-password"
                        className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('changePassword')}
                      </Link>


                      <button
                        type="button"
                        className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        {t('logout')}
                      </button>
                      
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 pb-3 border-t border-white/20 mt-4 space-y-3">
                    <Link
                      href="/login"
                      className="block w-full px-4 py-3 text-center text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login/Signup
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-3 rounded-full ${isMenuOpen ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} focus:outline-none transition-colors`}
              aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}