import React from 'react';
import { MessageSquare, BarChart3 } from 'lucide-react';

interface TravelStatisticsCardProps {
  reviewsCount: number;
}

export default function TravelStatisticsCard({ reviewsCount }: TravelStatisticsCardProps) {
  const statsList = [
    { label: 'Reviews Written', value: reviewsCount, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-stone-100 text-stone-600 rounded-lg">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-royal-950">Travel Statistics</h3>
        </div>
      </div>

      <div className="space-y-3">
        {statsList.map((stat, idx) => {
          return (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-stone-600">{stat.label}</span>
              </div>
              <span className="font-bold text-sm text-royal-950">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
