import React from 'react';
import { MapPin } from 'lucide-react';

interface VisitedDestinationsProps {
  userDestinations: { destination_slug: string; status: string }[];
}

export default function VisitedDestinations({ userDestinations }: VisitedDestinationsProps) {
  const visited = userDestinations.filter(d => d.status === 'visited');
  console.log('VisitedDestinations:', userDestinations, visited);

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold text-lg text-royal-950">Visited Destinations ({visited.length})</h3>
      {visited.length === 0 ? (
        <p className="text-xs text-stone-500">No visited destinations yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {visited.map(spot => (
            <div key={spot.destination_slug} className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <h4 className="font-display font-bold text-sm text-royal-950">{spot.destination_slug.replace(/-/g, ' ')}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
