import type { Metadata } from 'next';
import { Ruler, Info, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Size Guide | Glanzoo',
    description: 'Find your perfect fit with Glanzoo\'s detailed size charts for women\'s ethnic wear, co-ord sets, kurti sets, and dresses.',
};

const womenTopSizes = [
    { size: 'XS', chest: '32in', waist: '26in', hip: '35in', shoulder: '14in', length: '38in' },
    { size: 'S', chest: '34in', waist: '28in', hip: '37in', shoulder: '14.5in', length: '39in' },
    { size: 'M', chest: '36in', waist: '30in', hip: '39in', shoulder: '15in', length: '40in' },
    { size: 'L', chest: '38in', waist: '32in', hip: '41in', shoulder: '15.5in', length: '41in' },
    { size: 'XL', chest: '40in', waist: '34in', hip: '43in', shoulder: '16in', length: '42in' },
    { size: 'XXL', chest: '42in', waist: '36in', hip: '45in', shoulder: '16.5in', length: '43in' },
    { size: '3XL', chest: '44in', waist: '38in', hip: '47in', shoulder: '17in', length: '44in' },
];

const bottomSizes = [
    { size: 'XS / 26', waist: '26in', hip: '35in', inseam: '39in', rise: '10in' },
    { size: 'S / 28', waist: '28in', hip: '37in', inseam: '39.5in', rise: '10.5in' },
    { size: 'M / 30', waist: '30in', hip: '39in', inseam: '40in', rise: '11in' },
    { size: 'L / 32', waist: '32in', hip: '41in', inseam: '40.5in', rise: '11.5in' },
    { size: 'XL / 34', waist: '34in', hip: '43in', inseam: '41in', rise: '12in' },
    { size: 'XXL / 36', waist: '36in', hip: '45in', inseam: '41.5in', rise: '12.5in' },
    { size: '3XL / 38', waist: '38in', hip: '47in', inseam: '42in', rise: '13in' },
];

const dressSizes = [
    { size: 'XS', bust: '32in', waist: '26in', hip: '35in', length: '50in' },
    { size: 'S', bust: '34in', waist: '28in', hip: '37in', length: '51in' },
    { size: 'M', bust: '36in', waist: '30in', hip: '39in', length: '52in' },
    { size: 'L', bust: '38in', waist: '32in', hip: '41in', length: '53in' },
    { size: 'XL', bust: '40in', waist: '34in', hip: '43in', length: '54in' },
    { size: 'XXL', bust: '42in', waist: '36in', hip: '45in', length: '55in' },
];

const measurementTips = [
    { label: 'Chest / Bust', desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the ground.' },
    { label: 'Waist', desc: 'Measure around your natural waistline — the narrowest part of your torso, usually 1 inch above the navel.' },
    { label: 'Hip', desc: 'Measure around the fullest part of your hips/seat, keeping the tape level all the way around.' },
    { label: 'Shoulder', desc: 'Measure from the edge of one shoulder seam to the other across the upper back.' },
    { label: 'Length (Top)', desc: 'Measured from the highest point of the shoulder down to the hem of the garment.' },
    { label: 'Inseam (Bottom)', desc: 'Measure from the crotch seam to the bottom of the leg on the inner side.' },
];

export default function SizeGuidePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative bg-gray-950 text-white py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-900/30 via-gray-950 to-gray-950" />
                <div className="relative container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-amber-400 text-sm">Size Guide</span>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20 shrink-0">
                            <Ruler className="w-10 h-10 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">
                                Size Guide
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Finding your perfect fit is important to us. Use our detailed size charts and
                                measurement tips to shop with confidence.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-10">
                        {[
                            { icon: '📏', text: 'All measurements in inches' },
                            { icon: '✨', text: 'Inclusive sizing XS–3XL' },
                            { icon: '🔄', text: 'Free size exchange if needed' },
                            { icon: '💬', text: 'Chat with us for styling help' },
                        ].map(b => (
                            <div key={b.text} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                                <span>{b.icon}</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 py-16 space-y-20">

                {/* How to Measure */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Info className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">How to Measure Yourself</h2>
                            <p className="text-gray-500 text-sm mt-0.5">Use a soft measuring tape for the most accurate results</p>
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-amber-900 text-sm leading-relaxed">
                                <strong>Pro tip:</strong> Have a friend help you measure for better accuracy. Measure directly over your undergarments (not over clothing)
                                and keep the tape snug but not tight. If you&apos;re between sizes, we recommend sizing up.
                            </p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {measurementTips.map((tip, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{tip.label}</h3>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tops / Kurtis / Co-ord Sets */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Ruler className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Tops, Kurtis &amp; Co-ord Sets</h2>
                            <p className="text-gray-500 text-sm mt-0.5">All measurements in inches</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-950 text-white">
                                    <th className="text-left px-5 py-4 font-semibold">Size</th>
                                    <th className="text-left px-5 py-4 font-semibold">Chest</th>
                                    <th className="text-left px-5 py-4 font-semibold">Waist</th>
                                    <th className="text-left px-5 py-4 font-semibold">Hip</th>
                                    <th className="text-left px-5 py-4 font-semibold">Shoulder</th>
                                    <th className="text-left px-5 py-4 font-semibold">Length</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {womenTopSizes.map((row, i) => (
                                    <tr key={i} className={`hover:bg-amber-50/30 transition-colors ${row.size === 'M' ? 'bg-amber-50' : ''}`}>
                                        <td className="px-5 py-3.5 font-bold text-gray-900">
                                            {row.size}
                                            {row.size === 'M' && <span className="ml-2 text-xs text-amber-600 font-normal">(Most Popular)</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.chest}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.waist}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.hip}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.shoulder}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Lengths are approximate and may vary ±1&quot; depending on the garment design.</p>
                </section>

                {/* Bottoms / Pants */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Ruler className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Bottoms — Palazzos, Pants &amp; Dupattas</h2>
                            <p className="text-gray-500 text-sm mt-0.5">All measurements in inches</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-950 text-white">
                                    <th className="text-left px-5 py-4 font-semibold">Size</th>
                                    <th className="text-left px-5 py-4 font-semibold">Waist</th>
                                    <th className="text-left px-5 py-4 font-semibold">Hip</th>
                                    <th className="text-left px-5 py-4 font-semibold">Inseam</th>
                                    <th className="text-left px-5 py-4 font-semibold">Rise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bottomSizes.map((row, i) => (
                                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-gray-900">{row.size}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.waist}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.hip}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.inseam}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.rise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Dresses / One-Piece */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Ruler className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Dresses &amp; One-Piece Outfits</h2>
                            <p className="text-gray-500 text-sm mt-0.5">All measurements in inches</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-950 text-white">
                                    <th className="text-left px-5 py-4 font-semibold">Size</th>
                                    <th className="text-left px-5 py-4 font-semibold">Bust</th>
                                    <th className="text-left px-5 py-4 font-semibold">Waist</th>
                                    <th className="text-left px-5 py-4 font-semibold">Hip</th>
                                    <th className="text-left px-5 py-4 font-semibold">Total Length</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dressSizes.map((row, i) => (
                                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-gray-900">{row.size}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.bust}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.waist}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.hip}</td>
                                        <td className="px-5 py-3.5 text-gray-600">{row.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Fabric & Fit Notes */}
                <section className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Regular Fit',
                            desc: 'True to size. Comfortable room at chest and waist. Follow the size chart measurements directly.',
                            color: 'bg-blue-50 border-blue-100',
                            badge: 'text-blue-700 bg-blue-100',
                        },
                        {
                            title: 'Slim / Fitted',
                            desc: 'Slightly closer to the body. If between sizes, size up for comfort without compromising style.',
                            color: 'bg-purple-50 border-purple-100',
                            badge: 'text-purple-700 bg-purple-100',
                        },
                        {
                            title: 'Free / One Size',
                            desc: 'Designed to fit sizes XS–L comfortably. The product listing will specify exact freeside measurements.',
                            color: 'bg-amber-50 border-amber-100',
                            badge: 'text-amber-700 bg-amber-100',
                        },
                    ].map(f => (
                        <div key={f.title} className={`border rounded-2xl p-7 ${f.color}`}>
                            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${f.badge}`}>
                                {f.title}
                            </span>
                            <p className="text-gray-700 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </section>

                {/* Size Not Found / Help */}
                <section className="bg-gray-950 rounded-2xl p-10 text-center text-white">
                    <CheckCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-heading font-bold mb-2">Can&apos;t find your size?</h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                        Our styling team can help you find the perfect fit. Share your measurements via WhatsApp and we&apos;ll guide you.
                        We also offer free size exchange if the garment doesn&apos;t fit.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/contact" className="px-6 py-3 bg-amber-400 text-gray-950 font-semibold rounded-full hover:bg-amber-300 transition-colors text-sm">
                            Get Sizing Help
                        </Link>
                        <Link href="/help/returns" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors text-sm">
                            Size Exchange Policy
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
