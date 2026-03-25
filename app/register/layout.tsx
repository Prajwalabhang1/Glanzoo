import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Glanzoo',
  description: 'Join Glanzoo and discover thousands of premium ethnic fashion styles. Free & easy registration.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
