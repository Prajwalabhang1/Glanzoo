import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | Glanzoo',
  description: 'Review your shopping cart and proceed to checkout. Free shipping on orders over ₹999.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
