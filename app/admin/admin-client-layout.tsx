'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Package, 
  MessageSquare, 
  Settings, 
  LogOut,
  TrendingUp,
  Bell,
  User
} from 'lucide-react';

interface AdminClientLayoutProps {
  children: ReactNode;
  navItems: {
    href: string;
    label: string;
  }[];
  user: {
    id: string;
    email: string;
    name?: string | null;
    mobile?: string | null;
    gender?: string | null;
    state?: string | null;
    role: 'admin' | 'user';
    two_factor_enabled?: boolean;
  };
}

export default function AdminClientLayout({ children, navItems, user }: AdminClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [websiteName, setWebsiteName] = useState('Admin Panel');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    api.getWebsiteInfo()
      .then((res) => {
        if (res.success && res.websiteInfo?.name) {
          setWebsiteName(res.websiteInfo.name);
        }
      })
      .catch(() => {/* keep default */});
  }, []);

  // Auto-close mobile sidebar when clicking outside
  const handleOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  // Navigation icons with enhanced designs
  const getNavIcon = (label: string) => {
    switch (label) {
      case 'Dashboard': return <Home className="h-5 w-5" />;
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Products': return <Package className="h-5 w-5" />;
      case 'Massage': return <MessageSquare className="h-5 w-5" />;
      case 'Settings': return <Settings className="h-5 w-5" />;
      default: return <Home className="h-5 w-5" />;
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      try {
        localStorage.removeItem('custom_user');
      } catch {}
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{websiteName}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative active:scale-95">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              >
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in-up">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Settings
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Sidebar Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <h2 className="font-bold text-lg lg:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {websiteName}
              </h2>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap gap-2 lg:gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-4 py-2.5 lg:px-6 lg:py-3 rounded-xl transition-all duration-200
                  ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }
                `}
              >
                <span className={`
                  flex-shrink-0 transition-transform duration-200 group-hover:scale-110 mr-2
                  ${pathname === item.href ? 'text-white' : 'text-gray-500 dark:text-gray-400'}
                  h-5 w-5
                `}>
                  {getNavIcon(item.label)}
                </span>
                <span className="font-medium text-sm lg:text-base whitespace-nowrap">
                  {item.label}
                </span>
                {pathname === item.href && (
                  <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-0 min-h-screen">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{websiteName}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}