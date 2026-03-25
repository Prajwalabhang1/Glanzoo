import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed | Glanzoo',
  description: 'Your Glanzoo order has been placed successfully. Track your shipment here.',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
