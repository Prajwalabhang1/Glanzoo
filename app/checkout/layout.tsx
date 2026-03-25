import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Glanzoo',
  description: 'Securely checkout your Glanzoo order. Pay via UPI, cards, or cash on delivery.',
  robots: { index: false, follow: false }, // don't index transactional pages
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
