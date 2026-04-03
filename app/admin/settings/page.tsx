'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Globe, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCcw,
  RotateCcw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'none' });

  // Add state to store existing contact info so it's not lost on save
  const [existingContactInfo, setExistingContactInfo] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getWebsiteInfo();
      if (res.success && res.websiteInfo) {
        setName(res.websiteInfo.name || '');
        setLogoUrl(res.websiteInfo.logoUrl || '');
        // Store existing contact info to avoid clearing it during update
        setExistingContactInfo({
          address: res.websiteInfo.address || '',
          phone: res.websiteInfo.phone || '',
          email: res.websiteInfo.email || '',
          businessHours: res.websiteInfo.businessHours || { weekdays: '', sunday: '' }
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ text: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('custom_token') || '';
      // Merge with existing contact info
      const res = await api.updateWebsiteInfo({ 
        name, 
        logoUrl, 
        ...existingContactInfo 
      }, token);
      if (res.success) {
        setMessage({ text: 'Branding updated successfully!', type: 'success' });
      }
    } catch (err) {
      console.error('Failed to update branding:', err);
      setMessage({ text: 'Failed to save branding', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: 'none' }), 3000);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('custom_token') || '';
      const res = await api.uploadWebsiteLogo(file, token);
      if (res.success && res.logoUrl) {
        setLogoUrl(res.logoUrl);
        setMessage({ text: 'Logo uploaded successfully!', type: 'success' });
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
      setMessage({ text: 'Logo upload failed', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage({ text: '', type: 'none' }), 3000);
    }
  };

  const handleResetLogo = () => {
    setLogoUrl('');
    setMessage({ text: 'Logo cleared (will revert to default after saving).', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: 'none' }), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading branding settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branding Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Customize your store's identity and visual presence.</p>
        </div>
        <button 
          onClick={fetchSettings}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
          title="Refresh Settings"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      {message.type !== 'none' && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 border mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSaveBranding} className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Website Name
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter store name"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-1">This name appears in the browser title and Navbar.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Website Logo
                </label>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 relative w-full">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Logo URL or path"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                      />
                      <label 
                        htmlFor="logo-upload"
                        className={`flex items-center justify-center px-8 py-4 rounded-2xl cursor-pointer font-bold transition-all w-full whitespace-nowrap ${
                          uploading 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                        }`}
                      >
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="flex items-center text-sm font-semibold text-red-600 hover:text-red-700 ml-1 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear and restore default
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transform transition-all active:scale-95 disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Branding
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">Live Identity Preview</h3>
            
            <div className="space-y-10">
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">Navbar Preview</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden p-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-blue-600 font-black text-sm">{name?.substring(0, 2).toUpperCase() || 'MA'}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {name || 'Ma Baba Cloth Store'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-[0.2em] w-full">Logo Snapshot</p>
                <div className="w-32 h-32 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 border border-gray-100 dark:border-gray-700 shadow-inner">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Large" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-200" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
