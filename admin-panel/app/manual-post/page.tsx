'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';

export default function ManualPostPage() {
  const [formData, setFormData] = useState({
    platform: 'amazon',
    productId: '',
    title: '',
    currentPrice: '',
    originalPrice: '',
    discountPercentage: '',
    imageUrl: '',
    productUrl: '',
    category: '',
    brand: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate discount percentage
    if (name === 'currentPrice' || name === 'originalPrice') {
      const current = name === 'currentPrice' ? parseFloat(value) : parseFloat(formData.currentPrice);
      const original = name === 'originalPrice' ? parseFloat(value) : parseFloat(formData.originalPrice);
      
      if (current && original && original > current) {
        const discount = Math.round(((original - current) / original) * 100);
        setFormData(prev => ({ ...prev, discountPercentage: discount.toString() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const product = {
        platform: formData.platform,
        productId: formData.productId,
        title: formData.title,
        currentPrice: parseFloat(formData.currentPrice),
        originalPrice: parseFloat(formData.originalPrice),
        discountPercentage: parseInt(formData.discountPercentage),
        imageUrl: formData.imageUrl,
        productUrl: formData.productUrl,
        category: formData.category || undefined,
        brand: formData.brand || undefined
      };

      const response = await apiClient.postManualDeal(product);
      setResult({ success: true, message: 'Product posted successfully!', data: response });
      
      // Reset form
      setFormData({
        platform: 'amazon',
        productId: '',
        title: '',
        currentPrice: '',
        originalPrice: '',
        discountPercentage: '',
        imageUrl: '',
        productUrl: '',
        category: '',
        brand: ''
      });
    } catch (error: any) {
      setResult({ success: false, message: error.response?.data?.error || 'Failed to post product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📝 Manual Product Posting</h1>
        <p className="mt-2 text-gray-600">
          Manually post a product deal to your Telegram channel
        </p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform *
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="myntra">Myntra</option>
              </select>
            </div>

            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID / ASIN *
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                placeholder="e.g., B08N5WRWNW"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <textarea
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Enter product title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price (₹) *
                </label>
                <input
                  type="number"
                  name="currentPrice"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="1999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  placeholder="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {/* URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product URL *
              </label>
              <input
                type="url"
                name="productUrl"
                value={formData.productUrl}
                onChange={handleChange}
                required
                placeholder="https://www.amazon.in/dp/B08N5WRWNW"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Electronics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Samsung"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Result Message */}
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅' : '❌'} {result.message}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Post to Telegram'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

