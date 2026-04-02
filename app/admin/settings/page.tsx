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
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [weekdays, setWeekdays] = useState('');
  const [sunday, setSunday] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'none' });

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
        setAddress(res.websiteInfo.address || '');
        setPhone(res.websiteInfo.phone || '');
        setEmail(res.websiteInfo.email || '');
        setWeekdays(res.websiteInfo.businessHours?.weekdays || '');
        setSunday(res.websiteInfo.businessHours?.sunday || '');
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ text: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('custom_token') || '';
      const res = await api.updateWebsiteInfo({ 
        name, 
        logoUrl, 
        address, 
        phone, 
        email, 
        businessHours: { weekdays, sunday } 
      }, token);
      if (res.success) {
        setMessage({ text: 'Settings updated successfully!', type: 'success' });
        // Optional: trigger a header refresh or page reload
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setMessage({ text: 'Failed to save settings', type: 'error' });
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Website Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize your store identity, brand name, and logo.
          </p>
        </div>
        <button 
          onClick={fetchSettings}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {message.type !== 'none' && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Website Name
                </label>
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter store name"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">This name appears in the browser title and Navbar.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Website Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative group">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Logo URL or uploaded path"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
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
                      className={`flex items-center px-6 py-3 rounded-xl cursor-pointer font-semibold transition-all ${
                        uploading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload
                        </>
                      )}
                    </label>
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="flex items-center px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-semibold transition-all"
                      title="Clear custom logo and use default name-based logo"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Restore Original
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Office Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full office address"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Monday - Saturday
                    </label>
                    <input
                      type="text"
                      value={weekdays}
                      onChange={(e) => setWeekdays(e.target.value)}
                      placeholder="9:00 AM - 9:00 PM"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Sunday
                    </label>
                    <input
                      type="text"
                      value={sunday}
                      onChange={(e) => setSunday(e.target.value)}
                      placeholder="10:00 AM - 8:00 PM"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 transition-all duration-200"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 uppercase tracking-wider">
              Identity Preview
            </h3>
            
            <div className="space-y-8">
              {/* Navbar Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-medium text-gray-500 mb-4">Navbar Preview</p>
                <div className="flex items-center space-x-3 h-12">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-blue-600 font-bold text-xs">{name?.substring(0, 2).toUpperCase() || 'LOGO'}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {name || 'Store Name'}
                  </span>
                </div>
              </div>

              {/* Favicon/App Preview */}
              <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-500 mb-4">Logo Snapshot</p>
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 group relative">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Large" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
