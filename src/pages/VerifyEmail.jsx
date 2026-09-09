import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import SEO from '../components/SEO';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('Link expired or invalid');
      return;
    }

    let active = true;

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        if (!active) return;
        setStatus('success');
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setError(err?.message || 'Link expired or invalid');
      }
    };

    verify();
    return () => { active = false; };
  }, [searchParams]);

  const handleResend = async () => {
    const email = localStorage.getItem('eco_pending_verification_email');
    if (!email) {
      setStatus('error');
      setError('Link expired or invalid');
      return;
    }

    try {
      await authApi.resendVerification(email);
      setStatus('success');
      setError('');
    } catch {
      setStatus('error');
      setError('Link expired or invalid');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <SEO path="/verify-email" title="Verify Email" noindex />
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-leaf-600 border-t-transparent" />
          <p className="mt-5 text-sm text-slate-500">Verifying your email…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <SEO path="/verify-email" title="Verify Email" noindex />
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === 'success' ? (
          <>
            <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
            <h1 className="mt-5 text-2xl font-bold text-slate-900">Email verified</h1>
            <p className="mt-2 text-sm text-slate-500">You can now log in to your EcoTrack account.</p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-leaf-700"
            >
              Go to login <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-5 text-2xl font-bold text-slate-900">{error || 'Link expired or invalid'}</h1>
            <button
              type="button"
              onClick={handleResend}
              className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Request a new verification email
            </button>
            <Link to="/auth" className="mt-4 inline-block text-sm font-semibold text-leaf-600 hover:text-leaf-700">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
