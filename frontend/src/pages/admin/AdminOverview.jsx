/**
 * =============================================================================
 * QUERY.IN - ADMIN OVERVIEW PAGE
 * =============================================================================
 * Entry point for /admin route. Shows navigation cards to each section.
 * User Registration, Spoiled Users, and User Management are all combined
 * into the single "User Management" page at /admin/users.
 *
 * @module pages/admin/AdminOverview
 */

import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';

const AdminOverview = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Complete system management interface</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          to="/admin/users"
          title="User Management"
          description="Register users, manage accounts, view warnings, activate/deactivate"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          }
        />
        <NavCard
          to="/admin/announcement"
          title="Announcements"
          description="Publish global notices directly into the platform feed"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          }
        />
        <NavCard
          to="/admin/queries"
          title="Query Monitor"
          description="Central control grid for tracking and addressing active tickets"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <NavCard
          to="/admin/faqs"
          title="FAQ Editor"
          description="Create a new FAQ or update existing entries in the FAQ collection"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <NavCard
          to="/admin/ambiguous"
          title="Ambiguous Queries"
          description="Queries marked unclear by 3 different peers (3-strike rule)"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <NavCard
          to="/admin/resolve"
          title="Resolve Hub"
          description="Central command terminal for reviewing, approving, or overriding escalated queries"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <NavCard
          to="/admin/suggestions"
          title="AI Suggestions"
          description="Automatically identifies documentation gaps by aggregating unanswerable questions"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>
    </DashboardLayout>
  );
};

const NavCard = ({ to, title, icon, description }) => {
  return (
    <a
      href={to}
      className="block border-2 border-black rounded-lg p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="text-black">{icon}</div>
        <div>
          <h3 className="font-bold text-black">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default AdminOverview;
