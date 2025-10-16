'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import apiClient, { isAuthenticated } from '@/lib/api-client';

interface PlatformSettings {
  id: number;
  platform: string;
  enabled: boolean;
  keywords_include: string[];
  keywords_exclude: string[];
  price_min: number | null;
  price_max: number | null;
  categories: string[];
  min_discount: number;
}

export default function FiltersPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch platform data
  const { data, mutate } = useSWR<{ platforms: PlatformSettings[] }>(
    '/admin/platforms',
    () => apiClient.getPlatforms(),
    { refreshInterval: 30000 }
  );

  const currentPlatform = data?.platforms.find(p => p.platform === selectedPlatform);

  const handleUpdateFilters = async (updates: Partial<PlatformSettings>) => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.updatePlatformSettings(selectedPlatform, updates);
      setMessage('Filters updated successfully!');
      mutate();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update filters');
    } finally {
      setLoading(false);
    }
  };

  if (!data || !currentPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Filters</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure filtering rules for each platform
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Platform Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {data.platforms.map((platform) => (
              <option key={platform.platform} value={platform.platform}>
                {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Discount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Discount: {currentPlatform.min_discount}%
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={currentPlatform.min_discount}
              onChange={(e) => handleUpdateFilters({ min_discount: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                value={currentPlatform.price_min || ''}
                onChange={(e) => handleUpdateFilters({ price_min: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={currentPlatform.price_max || ''}
                onChange={(e) => handleUpdateFilters({ price_max: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Keywords Include */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={currentPlatform.keywords_include.join(', ')}
              onChange={(e) => handleUpdateFilters({ keywords_include: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
              placeholder="e.g., electronics, smartphone, laptop"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Products must contain at least one of these keywords</p>
          </div>

          {/* Keywords Exclude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclude Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={currentPlatform.keywords_exclude.join(', ')}
              onChange={(e) => handleUpdateFilters({ keywords_exclude: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
              placeholder="e.g., refurbished, used, damaged"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Products containing these keywords will be excluded</p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories (comma-separated)
            </label>
            <input
              type="text"
              value={currentPlatform.categories.join(', ')}
              onChange={(e) => handleUpdateFilters({ categories: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
              placeholder="e.g., Electronics, Fashion, Home"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to allow all categories</p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Filter Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Filters are applied in real-time when products are fetched</li>
              <li>• Use include keywords to focus on specific product types</li>
              <li>• Use exclude keywords to avoid unwanted products</li>
              <li>• Price filters help target specific price ranges</li>
            </ul>
          </div>
        </div>

        {/* Back Button */}
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

