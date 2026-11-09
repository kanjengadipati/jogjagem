import InviteClient from './InviteClient';

export function generateStaticParams() {
  return [
    { locale: 'id', token: '_' },
    { locale: 'en', token: '_' },
  ];
}

export default function Page() {
  return <InviteClient />;
}