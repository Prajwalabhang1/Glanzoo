import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Items | Glanzoo',
  description: 'Your saved Glanzoo products — wishlist items you love and want to buy later.',
  robots: { index: false, follow: false },
};

export default function SavedItemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
