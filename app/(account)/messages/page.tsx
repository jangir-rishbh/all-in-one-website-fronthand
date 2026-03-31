'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  status: string;
  replies?: {
    id: string;
    admin_reply: string;
    created_at: string;
  }[];
}

export default function MessagesPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session) {
      fetchMessages();
    }
  }, [session]);

  const authHeaders = (): HeadersInit => {
    try {
      const token = localStorage.getItem('custom_token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        cache: 'no-store',
        headers: authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error('Error fetching messages:', data?.error || response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        alert(
          typeof data?.error === 'string'
            ? data.error
            : 'Failed to send message'
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
          <p className="mt-2 text-sm text-gray-600">Send us a message and view your message history</p>
        </div>

        {/* Send Message Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Send a Message</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 text-gray-900"
                placeholder="Type your message here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Messages List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Messages</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Send your first message above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Status: <span className={`font-medium ${
                            message.status === 'new' ? 'text-blue-600' :
                            message.status === 'in_progress' ? 'text-yellow-600' :
                            message.status === 'resolved' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1).replace('_', ' ')}
                          </span>
                          {message.is_read && <span className="ml-2 text-green-600">✓ Read</span>}
                        </p>
                      </div>
                    </div>
                    
                    {/* User's Message */}
                    <div className="mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Your Message:</div>
                        <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>

                    {/* Admin Replies */}
                    {message.replies && message.replies.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700">Admin Replies:</div>
                        {message.replies.map((reply, index) => (
                          <div key={reply.id} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-sm font-medium text-blue-800">Reply {index + 1}</div>
                              <div className="text-xs text-blue-600">
                                {new Date(reply.created_at).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-blue-900 whitespace-pre-wrap">{reply.admin_reply}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
