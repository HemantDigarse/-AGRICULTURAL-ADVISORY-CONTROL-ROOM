import React, { useState } from 'react';
import { LogIn, Sprout, UserPlus, Leaf, Cloud, Sun } from 'lucide-react';
import { loginAccount, registerAccount } from '../services/api';

export default function AuthPage({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = isRegistering
        ? await registerAccount(form)
        : await loginAccount({ email: form.email, password: form.password });
      onAuthenticated(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 flex items-center justify-center p-4 relative overflow-hidden animated-bg">
      {/* Animated particles */}
      <div className="absolute top-20 left-[10%] w-32 h-32 bg-green-400/10 rounded-full blur-3xl particle-1" />
      <div className="absolute bottom-32 right-[15%] w-40 h-40 bg-emerald-400/8 rounded-full blur-3xl particle-2" />
      <div className="absolute top-[40%] right-[25%] w-24 h-24 bg-green-300/6 rounded-full blur-2xl particle-3" />
      
      {/* Floating icons */}
      <div className="absolute top-[15%] left-[8%] text-green-500/10 animate-float-slow">
        <Leaf className="w-16 h-16" />
      </div>
      <div className="absolute bottom-[20%] right-[10%] text-emerald-500/8 animate-float" style={{ animationDelay: '1s' }}>
        <Cloud className="w-20 h-20" />
      </div>
      <div className="absolute top-[25%] right-[12%] text-yellow-500/8 animate-float-slow" style={{ animationDelay: '2s' }}>
        <Sun className="w-12 h-12" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <section className="relative w-full max-w-md animate-fade-in-scale">
        {/* Card glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
        
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm p-7 shadow-2xl sm:p-9 border border-white/50">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white mx-auto shadow-lg shadow-green-800/30">
                <Sprout className="h-7 w-7" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-green-500/10 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Agri Advisory</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {isRegistering ? 'Create your account to get started' : 'Sign in to your advisory dashboard'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {isRegistering && (
              <div className="animate-slide-down">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  minLength="2"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                minLength={isRegistering ? 8 : 1}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white transition-all duration-200"
                placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:from-green-700 hover:to-emerald-800 hover:shadow-lg hover:shadow-green-700/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {submitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : 'New to Agri Advisory?'}
            <button type="button" onClick={switchMode} className="ml-1 font-bold text-green-700 hover:text-green-800 transition-colors">
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
