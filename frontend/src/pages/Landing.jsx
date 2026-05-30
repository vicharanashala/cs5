/**
 * =============================================================================
 * QUERY.IN - LANDING PAGE
 * =============================================================================
 * Public landing page with modern SaaS-style split layout.
 * Features clean typography, subtle shadows, and professional spacing.
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
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight mb-3">
            Query.in
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Crowd-sourced FAQ & P2P Query Resolution Platform
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Explore FAQs */}
          <Card className="flex flex-col items-center justify-center py-12 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-200 cursor-pointer" hover={false} onClick={() => window.location.href = '/faqs'}>
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-200 shadow-sm flex-shrink-0 transition-all duration-300 hover:bg-black group">
              <svg className="w-12 h-12 text-black transition-colors duration-300 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Explore FAQs</h2>
            <p className="text-gray-600 mb-6 max-w-sm text-center">
              Browse through our comprehensive knowledge base of frequently asked questions.
            </p>
            <Link to="/faqs">
              <Button variant="secondary" size="lg">Browse Knowledge Base</Button>
            </Link>
          </Card>

          {/* Right: Login Form */}
          <Card className="py-10 px-8 hover:shadow-xl hover:scale-[1.01] transition-all duration-300" hover={false}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-lg transition-all hover:border-gray-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent rounded-lg transition-all hover:border-gray-400"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Demo credentials: <span className="font-medium text-black">admin@query.in</span> / <span className="font-medium text-black">Admin@1234</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm text-gray-500">
          <p>Query.in — Internal FAQ Resolution Platform</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;