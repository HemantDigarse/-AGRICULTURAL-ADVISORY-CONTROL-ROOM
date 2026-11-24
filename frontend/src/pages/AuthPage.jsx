import React, { useState } from 'react';
import { LogIn, Sprout, UserPlus } from 'lucide-react';
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
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-800 to-emerald-700 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Agri Advisory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isRegistering ? 'Create your account to get started' : 'Sign in to your advisory dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                minLength="2"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength={isRegistering ? 8 : 1}
              required
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {submitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegistering ? 'Already have an account?' : 'New to Agri Advisory?'}
          <button type="button" onClick={switchMode} className="ml-1 font-semibold text-green-700 hover:text-green-800">
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
}
