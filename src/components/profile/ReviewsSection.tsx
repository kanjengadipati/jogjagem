import React from 'react';
import { MessageSquare } from 'lucide-react';
import { type BeReview } from '../../lib/api';

interface ReviewsSectionProps {
  reviews: BeReview[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold text-lg text-royal-950 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gold-500" /> Recent Reviews ({reviews.length})
      </h3>
      {reviews.length === 0 ? (
        <p className="text-xs text-stone-500">No reviews yet.</p>
      ) : (
        reviews.map(rev => (
          <div key={rev.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
            <h4 className="font-display font-bold text-sm text-royal-950">{rev.destination_id}</h4>
            <p className="text-xs text-stone-600 mt-1">{rev.comment}</p>
            <span className="text-xs font-bold text-gold-600 mt-2 block">{rev.rating} Stars</span>
          </div>
        ))
      )}
    </div>
  );
}
