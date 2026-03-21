'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, ArrowRight, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    // Show messages from email verification redirects
    useEffect(() => {
        const verified = searchParams.get('verified');
        const error = searchParams.get('error');
        if (verified === '1') {
            toast.success('Email verified! You can now log in.');
        } else if (error === 'token_expired') {
            toast.error('Verification link expired. Please register again.');
        } else if (error === 'invalid_token' || error === 'missing_token') {
            toast.error('Invalid verification link. Please try again.');
        } else if (error === 'server_error') {
            toast.error('Something went wrong. Please try again.');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes('EMAIL_NOT_VERIFIED')) {
                    toast.error('Please verify your email before logging in. Check your inbox!');
                } else {
                    toast.error('Invalid email or password');
                }
                setIsLoading(false);
            } else {
                const response = await fetch('/api/auth/session');
                const session = await response.json();

                if (session?.user?.role === 'ADMIN') {
                    toast.success('Welcome back, Admin!');
                    router.push('/admin');
                } else if (session?.user?.role === 'VENDOR') {
                    if (session?.user?.vendorStatus === 'APPROVED') {
                        toast.success('Welcome to your Seller Dashboard!');
                        router.push('/vendor');
                    } else {
                        toast.success('Your seller account is pending approval.');
                        router.push('/vendor/pending');
                    }
                } else {
                    toast.success('Welcome back!');
                    router.push(callbackUrl);
                }
                router.refresh();
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── LEFT PANEL — Lifestyle Visual ── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Background image via CSS — no Next.js optimization needed for decorative bg */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-top"
                    style={{ backgroundImage: "url('/images/auth-login-fashion.png')" }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Content on image */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">G</span>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">Glanzoo</span>
                    </Link>

                    {/* Bottom tagline */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-medium text-white/90 tracking-wide uppercase">New collection just dropped</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                            Fashion that speaks<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                                your language.
                            </span>
                        </h1>
                        <p className="text-white/60 text-base max-w-sm leading-relaxed mb-8">
                            8 categories. Thousands of styles. One destination for all things fashion.
                        </p>

                        {/* Trust badges */}
                        <div className="flex items-center gap-6">
                            {[
                                { icon: ShieldCheck, label: 'Secure Checkout' },
                                { icon: RotateCcw, label: '7-Day Returns' },
                                { icon: Sparkles, label: 'Exclusive Deals' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <Icon className="w-4 h-4 text-orange-400" />
                                    <span className="text-white/70 text-sm">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Login Form ── */}
            <div className="flex-1 flex flex-col bg-white">

                {/* Mobile-only logo */}
                <div className="lg:hidden px-6 pt-8 pb-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow">
                            <span className="text-white font-black text-base">G</span>
                        </div>
                        <span className="text-gray-900 font-bold text-xl tracking-tight">Glanzoo</span>
                    </Link>
                </div>

                {/* Form container */}
                <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
                    <div className="w-full max-w-[400px]">

                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
                                Welcome back 👋
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Sign in to access your orders, wishlist & exclusive offers.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300/60 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-400 font-medium">New to Glanzoo?</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        {/* Create Account */}
                        <Link
                            href="/register"
                            className="group flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-200"
                        >
                            Create a Free Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Seller link */}
                        <p className="text-center text-xs text-gray-400 mt-6">
                            Want to sell on Glanzoo?{' '}
                            <Link href="/seller-register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                                Become a Seller
                            </Link>
                        </p>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-xs text-gray-400">
                        By continuing, you agree to Glanzoo&apos;s{' '}
                        <Link href="/terms" className="hover:text-gray-600 underline underline-offset-2">Terms of Use</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="hover:text-gray-600 underline underline-offset-2">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
