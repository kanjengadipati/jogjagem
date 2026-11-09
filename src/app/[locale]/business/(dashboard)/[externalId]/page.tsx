import RedirectClient from './RedirectClient';

export function generateStaticParams() {
  return [
    { locale: 'id', externalId: '_' },
    { locale: 'en', externalId: '_' },
  ];
}

export default function Page() {
  return <RedirectClient />;
}