'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ContactSettingsPage() {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [weekdays, setWeekdays] = useState('');
  const [sunday, setSunday] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'none' });

  // Add state to store existing branding info so it's not lost on save
  const [existingBrandingInfo, setExistingBrandingInfo] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getWebsiteInfo();
      if (res.success && res.websiteInfo) {
        setAddress(res.websiteInfo.address || '');
        setPhone(res.websiteInfo.phone || '');
        setEmail(res.websiteInfo.email || '');
        setWeekdays(res.websiteInfo.businessHours?.weekdays || '');
        setSunday(res.websiteInfo.businessHours?.sunday || '');
        // Store existing branding info to avoid clearing it during update
        setExistingBrandingInfo({
          name: res.websiteInfo.name || '',
          logoUrl: res.websiteInfo.logoUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ text: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('custom_token') || '';
      // Merge with existing branding info
      const res = await api.updateWebsiteInfo({ 
        ...existingBrandingInfo,
        address, 
        phone, 
        email, 
        businessHours: { weekdays, sunday } 
      }, token);
      if (res.success) {
        setMessage({ text: 'Contact details updated successfully!', type: 'success' });
      }
    } catch (err) {
      console.error('Failed to update contact settings:', err);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: 'none' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading contact settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Business Details</h1>
          <p className="text-gray-500 mt-1 text-sm">Update your store location, contact methods, and operating hours.</p>
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

      <form onSubmit={handleSaveContact} className="space-y-8">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Contact Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Communication
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Office Address
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-8 h-full">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Opening Schedule
            </h3>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
                  Monday to Saturday
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <input
                    type="text"
                    value={weekdays}
                    onChange={(e) => setWeekdays(e.target.value)}
                    placeholder="e.g., 9:00 AM - 9:00 PM"
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wider">
                  Sunday
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type="text"
                    value={sunday}
                    onChange={(e) => setSunday(e.target.value)}
                    placeholder="e.g., Closed or 10:00 AM - 5:00 PM"
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center px-12 py-5 bg-black text-white font-bold rounded-2xl shadow-2xl hover:bg-gray-900 transform transition-all active:scale-95 disabled:opacity-70 text-lg"
          >
            {saving ? (
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
            ) : (
              <Save className="h-6 w-6 mr-3" />
            )}
            Save Contact Details
          </button>
        </div>
      </form>
    </div>
  );
}
