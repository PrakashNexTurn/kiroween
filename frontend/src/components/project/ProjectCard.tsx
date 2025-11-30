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
        height: '100%',
        padding: '12px',
        borderRadius: '12px',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Card Content - Mobile Optimized */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
        {/* Header with Title and Phase Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
          <h3
            style={{
              fontSize: 'clamp(15px, 3.5vw, 16px)',
              fontWeight: 600,
              lineHeight: 1.3,
              color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.primary,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {project.name}
          </h3>
          <Badge variant={project.phase} size="sm" style={{ flexShrink: 0 }}>
            {project.phase}
          </Badge>
        </div>

        {/* Description - Mobile Optimized */}
        <p
          style={{
            fontSize: 'clamp(12px, 2.8vw, 13px)',
            lineHeight: 1.4,
            color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.secondary,
            marginBottom: '12px',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
          }}
        >
          {project.description ? truncateDescription(project.description, 100) : 'No description provided'}
        </p>

        {/* Completion Percentage */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: 'clamp(11px, 2.5vw, 12px)',
              fontWeight: 500,
              color: isEarlyPhase ? theme.colors.text.inverse : theme.colors.text.secondary,
            }}
          >
            {project.completionPercentage}% Complete
          </span>
        </div>

        {/* Progress Bar at Bottom */}
        <div style={{ marginTop: 'auto' }}>
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
    </div>
  );
}
