'use client';

import { Loader2, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';

export interface StepperStep {
  id: string;
  label: string;
}

interface VerificationStepperProps {
  steps: StepperStep[];
  /** id step yang sedang berjalan */
  activeStep: string;
  /** true = semua step selesai */
  allDone?: boolean;
}

export default function VerificationStepper({ steps, activeStep, allDone = false }: VerificationStepperProps) {
  const activeIndex = allDone ? steps.length : Math.max(steps.findIndex((s) => s.id === activeStep), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-stone-800">Verifikasi Data Bisnis</div>
            <div className="text-[11px] text-stone-400">Memastikan semua data valid sebelum diproses</div>
          </div>
        </div>

        <div className="space-y-2.5">
          {steps.map((s, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isDone ? 'text-emerald-700' : isActive ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {s.label}
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] text-amber-500 font-semibold animate-pulse">Memproses...</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(activeIndex / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
