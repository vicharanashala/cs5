/**
 * =============================================================================
 * QUERY.IN - INTERN DASHBOARD
 * =============================================================================
 * Modern SaaS-style dashboard with clean cards and professional spacing.
 * Dynamic: Updates automatically when peer responses or queries change.
 *
 * @module pages/intern/InternDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import RollingCounter from '../../components/RollingCounter';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const InternDashboard = () => {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const [stats, setStats] = useState({ activeQueries: 0, peerResponses: 0, resolved: 0 });
  const [faqs, setFaqs] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, faqsRes] = await Promise.all([
        api.get('/peer/stats'),
        api.get('/faqs'),
      ]);
      setStats({
        activeQueries: statsRes.data.data.activeQueries || 0,
        peerResponses: statsRes.data.data.peerResponses || 0,
        resolved: statsRes.data.data.resolved || 0,
      });
      setFaqs(faqsRes.data.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPeerAnswer = (data) => {
      if (data.intern_id === user?.id || data.intern_id === user?.userId) {
        fetchData();
      }
    };

    const handleQueryResolved = (data) => {
      if (data.intern_id === user?.id || data.intern_id === user?.userId) {
        fetchData();
      }
    };

    const handleNewNotification = () => {
      fetchData();
    };

    socket.on('new_peer_answer', handleNewPeerAnswer);
    socket.on('query_resolved', handleQueryResolved);
    socket.on('new_notification', handleNewNotification);
    socket.on('faq_updated', fetchData);
    socket.on('faq_deleted', fetchData);

    return () => {
      socket.off('new_peer_answer', handleNewPeerAnswer);
      socket.off('query_resolved', handleQueryResolved);
      socket.off('new_notification', handleNewNotification);
      socket.off('faq_updated', fetchData);
      socket.off('faq_deleted', fetchData);
    };
  }, [socket, user, fetchData]);

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
            <Link to="/intern/ask">
              <Button variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ask a Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link to="/intern/my-queries">
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Active Queries</div>
                  <div className="text-3xl font-bold text-black">
                    <RollingCounter value={stats.activeQueries} duration={1200} rollDigitDuration={600} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Pending resolution</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow" hover={false}>
            <div className="flex items-start justify-between">
              <div>
<div className="text-sm font-medium text-gray-500 mb-1">Peer Responses</div>
                  <div className="text-3xl font-bold text-black">
                    <RollingCounter value={stats.peerResponses} duration={1200} rollDigitDuration={600} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Given to others</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Link to="/intern/my-queries">
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Resolved</div>
                  <div className="text-3xl font-bold text-black">
                    <RollingCounter value={stats.resolved} duration={1200} rollDigitDuration={600} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Successfully answered</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
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
            <Link
              to="/intern/faqs"
              className="text-sm font-semibold text-black inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              View all FAQs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black text-white hover:shadow-xl transition-shadow border-0" hover={false}>
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold mb-2">Have a question?</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Get instant answers from our AI or browse existing FAQs</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/intern/ask">
                <Button variant="primary" size="lg" className="hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI
                </Button>
              </Link>
              <Link to="/intern/faqs">
                <Button variant="secondary" size="lg" className="hover:scale-105 transition-transform duration-200">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;