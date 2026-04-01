'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';

// Sample data for gallery
const galleryItems = [
  {
    id: 1,
    title: 'Premium Cotton Collection',
    category: 'products',
    imageUrl: '/images/gallery/cotton-collection.jpg',
    description: 'Premium quality cotton fabrics for everyday comfort',
    price: 'Starting from ₹2,499'
  },
  {
    id: 2,
    title: 'Summer Fashion 2024',
    category: 'models',
    imageUrl: '/images/gallery/summer-fashion.jpg',
    description: 'Latest summer fashion trends and styles',
    price: 'New Arrivals'
  },
  {
    id: 3,
    title: 'Exclusive Designer Collection',
    category: 'collections',
    imageUrl: '/images/gallery/designer-collection.jpg',
    description: 'Limited edition designer pieces',
    price: 'Premium Collection'
  },
  {
    id: 4,
    title: 'Flash Sale - Up to 70% Off',
    category: 'offers',
    imageUrl: '/images/gallery/flash-sale.jpg',
    description: 'Limited time offer on selected items',
    price: 'Sale Prices'
  },
  {
    id: 5,
    title: 'Store Locations',
    category: 'store',
    imageUrl: '/images/gallery/store-locations.jpg',
    description: 'Visit our physical stores near you',
    price: 'Find Store'
  }
];

export default function GalleryPage() {
  const { session, loading } = useAuth();
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items by category
  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'products', name: 'Products', icon: '👕' },
    { id: 'models', name: 'Models', icon: '👗' },
    { id: 'collections', name: 'Collections', icon: '💎' },
    { id: 'offers', name: 'Offers', icon: '🏷️' },
    { id: 'store', name: 'Store', icon: '🏪' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  /* Removing the authentication guard to make the gallery public */
  // if (!session) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Login to View Gallery</h2>
  //         <p className="text-gray-600 dark:text-gray-300">You need to be logged in to access to gallery.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('gallery')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Explore our latest collections and fashion trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search gallery items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">{item.price}</span>
                      <span className="text-xs bg-white bg-purple-600 px-2 py-1 rounded">View Details</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    {categories.find(cat => cat.id === item.category)?.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{item.price}</span>
                  <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>&copy; 2024 Ma Baba Cloth Store. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
