'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import apiClient, { isAuthenticated } from '@/lib/api-client';

interface PlatformSettings {
  id: number;
  platform: string;
  enabled: boolean;
  priority: number;
  posting_ratio: number;
  min_discount: number;
  keywords_include: string[];
  keywords_exclude: string[];
  price_min: number | null;
  price_max: number | null;
  categories: string[];
}

interface PlatformStats {
  platform: string;
  enabled: boolean;
  ready: boolean;
  priority: number;
  postingRatio: number;
}

export default function PlatformsPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch platform data
  const { data, mutate } = useSWR<{ platforms: PlatformSettings[]; stats: { platforms: Record<string, PlatformStats> } }>(
    '/admin/platforms',
    () => apiClient.getPlatforms(),
    { refreshInterval: 10000 }
  );

  const handleTogglePlatform = async (platform: string, enabled: boolean) => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.togglePlatform(platform, enabled);
      setMessage(`${platform} ${enabled ? 'enabled' : 'disabled'} successfully!`);
      mutate();
    } catch (error: any) {
      setMessage(error.response?.data?.error || `Failed to toggle ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRatio = async (platform: string, ratio: number) => {
    try {
      await apiClient.updatePlatformSettings(platform, { posting_ratio: ratio });
      mutate();
    } catch (error) {
      console.error('Failed to update ratio', error);
    }
  };

  const handleUpdatePriority = async (platform: string, priority: number) => {
    try {
      await apiClient.updatePlatformSettings(platform, { priority });
      mutate();
    } catch (error) {
      console.error('Failed to update priority', error);
    }
  };

  const handleUpdateMinDiscount = async (platform: string, minDiscount: number) => {
    try {
      await apiClient.updatePlatformSettings(platform, { min_discount: minDiscount });
      mutate();
    } catch (error) {
      console.error('Failed to update min discount', error);
    }
  };

  const handleTriggerPlatform = async (platform: string) => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.triggerPlatformJob(platform);
      setMessage(`Job triggered for ${platform}!`);
    } catch (error: any) {
      setMessage(error.response?.data?.error || `Failed to trigger ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading platforms...</p>
        </div>
      </div>
    );
  }

  const platformEmojis: Record<string, string> = {
    amazon: '📦',
    flipkart: '🛒',
    myntra: '👗'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure and manage e-commerce platforms
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Failed') || message.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.platforms.map((platform) => {
            const stats = data.stats.platforms[platform.platform];
            const emoji = platformEmojis[platform.platform] || '🛍️';
            const platformName = platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1);

            return (
              <div key={platform.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{platformName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${platform.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {platform.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {stats?.ready && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleTogglePlatform(platform.platform, !platform.enabled)}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${platform.enabled ? 'bg-indigo-600' : 'bg-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${platform.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority: {platform.priority}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={platform.priority}
                      onChange={(e) => handleUpdatePriority(platform.platform, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>High</span>
                      <span>Low</span>
                    </div>
                  </div>

                  {/* Posting Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posting Ratio: {platform.posting_ratio}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={platform.posting_ratio}
                      onChange={(e) => handleUpdateRatio(platform.platform, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Min Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Discount: {platform.min_discount}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={platform.min_discount}
                      onChange={(e) => handleUpdateMinDiscount(platform.platform, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Trigger Button */}
                  <button
                    onClick={() => handleTriggerPlatform(platform.platform)}
                    disabled={loading || !platform.enabled}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Trigger Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

