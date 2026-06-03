/**
 * =============================================================================
 * QUERY.IN - ADMIN ANALYTICS PAGE
 * =============================================================================
 * Displays AI performance comparison, bottleneck identification, and human
 * intervention index with interactive charts.
 *
 * Charts:
 * - AI Performance: Bar chart comparing RAG vs LLM helpfulness
 * - Bottleneck Analysis: Pie chart of pending vs resolved
 * - Human Intervention: Bar chart of interventions vs peer resolutions
 * - Resolution Distribution: Pie chart of all resolution types
 * - Daily Trends: Line chart showing trends over 14 days
 *
 * @module pages/admin/AdminAnalytics
 */

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = {
  primary: '#000000',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  highlight: '#FFD000',
  rag: '#3B82F6',
  llm: '#8B5CF6',
  peer: '#10B981',
  admin: '#F59E0B',
  moderator: '#6366F1',
};

const CHART_HEIGHT = 280;
const SMALL_CHART_HEIGHT = 220;
const TREND_CHART_HEIGHT = 300;

const AdminAnalytics = () => {
  const { socket } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setAnalytics(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!socket) return;

    socket.on('query_state_changed', fetchAnalytics);
    socket.on('users_updated', fetchAnalytics);

    return () => {
      socket.off('query_state_changed', fetchAnalytics);
      socket.off('users_updated', fetchAnalytics);
    };
  }, [socket, fetchAnalytics]);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium text-gray-500">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium text-red-500">{error || 'No data available'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const isSmallScreen = containerWidth < 768;
  const isMediumScreen = containerWidth >= 768 && containerWidth < 1024;

  const aiPerformanceData = [
    { name: 'RAG', Upvotes: analytics.aiPerformance.ragUpvotes, Downvotes: analytics.aiPerformance.ragDownvotes, Helpfulness: analytics.aiPerformance.ragHelpfulness },
    { name: 'LLM', Upvotes: analytics.aiPerformance.llmUpvotes, Downvotes: analytics.aiPerformance.llmDownvotes, Helpfulness: analytics.aiPerformance.llmHelpfulness },
  ];

  const bottleneckData = [
    { name: 'Pending', value: analytics.bottleneckAnalysis.pendingCount, color: COLORS.warning },
    { name: 'Resolved', value: analytics.bottleneckAnalysis.resolvedCount, color: COLORS.success },
  ];

  const humanInterventionData = [
    { name: 'Admin Overrides', count: analytics.humanIntervention.adminOverrideCount, color: COLORS.admin },
    { name: 'Mod Overrides', count: analytics.humanIntervention.moderatorOverrideCount, color: COLORS.moderator },
  ];

  const peerPerformanceData = [
    { name: 'Admin Approved', count: analytics.peerPerformance.peerApprovedAdmin, color: COLORS.admin },
    { name: 'Mod Approved', count: analytics.peerPerformance.peerApprovedModerator, color: COLORS.moderator },
  ];

  const resolutionDistributionData = [
    { name: 'Auto-Complete', value: analytics.resolutionDistribution.autoComplete, color: COLORS.rag },
    { name: 'RAG Resolved', value: analytics.resolutionDistribution.ragResolved, color: COLORS.rag },
    { name: 'LLM Resolved', value: analytics.resolutionDistribution.llmResolved, color: COLORS.llm },
    { name: 'Peer (Admin)', value: analytics.resolutionDistribution.peerAnsweredAdmin, color: COLORS.admin },
    { name: 'Peer (Mod)', value: analytics.resolutionDistribution.peerAnsweredModerator, color: COLORS.moderator },
    { name: 'Admin Override', value: analytics.resolutionDistribution.adminOverride, color: COLORS.admin },
    { name: 'Mod Override', value: analytics.resolutionDistribution.moderatorOverride, color: COLORS.moderator },
  ].filter(d => d.value > 0);

  const dailyTrendsData = analytics.dailyTrends.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Auto-Complete': d.auto_complete,
    'RAG': d.rag_resolved,
    'LLM': d.llm_resolved,
    'Escalated': d.escalated,
    'Peer Approved': d.peer_approved,
    'Admin': d.admin_override,
  }));

  const pieOuterRadius = isSmallScreen ? 70 : (isMediumScreen ? 85 : 90);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
        <p className="text-text-secondary mt-1">AI performance, bottleneck analysis, and intervention metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="AI Helpfulness Rate"
          value={`${Math.max(analytics.aiPerformance.ragHelpfulness, analytics.aiPerformance.llmHelpfulness)}%`}
          subLabel={`RAG: ${analytics.aiPerformance.ragHelpfulness}% | LLM: ${analytics.aiPerformance.llmHelpfulness}%`}
          color={COLORS.success}
        />
        <MetricCard
          label="Resolution Rate"
          value={`${analytics.bottleneckAnalysis.resolutionRate}%`}
          subLabel={`${analytics.bottleneckAnalysis.resolvedCount} of ${analytics.bottleneckAnalysis.totalQueries} queries`}
          color={COLORS.primary}
        />
        <MetricCard
          label="Human Intervention"
          value={`${analytics.humanIntervention.humanInterventionIndex}%`}
          subLabel={`${analytics.humanIntervention.totalHumanInterventions} total interventions`}
          color={COLORS.warning}
        />
        <MetricCard
          label="Peer Success Rate"
          value={`${analytics.peerPerformance.totalPeerResolved}`}
          subLabel="Queries resolved by peers"
          color={COLORS.peer}
        />
      </div>

      {/* Charts Row 1 - AI Performance & Bottleneck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Performance Comparison */}
        <Card className="border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">AI Performance Comparison</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-4">RAG vs LLM helpfulness ratios based on upvote/downvote metrics</p>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={280}>
            <BarChart data={aiPerformanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: isSmallScreen ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isSmallScreen ? 10 : 12 }} width={30} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(value, name) => [value, name === 'Helpfulness' ? `${value}%` : value]}
              />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? 10 : 12 }} />
              <Bar dataKey="Upvotes" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Downvotes" fill={COLORS.error} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">RAG Helpfulness:</span>
              <span className="text-[#3B82F6] font-bold">{analytics.aiPerformance.ragHelpfulness}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">LLM Helpfulness:</span>
              <span className="text-[#8B5CF6] font-bold">{analytics.aiPerformance.llmHelpfulness}%</span>
            </div>
          </div>
        </Card>

        {/* Bottleneck Analysis */}
        <Card className="border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">Bottleneck Analysis</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-4">Pending vs Resolved query counts showing system load</p>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={280}>
            <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <Pie
                data={bottleneckData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={pieOuterRadius}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
              >
                {bottleneckData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Queries']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
              <span className="font-medium">Pending:</span>
              <span className="font-bold">{analytics.bottleneckAnalysis.pendingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
              <span className="font-medium">Resolved:</span>
              <span className="font-bold">{analytics.bottleneckAnalysis.resolvedCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 - Human Intervention, Peer Performance, Resolution Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* Human Intervention Index */}
        <Card className="border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">Human Intervention Index</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-2">Admin/Mod overrides vs total resolutions</p>
          <ResponsiveContainer width="100%" height={SMALL_CHART_HEIGHT} minWidth={240}>
            <BarChart data={humanInterventionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: isSmallScreen ? 9 : 11 }} interval={0} angle={isSmallScreen ? -30 : 0} textAnchor={isSmallScreen ? 'end' : 'middle'} />
              <YAxis tick={{ fontSize: isSmallScreen ? 9 : 11 }} width={25} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(value) => [value, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {humanInterventionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded text-xs">
            <p className="text-yellow-800">
              <span className="font-bold">Index: {analytics.humanIntervention.humanInterventionIndex}%</span>
              <span className="hidden sm:inline"> - </span>
              <span className="hidden sm:inline">
                {analytics.humanIntervention.humanInterventionIndex < 20
                  ? 'Excellent - Peers handling most queries'
                  : analytics.humanIntervention.humanInterventionIndex < 50
                  ? 'Good - Limited intervention needed'
                  : 'Needs attention - High intervention rate'}
              </span>
            </p>
          </div>
        </Card>

        {/* Peer Performance */}
        <Card className="border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">Peer Performance</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-2">Peer answers approved by Admin vs Moderator</p>
          <ResponsiveContainer width="100%" height={SMALL_CHART_HEIGHT} minWidth={240}>
            <BarChart data={peerPerformanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: isSmallScreen ? 9 : 11 }} />
              <YAxis tick={{ fontSize: isSmallScreen ? 9 : 11 }} width={25} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(value) => [value, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {peerPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center text-sm">
            <span className="font-medium">Total Peer Resolved:</span>
            <span className="ml-2 font-bold text-lg">{analytics.peerPerformance.totalPeerResolved}</span>
          </div>
        </Card>

        {/* Resolution Distribution */}
        <Card className="border border-gray-200 p-4 md:p-6 md:col-span-2 xl:col-span-1">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">Resolution Distribution</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-2">Breakdown of how queries are being resolved</p>
          <ResponsiveContainer width="100%" height={SMALL_CHART_HEIGHT} minWidth={280}>
            <PieChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <Pie
                data={resolutionDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={pieOuterRadius}
                innerRadius={0}
                paddingAngle={2}
                dataKey="value"
                label={false}
              >
                {resolutionDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Queries']} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: isSmallScreen ? 9 : 11, lineHeight: '16px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Daily Trends */}
      {dailyTrendsData.length > 0 && (
        <Card className="border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-bold text-black mb-2">Daily Resolution Trends (Last 14 Days)</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-4">Resolution activity over time by type</p>
          <ResponsiveContainer width="100%" height={TREND_CHART_HEIGHT} minWidth={320}>
            <LineChart data={dailyTrendsData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: isSmallScreen ? 9 : 11 }} interval={Math.floor(dailyTrendsData.length / 7)} />
              <YAxis tick={{ fontSize: isSmallScreen ? 9 : 11 }} width={25} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 11 }}
              />
              <Legend
                wrapperStyle={{ fontSize: isSmallScreen ? 9 : 11 }}
                iconType="circle"
                iconSize={8}
              />
              <Line type="monotone" dataKey="Peer Approved" stroke={COLORS.peer} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="LLM" stroke={COLORS.llm} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="RAG" stroke={COLORS.rag} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Admin" stroke={COLORS.admin} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {dailyTrendsData.length === 0 && (
        <Card className="border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Daily Resolution Trends</h2>
          <div className="flex items-center justify-center h-48 text-gray-400">
            No trend data available yet. Data will appear as queries are resolved.
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
};

const MetricCard = ({ label, value, subLabel, color }) => (
  <Card className="border border-gray-200">
    <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{label}</div>
    <div className="text-2xl sm:text-3xl font-bold" style={{ color }}>{value}</div>
    <div className="text-xs text-gray-400 mt-1 truncate">{subLabel}</div>
  </Card>
);

export default AdminAnalytics;