/**
 * =============================================================================
 * QUERY.IN - LANDING PAGE
 * =============================================================================
 * Public landing page with 50/50 split layout (responsive).
 * - Left: Explore FAQs card
 * - Right: Login form
 *
 * Stack layout on mobile, side-by-side on desktop (lg:).
 *
 * @module pages/Landing
 */

import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            Query.in
          </h1>
          <p className="text-text-secondary text-lg">
            Crowd-sourced FAQ & P2P Query Resolution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center py-12 text-center border-2 border-black">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-black mb-2">Explore FAQs</h2>
            <p className="text-text-secondary mb-6 max-w-sm">
              Browse through our comprehensive knowledge base of frequently asked questions.
            </p>
            <Link to="/faqs">
              <Button variant="primary">Explore FAQs</Button>
            </Link>
          </Card>

          <Card className="py-12 px-8 border-2 border-black">
            <h2 className="text-2xl font-semibold text-black mb-6 text-center">Account Login</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="••••••••"
                />
              </div>
              <Link to="/login" className="block">
                <Button type="submit" variant="outline" className="w-full mt-4">Sign In</Button>
              </Link>
            </form>
            <p className="text-center text-sm text-text-muted mt-4">
              Access restricted to authorized personnel only.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;