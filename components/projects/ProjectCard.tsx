import React from 'react';
import Link from 'next/link';
import { calculateDaysLeft, getDaysLeftText } from '../../lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  owner: {
    email: string;
    full_name?: string;
  };
  progress: number;
  deadline?: string;
  members: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  owner,
  progress,
  deadline,
  members,
}) => {
  const daysLeft = deadline ? calculateDaysLeft(deadline) : null;
  const daysLeftText = daysLeft !== null ? getDaysLeftText(daysLeft) : null;
  
  // Определяем класс для индикатора дедлайна
  const getDeadlineBadgeClass = () => {
    if (daysLeft === null) return 'badge badge-success';
    if (daysLeft < 0) return 'badge badge-danger';
    if (daysLeft <= 3) return 'badge badge-warning';
    return 'badge badge-success';
  };

  return (
    <div className="glass-card group">
      <div className="glass-card-body">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-white truncate group-hover:text-crypto-green-500 transition-colors">
            <Link href={`/projects/${id}`}>
              {name}
            </Link>
          </h3>
          {daysLeftText && (
            <span className={getDeadlineBadgeClass()}>
              {daysLeftText}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Прогресс</span>
            <span className="text-sm font-medium text-crypto-green-500">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            <span>Автор: </span>
            <span className="font-medium text-gray-300">{owner.full_name || owner.email}</span>
          </div>
          <div>
            <span>Участников: </span>
            <span className="font-medium text-gray-300">{members}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 