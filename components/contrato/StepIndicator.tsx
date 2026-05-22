'use client';

import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  icon: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300',
                    isCompleted && 'bg-primary text-white shadow-lg shadow-primary/30',
                    isCurrent && 'bg-navy text-white ring-4 ring-primary/20',
                    !isCompleted && !isCurrent && 'bg-navy/10 text-navy/40'
                  )}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider mt-1.5 text-center max-w-[80px] leading-tight',
                    isCurrent && 'text-navy',
                    isCompleted && 'text-primary',
                    !isCompleted && !isCurrent && 'text-navy/40'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 rounded-full transition-all duration-300',
                    index < currentStep ? 'bg-primary' : 'bg-navy/10'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
