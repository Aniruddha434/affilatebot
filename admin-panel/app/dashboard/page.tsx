'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import apiClient from '@/lib/api-client';
import { formatUptime, formatBytes, formatRelativeTime, isAuthenticated } from '@/lib/utils';
import type { BotStatus, BotStats, AnalyticsSummary, Deal } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch data with SWR
  const { data: status, mutate: mutateStatus } = useSWR<BotStatus>(
    '/admin/bot/status',
    () => apiClient.getBotStatus(),
    { refreshInterval: 5000 }
  );

  const { data: stats } = useSWR<BotStats>(
    '/admin/stats',
    () => apiClient.getStats(),
    { refreshInterval: 10000 }
  );

  const { data: analytics } = useSWR<AnalyticsSummary>(
    '/admin/analytics',
    () => apiClient.getAnalytics(7),
    { refreshInterval: 30000 }
  );

  const { data: recentDeals } = useSWR<{ items: Deal[] }>(
    '/admin/deals',
    () => apiClient.getDeals(5),
    { refreshInterval: 30000 }
  );

  const handleStartBot = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.startBot();
      setMessage('Bot started successfully!');
      mutateStatus();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to start bot');
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.stopBot();
      setMessage('Bot stopped successfully!');
      mutateStatus();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to stop bot');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerJob = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.triggerJob();
      setMessage('Job triggered successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to trigger job');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    router.push('/login');
  };

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🤖 Bot Dashboard</h1>
              <p className="text-sm text-gray-600">Amazon Affiliate Telegram Bot</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bot Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {status.is_running ? '🟢 Running' : '🔴 Stopped'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatUptime(status.uptime_seconds)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {status.posted_deals_total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatBytes(status.memory_usage.heapUsed)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/platforms')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">🛍️</div>
              <div className="font-semibold text-gray-900">Platform Management</div>
              <div className="text-sm text-gray-600 mt-1">Configure Amazon, Flipkart, Myntra</div>
            </button>
            <button
              onClick={() => router.push('/filters')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold text-gray-900">Advanced Filters</div>
              <div className="text-sm text-gray-600 mt-1">Keywords, prices, categories</div>
            </button>
            <button
              onClick={() => router.push('/logs')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-gray-900">View Logs</div>
              <div className="text-sm text-gray-600 mt-1">Monitor bot activity</div>
            </button>
            <button
              onClick={() => router.push('/keywords')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">🔑</div>
              <div className="font-semibold text-gray-900">Keywords</div>
              <div className="text-sm text-gray-600 mt-1">Manage search keywords</div>
            </button>
            <button
              onClick={() => router.push('/images')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-semibold text-gray-900">Image Management</div>
              <div className="text-sm text-gray-600 mt-1">Manage cached images</div>
            </button>
            <button
              onClick={() => router.push('/manual-post')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold text-gray-900">Manual Post</div>
              <div className="text-sm text-gray-600 mt-1">Post deals manually</div>
            </button>
          </div>
        </div>

        {/* Bot Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bot Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleStartBot}
              disabled={loading || status.is_running}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ▶️ Start Bot
            </button>
            <button
              onClick={handleStopBot}
              disabled={loading || !status.is_running}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⏸️ Stop Bot
            </button>
            <button
              onClick={handleTriggerJob}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🚀 Trigger Job Now
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Schedule: {status.cron_schedule}</p>
            <p>Channel: {status.channel}</p>
            <p>Min Discount: {status.min_discount}%</p>
          </div>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Deals Posted</p>
                <p className="text-xl font-bold text-gray-900">{analytics.total_deals_posted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deals Found</p>
                <p className="text-xl font-bold text-gray-900">{analytics.total_deals_found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-xl font-bold text-gray-900">{analytics.total_api_calls}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-gray-900">{analytics.success_rate}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Deals */}
        {recentDeals && recentDeals.items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deals</h2>
            <div className="space-y-3">
              {recentDeals.items.map((deal) => (
                <div key={deal.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">{deal.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="font-semibold text-green-600">{deal.discount_percentage}% OFF</span>
                    <span>{formatRelativeTime(deal.posted_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

