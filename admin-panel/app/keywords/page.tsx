'use client';

import { useState } from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/api-client';

interface Keyword {
  id: number;
  keyword: string;
  platform?: string;
  created_at: string;
  usage_count?: number;
}

export default function KeywordsPage() {
  const { data: keywords, error, mutate } = useSWR<Keyword[]>('/admin/keywords', () => apiClient.getKeywords());
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyword.trim()) return;
    
    setIsAdding(true);
    
    try {
      await apiClient.addKeyword(
        newKeyword.trim(),
        selectedPlatform === 'all' ? undefined : selectedPlatform
      );
      setNewKeyword('');
      setSelectedPlatform('all');
      mutate();
    } catch (error: any) {
      alert(`Failed to add keyword: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKeyword = async (id: number, keyword: string) => {
    if (!confirm(`Are you sure you want to delete the keyword "${keyword}"?`)) {
      return;
    }
    
    try {
      await apiClient.deleteKeyword(id);
      mutate();
    } catch (error: any) {
      alert(`Failed to delete keyword: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to load keywords
        </div>
      </div>
    );
  }

  if (!keywords) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading keywords...</p>
        </div>
      </div>
    );
  }

  const platformCounts = {
    all: keywords.length,
    amazon: keywords.filter(k => k.platform === 'amazon').length,
    flipkart: keywords.filter(k => k.platform === 'flipkart').length,
    myntra: keywords.filter(k => k.platform === 'myntra').length,
    global: keywords.filter(k => !k.platform).length
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🔑 Keyword Management</h1>
        <p className="mt-2 text-gray-600">
          Manage search keywords for product discovery across platforms
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Keywords</p>
          <p className="text-2xl font-bold text-gray-900">{platformCounts.all}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-600">Amazon</p>
          <p className="text-2xl font-bold text-orange-900">{platformCounts.amazon}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600">Flipkart</p>
          <p className="text-2xl font-bold text-blue-900">{platformCounts.flipkart}</p>
        </div>
        <div className="bg-pink-50 rounded-lg shadow p-4">
          <p className="text-sm text-pink-600">Myntra</p>
          <p className="text-2xl font-bold text-pink-900">{platformCounts.myntra}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-600">Global</p>
          <p className="text-2xl font-bold text-purple-900">{platformCounts.global}</p>
        </div>
      </div>

      {/* Add Keyword Form */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Keyword</h2>
        </div>
        <form onSubmit={handleAddKeyword} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keyword
              </label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., laptop, smartphone, headphones"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Platforms</option>
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="myntra">Myntra</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={isAdding || !newKeyword.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAdding ? 'Adding...' : '+ Add Keyword'}
            </button>
          </div>
        </form>
      </div>

      {/* Keywords List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Active Keywords ({keywords.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {keywords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No keywords configured. Add your first keyword above.
            </div>
          ) : (
            keywords.map((keyword) => (
              <div key={keyword.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-gray-900">
                        {keyword.keyword}
                      </span>
                      {keyword.platform ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          keyword.platform === 'amazon'
                            ? 'bg-orange-100 text-orange-800'
                            : keyword.platform === 'flipkart'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {keyword.platform.toUpperCase()}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                          GLOBAL
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>Added: {new Date(keyword.created_at).toLocaleDateString()}</span>
                      {keyword.usage_count !== undefined && (
                        <span>Used: {keyword.usage_count} times</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id, keyword.keyword)}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ How Keywords Work</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Global keywords</strong> are used across all enabled platforms</li>
          <li>• <strong>Platform-specific keywords</strong> are only used for that platform</li>
          <li>• Keywords are used to search for products during automated job runs</li>
          <li>• Multiple keywords increase product discovery diversity</li>
          <li>• Use specific keywords for better targeting (e.g., "gaming laptop" vs "laptop")</li>
        </ul>
      </div>
    </div>
  );
}

