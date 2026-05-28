/**
 * =============================================================================
 * QUERY.IN - LANDING PAGE
 * =============================================================================
 * Public landing page with 50/50 split layout.
 * Right side contains embedded login form.
 *
 * @module pages/Landing
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);

      const roleRoute = user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/intern';
      navigate(roleRoute, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Left: Explore FAQs */}
          <Card className="flex flex-col items-center justify-center py-12 text-center border-2 border-black rounded-lg">
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

          {/* Right: Login Form */}
          <Card className="py-12 px-8 border-2 border-black rounded-lg">
            <h2 className="text-2xl font-semibold text-black mb-6 text-center">Sign In</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-4">
              Test: admin@query.in / Admin@1234
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;