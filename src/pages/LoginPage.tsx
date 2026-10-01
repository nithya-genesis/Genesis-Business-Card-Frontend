import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { GenesisLogo } from '../components/common/GenesisLogo';
import { GenesisWatermark } from '../components/common/GenesisWatermark';
import { Lock, Mail, AlertCircle, Award, CheckCircle2, TrendingUp, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'SYSTEM_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/admin' ? '/' : from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4 md:p-8 relative">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-neutral-200 bg-white shadow-xl overflow-hidden min-h-[600px]">
        {/* Left Column: Genesis Brand & Value Proposition */}
        <div className="lg:col-span-6 bg-neutral-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <GenesisWatermark opacity={0.04} />
          
          <div className="relative z-10 space-y-6">
            <GenesisLogo size="lg" variant="light" />

            <div className="pt-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Enterprise Placement Solutions
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-white">
                Transforming Institutional Careers with Precision Training.
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Empowering college placement cells and corporate recruiters through tailored curriculum architecture, live commercial modeling, and cryptographically verified proposals.
              </p>
            </div>

            {/* Key Value Highlights */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-neutral-200">Tier-1 Placements: </span>
                  <span className="text-neutral-400">95%+ placement qualification rate across partner institutions</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-neutral-200">Dynamic Pricing Engine: </span>
                  <span className="text-neutral-400">Multi-tier student volume scaling and real-time add-on configuration</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-neutral-200">Cryptographic Proposals: </span>
                  <span className="text-neutral-400">Instant QR code verification and tamper-proof PDF generation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Genesis Corporate v2.0</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SOC2 & Enterprise Secure</span>
            </div>
          </div>
        </div>

        {/* Right Column: Executive Sign-in Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
                Genesis Staff Sign-In
              </div>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your authorized Genesis credentials to access the Business Development workspace.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@genesistraining.in"
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-3 py-3"
                isLoading={isLoading}
              >
                Sign In to Workspace
              </Button>
            </form>
          </div>

          {/* Dedicated System Admin Link Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <span>Genesis Business Card Platform</span>
            <Link
              to="/admin/login"
              className="text-amber-700 hover:text-amber-900 font-bold hover:underline"
            >
              System Admin Console →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
