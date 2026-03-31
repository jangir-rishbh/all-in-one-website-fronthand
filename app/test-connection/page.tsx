'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function TestConnection() {
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test both endpoints
      const homeResponse = await api.getHome();
      const testResponse = await api.testConnection();
      
      setBackendStatus(testResponse.message);
      console.log('Backend Home Response:', homeResponse);
      console.log('Backend Test Response:', testResponse);
    } catch (err) {
      setError('Backend se connect nahi ho paaya: ' + (err as Error).message);
      console.error('Connection Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Backend Connection Test</h1>
        
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Backend se connect kar rahe hai...</p>
          </div>
        )}

        {!loading && backendStatus && (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <p className="text-green-600 font-semibold">{backendStatus}</p>
            <button 
              onClick={testBackendConnection}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Again
            </button>
          </div>
        )}

        {!loading && error && (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={testBackendConnection}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Try Again
            </button>
            <div className="mt-4 text-sm text-gray-600 text-left">
              <p className="font-semibold">Solution:</p>
              <p>1. Backend server start karo: <code className="bg-gray-100 px-1">uvicorn main:app --reload</code></p>
              <p>2. Port 8000 free karo</p>
              <p>3. .env.local mein add karo: <code className="bg-gray-100 px-1">NEXT_PUBLIC_API_URL=http://localhost:8000</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
