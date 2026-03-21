'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { error: showError, success } = useToast();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                <p className="text-gray-500 text-sm mb-6">This link is invalid or has expired.</p>
                <Link href="/forgot-password" className="text-orange-500 font-semibold hover:text-orange-600">
                    Request a new link →
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            showError("Passwords don't match");
            return;
        }
        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setDone(true);
                success('Password reset! Redirecting to login...');
                setTimeout(() => router.push('/login'), 2500);
            } else {
                showError(data.error || 'Failed to reset password');
            }
        } catch {
            showError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (done) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm">Redirecting you to sign in...</p>
                <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto mt-3" />
            </div>
        );
    }

    return (
        <>
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Set new password</h1>
                <p className="text-gray-500 text-sm">Choose a strong password with at least 8 characters.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                        <input
                            type={showPwd ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <input
                        type="password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 transition-all"
                >
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow">
                            <span className="text-white font-black text-base">G</span>
                        </div>
                        <span className="text-gray-900 font-bold text-xl tracking-tight">Glanzoo</span>
                    </Link>
                    <Suspense fallback={<div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
