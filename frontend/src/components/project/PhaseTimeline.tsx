/**
 * PhaseTimeline Component
 * Displays project phases in a visual timeline with current phase highlighted
 * 
 * Requirements: 11.5
 */

import { Check } from 'lucide-react';
import type { Phase } from '../../types/project.types';

/**
 * Props for PhaseTimeline component
 */
export interface PhaseTimelineProps {
  currentPhase: Phase;
}

/**
 * All phases in order
 */
const PHASES: Phase[] = ['INIT', 'SPEC', 'BUILD', 'TEST', 'FIX', 'COMPLETE'];

/**
 * Phase display names
 */
const PHASE_NAMES: Record<Phase, string> = {
  INIT: 'Initialize',
  SPEC: 'Specification',
  BUILD: 'Build',
  TEST: 'Test',
  FIX: 'Fix',
  COMPLETE: 'Complete',
};

/**
 * Phase colors
 */
const PHASE_COLORS: Record<Phase, string> = {
  INIT: 'var(--color-brand-primary)',
  SPEC: 'var(--color-brand-primary)',
  BUILD: 'var(--color-text-secondary)',
  TEST: 'var(--color-status-info)',
  FIX: 'var(--color-status-error)',
  COMPLETE: 'var(--color-status-success)',
};

/**
 * Check if a phase is completed
 */
function isPhaseCompleted(phase: Phase, currentPhase: Phase): boolean {
  const phaseIndex = PHASES.indexOf(phase);
  const currentIndex = PHASES.indexOf(currentPhase);
  return phaseIndex < currentIndex;
}

/**
 * Check if a phase is current
 */
function isPhaseCurrent(phase: Phase, currentPhase: Phase): boolean {
  return phase === currentPhase;
}

/**
 * PhaseTimeline component
 * Displays horizontal timeline on desktop, vertical on mobile
 */
export function PhaseTimeline({ currentPhase }: PhaseTimelineProps) {
  return (
    <>
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:block">
        <nav aria-label="Project phase timeline" role="navigation">
          <div className="flex items-center justify-between">
          {PHASES.map((phase, index) => {
            const isCompleted = isPhaseCompleted(phase, currentPhase);
            const isCurrent = isPhaseCurrent(phase, currentPhase);
            const isLast = index === PHASES.length - 1;
            const phaseColor = PHASE_COLORS[phase];

            return (
              <div key={phase} className="flex items-center flex-1">
                {/* Phase Node */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent ? 'ring-4 ring-opacity-30' : ''
                    }`}
                    style={{
                      backgroundColor: isCompleted || isCurrent
                        ? phaseColor
                        : 'var(--color-bg-tertiary)',
                      color: isCompleted || isCurrent
                        ? 'var(--color-text-inverse)'
                        : 'var(--color-text-secondary)',
                      ...(isCurrent && { '--tw-ring-color': phaseColor } as any),
                    }}
                    role="status"
                    aria-label={`${PHASE_NAMES[phase]}: ${isCompleted ? 'Completed' : isCurrent ? 'Current phase' : 'Pending'}`}
                  >
                    {isCompleted ? (
                      <Check size={20} aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Phase Name */}
                  <span
                    className={`mt-2 text-xs font-medium text-center ${
                      isCurrent ? 'font-bold' : ''
                    }`}
                    style={{
                      color: isCurrent
                        ? phaseColor
                        : 'var(--color-text-secondary)',
                    }}
                    aria-hidden="true"
                  >
                    {PHASE_NAMES[phase]}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className="flex-1 h-0.5 mx-2 transition-all duration-300"
                    style={{
                      backgroundColor: isCompleted
                        ? phaseColor
                        : 'var(--color-border)',
                    }}
                  />
                )}
              </div>
            );
          })}
          </div>
        </nav>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden">
        <nav aria-label="Project phase timeline" role="navigation">
          <div className="space-y-4">
          {PHASES.map((phase, index) => {
            const isCompleted = isPhaseCompleted(phase, currentPhase);
            const isCurrent = isPhaseCurrent(phase, currentPhase);
            const isLast = index === PHASES.length - 1;
            const phaseColor = PHASE_COLORS[phase];

            return (
              <div key={phase} className="flex items-start">
                {/* Left Side: Circle and Line */}
                <div className="flex flex-col items-center mr-4">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCurrent ? 'ring-4 ring-opacity-30' : ''
                    }`}
                    style={{
                      backgroundColor: isCompleted || isCurrent
                        ? phaseColor
                        : 'var(--color-bg-tertiary)',
                      color: isCompleted || isCurrent
                        ? 'var(--color-text-inverse)'
                        : 'var(--color-text-secondary)',
                      ...(isCurrent && { '--tw-ring-color': phaseColor } as any),
                    }}
                    role="status"
                    aria-label={`${PHASE_NAMES[phase]}: ${isCompleted ? 'Completed' : isCurrent ? 'Current phase' : 'Pending'}`}
                  >
                    {isCompleted ? (
                      <Check size={20} aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className="w-0.5 h-12 my-1 transition-all duration-300"
                      style={{
                        backgroundColor: isCompleted
                          ? phaseColor
                          : 'var(--color-border)',
                      }}
                    />
                  )}
                </div>

                {/* Right Side: Phase Info */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`text-base font-medium ${
                      isCurrent ? 'font-bold' : ''
                    }`}
                    style={{
                      color: isCurrent
                        ? phaseColor
                        : 'var(--color-text-primary)',
                    }}
                  >
                    {PHASE_NAMES[phase]}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {isCompleted
                      ? 'Completed'
                      : isCurrent
                      ? 'In Progress'
                      : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        </nav>
      </div>
    </>
  );
}
