import React from 'react';
import { Bookmark, Camera } from 'lucide-react';

interface SavedAndLikedProps {
  userDestinations: { destination_slug: string; status: string }[];
}

export default function SavedAndLiked({ userDestinations }: SavedAndLikedProps) {
  const saved = userDestinations.filter(d => d.status === 'saved' || d.status === 'wishlist');
  const visited = userDestinations.filter(d => d.status === 'visited');

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-lg text-royal-950 flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-gold-500" /> Saved ({saved.length})
        </h3>
        {saved.length === 0 ? (
           <p className="text-xs text-stone-500">No saved destinations yet.</p>
        ) : (
           <ul className="space-y-2">
            {saved.map(item => (
                <li key={item.destination_slug} className="text-xs text-stone-700 bg-stone-50 p-2 rounded-lg">{item.destination_slug.replace(/-/g, ' ')}</li>
            ))}
           </ul>
        )}
      </div>
      <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-lg text-royal-950 flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-gold-500" /> Visited Gallery ({visited.length})
        </h3>
        {visited.length === 0 ? (
            <p className="text-xs text-stone-500">No visited destinations yet.</p>
        ) : (
            <div className="grid grid-cols-2 gap-2">
                {visited.map(item => (
                    <div key={item.destination_slug} className="text-[10px] text-stone-700 bg-stone-50 p-2 rounded-lg truncate">
                        {item.destination_slug.replace(/-/g, ' ')}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
