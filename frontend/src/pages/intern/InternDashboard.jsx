/**
 * =============================================================================
 * QUERY.IN - INTERN DASHBOARD
 * =============================================================================
 * Modern SaaS-style dashboard with clean cards and professional spacing.
 *
 * @module pages/intern/InternDashboard
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';

const InternDashboard = () => {
  const [stats, setStats] = useState({ activeQueries: 0, peerAnswers: 0, resolved: 0 });
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [queriesRes, faqsRes] = await Promise.all([
          api.get('/queries?limit=0'),
          api.get('/faqs'),
        ]);
        setStats({
          activeQueries: queriesRes.data.total || 0,
          peerAnswers: 0,
          resolved: 0,
        });
        setFaqs(faqsRes.data.data?.slice(0, 5) || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">Welcome back</h1>
            <p className="text-gray-500 mt-1">Manage your queries and help your peers</p>
          </div>
          <div className="flex gap-3">
            <a href="/intern/ask">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ask a Question
              </Button>
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Active Queries</div>
                <div className="text-3xl font-bold text-black">{stats.activeQueries}</div>
                <div className="text-sm text-gray-500 mt-1">Pending resolution</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Peer Responses</div>
                <div className="text-3xl font-bold text-black">{stats.peerAnswers}</div>
                <div className="text-sm text-gray-500 mt-1">Given to others</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Resolved</div>
                <div className="text-3xl font-bold text-black">{stats.resolved}</div>
                <div className="text-sm text-gray-500 mt-1">Successfully answered</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Popular FAQs */}
        <Card title="Popular FAQs" subtitle="Frequently accessed knowledge base articles" className="border border-gray-200 hover:shadow-lg transition-shadow" hover={false}>
          <div className="space-y-3">
            {faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No FAQs available yet</p>
              </div>
            ) : (
              faqs.map((faq, index) => (
                <a
                  key={faq._id}
                  href={`/intern/faqs?highlight=${faq._id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm border border-gray-800">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-black">{faq.clean_question}</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="/intern/faqs"
              className="text-sm font-semibold text-black inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              View all FAQs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black text-white hover:shadow-xl transition-shadow border-0" hover={false}>
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold mb-2">Have a question?</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Get instant answers from our AI or browse existing FAQs</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/intern/ask">
                <Button variant="highlight" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI
                </Button>
              </a>
              <a href="/intern/faqs">
                <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                  Browse FAQs
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;