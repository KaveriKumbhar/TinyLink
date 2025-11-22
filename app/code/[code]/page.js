'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code;
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  useEffect(() => {
    if (code) {
      fetchLink();

      // Auto-refresh every 3 seconds to update click counts
      const interval = setInterval(() => {
        fetchLink();
      }, 3000);

      // Refresh when window regains focus
      const handleFocus = () => {
        fetchLink();
      };
      window.addEventListener('focus', handleFocus);

      // Cleanup
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [code]);

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link not found');
        } else {
          setError('Failed to load link');
        }
        return;
      }
      const data = await response.json();
      setLink(data);
    } catch (error) {
      console.error('Error fetching link:', error);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{error || 'Link not found'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${baseUrl}/${link.code}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Link Statistics</h1>
              <p className="text-gray-600 mt-1">Detailed analytics for your short link</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Link Details</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Short Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
                  {link.code}
                </code>
                <button
                  onClick={() => copyToClipboard(link.code)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  title="Copy code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Short URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short URL
              </label>
              <div className="flex items-center gap-2">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-primary-600 hover:text-primary-700 break-all"
                >
                  {shortUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  title="Copy URL"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URL
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md break-all">
                <a
                  href={link.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {link.target_url}
                </a>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {link.click_count || 0}
                </div>
                <div className="text-sm text-gray-600">Total Clicks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Last Clicked
                </div>
                <div className="text-lg text-gray-900">
                  {formatDate(link.last_clicked_at)}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Created
                </div>
                <div className="text-lg text-gray-900">
                  {formatDate(link.created_at)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Test Redirect
              </a>
              <Link
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

