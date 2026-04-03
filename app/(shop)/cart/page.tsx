"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { motion } from "framer-motion";

export default function CartPage() {
  const { session, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-8 text-center border border-gray-100"
      >
        <div className="relative w-48 h-48 mx-auto mb-8">
          <Image
            src="/empty-cart.png"
            alt="Empty Cart"
            fill
            className="object-contain"
            priority
            unoptimized={true}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('missingCartItems')}
        </h1>
        
        <p className="text-gray-500 mb-8 max-w-[280px] mx-auto text-sm sm:text-base leading-relaxed">
          {!session 
            ? t('loginToSeeItems')
            : t('emptyCartMessage')
          }
        </p>

        <div className="space-y-3">
          {!session ? (
            <>
              <Link
                href="/login"
                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {t('login')}
              </Link>
              <Link
                href="/home"
                className="block w-full py-4 bg-white text-purple-600 font-semibold rounded-xl border border-purple-100 hover:bg-purple-50 transition-colors duration-200"
              >
                {t('shopNow')}
              </Link>
            </>
          ) : (
            <Link
              href="/home"
              className="block w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {t('shopNow')}
            </Link>
          )}
        </div>

        {!session && (
          <p className="mt-8 text-xs text-gray-400">
            Clicking login will take you to our secure authentication portal.
          </p>
        )}
      </motion.div>
    </div>
  );
}