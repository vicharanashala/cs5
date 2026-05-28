/**
 * =============================================================================
 * QUERY.IN - LOGIN PAGE
 * =============================================================================
 * Dedicated login portal that calls /api/auth/login and redirects
 * the user to their dashboard based on their role.
 *
 * Uses window.location for hard redirect to ensure localStorage is read fresh.
 *
 * @module pages/Login
 */

import { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const roleRoute = user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/intern';

      window.location.href = roleRoute;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black tracking-tight">Query.in</h1>
          <p className="text-text-secondary mt-1">Sign in to your account</p>
        </div>

        <Card className="border-2 border-black">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                {error}
              </div>
            )}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-black bg-white text-black placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="text-center text-sm text-text-muted">
              Test accounts: admin@query.in, mod@query.in, intern1@query.in
            </p>
          </div>
        </Card>

        <p className="text-center mt-6">
          <a href="/" className="text-sm text-text-secondary hover:text-black underline">
            ← Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;