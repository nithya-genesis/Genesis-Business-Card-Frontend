import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { GenesisLogo } from '../components/common/GenesisLogo';
import { Lock, Mail, ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== 'SYSTEM_ADMIN') {
        logout();
        setError('Access denied: This console is strictly reserved for System Administrators. Please use the standard BD login.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <GenesisLogo size="lg" variant="light" className="justify-center mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            System Administration Console
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white mb-2">
            Administrator Authentication
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Enter authorized master administrator credentials to access platform configuration, plan masters, and audit registries.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@genesistraining.in"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
              isLoading={isLoading}
            >
              Authenticate as Administrator
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <Link
              to="/login"
              className="text-xs text-neutral-400 hover:text-amber-400 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to BD Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
