export function generateStaticParams() {
  return [
    { locale: 'id', externalId: '_' },
    { locale: 'en', externalId: '_' },
  ];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}