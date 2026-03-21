'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Check, X, ArrowRight, Gift, Truck, Star, ShieldCheck } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function RegisterPage() {
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const checkPasswordStrength = (password: string) => {
        setPasswordStrength({
            length: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!passwordStrength.length) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Account created! Please check your email to verify your account.');
            router.push('/login');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none";

    const perks = [
        { icon: Gift, label: 'Member-only offers & early access' },
        { icon: Truck, label: 'Free shipping on orders above ₹999' },
        { icon: Star, label: 'Earn reward points on every purchase' },
        { icon: ShieldCheck, label: '100% secure checkout every time' },
    ];

    return (
        <div className="min-h-screen flex">

            {/* ── LEFT PANEL — Form ── */}
            <div className="flex-1 flex flex-col bg-white">

                {/* Mobile logo */}
                <div className="lg:hidden px-6 pt-8 pb-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow">
                            <span className="text-white font-black text-base">G</span>
                        </div>
                        <span className="text-gray-900 font-bold text-xl tracking-tight">Glanzoo</span>
                    </Link>
                </div>

                {/* Scrollable form area */}
                <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 sm:px-10 overflow-y-auto">
                    <div className="w-full max-w-[420px]">

                        {/* Heading */}
                        <div className="mb-7">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
                                Create your account ✨
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Join thousands of happy shoppers on Glanzoo.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={inputClass}
                                    placeholder="Your full name"
                                />
                            </div>

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
                                    className={inputClass}
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mobile Number
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-sm text-gray-500 font-medium select-none">+91</span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`${inputClass} pl-12`}
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value });
                                            checkPasswordStrength(e.target.value);
                                        }}
                                        className={`${inputClass} pr-12`}
                                        placeholder="Min. 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Strength indicators */}
                                {formData.password && (
                                    <div className="mt-2 flex items-center gap-4">
                                        {[
                                            { ok: passwordStrength.length, label: '8+ chars' },
                                            { ok: passwordStrength.hasNumber, label: 'Number' },
                                            { ok: passwordStrength.hasSpecial, label: 'Symbol' },
                                        ].map(({ ok, label }) => (
                                            <div key={label} className="flex items-center gap-1">
                                                {ok
                                                    ? <Check className="w-3 h-3 text-emerald-500" />
                                                    : <X className="w-3 h-3 text-gray-300" />
                                                }
                                                <span className={`text-xs ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className={`${inputClass} pr-12`}
                                        placeholder="Re-enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <X className="w-3 h-3" /> Passwords don&apos;t match
                                    </p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                                    <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2.5 pt-1">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                />
                                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                                    I agree to Glanzoo&apos;s{' '}
                                    <Link href="/policies/terms" className="text-orange-500 font-medium hover:text-orange-600">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/policies/privacy" className="text-orange-500 font-medium hover:text-orange-600">Privacy Policy</Link>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300/60 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Free Account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign in link */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-400 font-medium">Already have an account?</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <Link
                            href="/login"
                            className="group flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-200"
                        >
                            Sign In Instead
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Want to sell on Glanzoo?{' '}
                            <Link href="/seller-register" className="text-orange-500 font-semibold hover:text-orange-600">
                                Become a Seller
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Lifestyle Visual ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-top"
                    style={{ backgroundImage: "url('/images/auth-register-fashion.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-14">
                    {/* Logo */}
                    <div className="flex justify-start">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-black text-lg">G</span>
                            </div>
                            <span className="text-white font-bold text-2xl tracking-tight">Glanzoo</span>
                        </Link>
                    </div>

                    {/* Bottom content */}
                    <div>
                        <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                            Your style,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                                unlocked.
                            </span>
                        </h2>
                        <p className="text-white/60 text-sm mb-7 max-w-xs leading-relaxed">
                            Join Glanzoo and get access to exclusive deals, early collections, and a personalised shopping experience.
                        </p>

                        {/* Perks list */}
                        <div className="space-y-3">
                            {perks.map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                    <span className="text-white/75 text-sm">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
