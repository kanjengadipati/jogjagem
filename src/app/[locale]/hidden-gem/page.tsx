import { redirect } from 'next/navigation';

export default function HiddenGemRootPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect('/destinations/hidden-gem');
}
