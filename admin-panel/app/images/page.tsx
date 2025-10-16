'use client';

import { useState } from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { formatBytes } from '@/lib/utils';

export default function ImagesPage() {
  const { data: stats, error, mutate } = useSWR('/admin/images/stats', () => apiClient.getImageStats());
  const [testUrl, setTestUrl] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleValidate = async () => {
    if (!testUrl) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await apiClient.validateImageUrl(testUrl);
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({ valid: false, error: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the entire image cache?')) {
      return;
    }
    
    setIsClearing(true);
    
    try {
      await apiClient.clearImageCache();
      mutate();
      alert('Image cache cleared successfully!');
    } catch (error: any) {
      alert(`Failed to clear cache: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to load image statistics
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading image statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🖼️ Image Management</h1>
        <p className="mt-2 text-gray-600">
          Manage cached product images and validate image URLs
        </p>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
            </div>
            <div className="text-4xl">📸</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Size</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSizeMB} MB</p>
            </div>
            <div className="text-4xl">💾</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Max Cache Size</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maxCacheSizeMB} MB</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usage</p>
              <p className="text-2xl font-bold text-gray-900">{stats.usagePercent}%</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Clear all cached images to free up space. Images will be re-downloaded when needed.
              </p>
              <p className="text-xs text-gray-500">
                Current cache: {stats.totalImages} images ({stats.totalSizeMB} MB)
              </p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={isClearing || stats.totalImages === 0}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </button>
          </div>
        </div>
      </div>

      {/* Image URL Validator */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Image URL Validator</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleValidate}
                  disabled={isValidating || !testUrl}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </div>

            {validationResult && (
              <div className={`p-4 rounded-lg ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{validationResult.valid ? '✅' : '❌'}</span>
                  <div>
                    <p className={`font-medium ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult.valid ? 'Valid Image URL' : 'Invalid Image URL'}
                    </p>
                    {validationResult.error && (
                      <p className="text-sm text-red-600 mt-1">{validationResult.error}</p>
                    )}
                  </div>
                </div>
                {validationResult.valid && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={apiClient.getImageProxyUrl(testUrl)}
                      alt="Preview"
                      className="max-w-md rounded-lg border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ How Image Caching Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Product images are automatically cached when first accessed</li>
          <li>• Cached images are served instantly without re-downloading</li>
          <li>• Cache is automatically cleaned up after 7 days of inactivity</li>
          <li>• Maximum cache size: {stats.maxCacheSizeMB} MB</li>
          <li>• Supported formats: JPEG, PNG, WebP, GIF</li>
          <li>• Maximum image size: 5 MB per image</li>
        </ul>
      </div>
    </div>
  );
}

