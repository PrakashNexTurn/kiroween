/**
 * ProjectCard Component
 * Individual project card display with phase-based styling
 * 
 * Requirements: 1.2, 1.3, 1.4, 4.1, 14.2
 */

import { Badge, ProgressBar } from '../common';
import type { ProjectSummary } from '../../types/project.types';
import { Phase } from '../../types/project.types';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../utils';

export interface ProjectCardProps {
  project: ProjectSummary;
  onClick?: (projectId: string) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { goToProjectDetail } = useNavigation();
  const { theme } = useTheme();

  // Determine if card should have blue background (INIT/SPEC phases)
  const isEarlyPhase = project.phase === Phase.INIT || project.phase === Phase.SPEC;

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(project.projectId);
    } else {
      goToProjectDetail(project.projectId);
    }
  };

  // Truncate description to 2 lines (approximately 100 characters)
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fadeIn"
      style={{
        backgroundColor: isEarlyPhase
          ? theme.colors.phase.init
          : theme.colors.background.secondary,
        borderColor: theme.colors.border,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View project ${project.name}`}
    >
      {/* Card Content - Reduced padding for compact size */}
      <div className="p-4">
        {/* Header with Title and Phase Badge */}
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-base font-semibold line-clamp-1 flex-1"
            style={{
              color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.primary,
            }}
          >
            {project.name}
          </h3>
          <Badge variant={project.phase} size="sm" className="ml-2 flex-shrink-0">
            {project.phase}
          </Badge>
        </div>

        {/* Description - Smaller text and reduced spacing */}
        <p
          className="text-xs mb-3 line-clamp-2"
          style={{
            color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.secondary,
            minHeight: '2rem',
          }}
        >
          {project.description ? truncateDescription(project.description, 80) : 'No description provided'}
        </p>

        {/* Completion Percentage */}
        <div className="mb-2">
          <span
            className="text-xs font-medium"
            style={{
              color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.secondary,
            }}
          >
            {project.completionPercentage}% Complete
          </span>
        </div>
      </div>

      {/* Progress Bar at Bottom - Reduced padding */}
      <div className="px-4 pb-3">
        <ProgressBar
          percentage={project.completionPercentage}
          variant={
            project.completionPercentage === 100
              ? 'success'
              : project.completionPercentage >= 50
              ? 'primary'
              : 'warning'
          }
          showLabel={false}
          height="sm"
        />
      </div>
    </div>
  );
}
