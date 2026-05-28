/**
 * =============================================================================
 * QUERY.IN - INTERN DASHBOARD INDEX
 * =============================================================================
 * Entry point for /intern route. Shows intern's personal query management.
 *
 * @module pages/intern/InternDashboard
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const navItems = [
  {
    path: '/intern',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/intern/announcements',
    label: 'Announcements',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    path: '/intern/faqs',
    label: 'View FAQs',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    path: '/intern/ask',
    label: 'Ask AI',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
  {
    path: '/intern/my-queries',
    label: 'My Escalations',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    path: '/intern/peer-queue',
    label: 'Peer Answer Queue',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
];

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
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Intern Dashboard</h1>
          <p className="text-text-secondary mt-1">Ask questions, track escalations, and help peers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-black">
            <Badge variant="outline" className="mb-3">Active</Badge>
            <div className="text-3xl font-bold text-black">{stats.activeQueries}</div>
            <div className="text-sm text-text-secondary mt-1">My Escalations</div>
          </Card>
          <Card className="border border-black">
            <Badge variant="filled" className="mb-3">Peer</Badge>
            <div className="text-3xl font-bold text-black">{stats.peerAnswers}</div>
            <div className="text-sm text-text-secondary mt-1">Peer Responses Given</div>
          </Card>
          <Card className="border border-black">
            <Badge variant="verified" className="mb-3">Resolved</Badge>
            <div className="text-3xl font-bold text-black">{stats.resolved}</div>
            <div className="text-sm text-text-secondary mt-1">Resolved</div>
          </Card>
        </div>

        <Card className="border border-black">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Popular FAQs</h2>
            <a href="/intern/faqs" className="text-sm text-text-secondary hover:text-black underline">View All</a>
          </div>
          <div className="space-y-3">
            {faqs.length === 0 ? (
              <p className="text-text-muted text-sm">No FAQs available</p>
            ) : (
              faqs.map((faq) => (
                <div key={faq._id} className="p-3 border border-border-subtle hover:border-black transition-all rounded-sm">
                  <div className="font-medium text-black text-sm">{faq.clean_question}</div>
                  <div className="text-xs text-text-muted mt-1">{faq.category}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-2 border-black border-dashed hover:border-solid transition-all">
          <div className="text-center py-4">
            <div className="font-medium text-black mb-2">Have a question?</div>
            <p className="text-sm text-text-muted mb-4">Ask our AI or browse existing FAQs</p>
            <div className="flex gap-3 justify-center">
              <a href="/intern/ask">
                <button className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all">
                  Ask AI
                </button>
              </a>
              <a href="/intern/faqs">
                <button className="px-6 py-2 border border-black text-black text-sm font-medium hover:bg-gray-100 transition-all">
                  Browse FAQs
                </button>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;