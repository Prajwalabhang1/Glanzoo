import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Account | Glanzoo',
  description: 'Manage your Glanzoo account — view orders, track shipments, and update your profile.',
  robots: { index: false, follow: false },
};

export default function MyAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
