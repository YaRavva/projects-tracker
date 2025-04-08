import React from 'react';
import { calculateDaysLeft, getDaysLeftText } from '../../lib/utils';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';

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
  status?: ProjectStatus;
  review_comment?: string | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  owner,
  progress,
  deadline,
  members,
  status = 'active',
  review_comment,
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
          <h3 className="text-xl font-semibold text-white truncate">
            {name}
          </h3>
          <div className="flex items-center space-x-2">
            <ProjectStatusBadge status={status} />
            {daysLeftText && (
              <span className={getDeadlineBadgeClass()}>
                {daysLeftText}
              </span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
        )}

        {/* Отображаем комментарий администратора для возвращенных и отклоненных проектов */}
        {review_comment && (status === 'returned' || status === 'rejected') && (
          <div className="mb-4 p-2 bg-crypto-black/30 border border-glass-border rounded-md">
            <p className="text-sm text-gray-300 line-clamp-2">
              <span className="text-xs font-medium text-gray-400">
                {status === 'returned' ? 'Комментарий для доработки:' : 'Причина отклонения:'}
              </span>
              <br />
              {review_comment}
            </p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Прогресс</span>
            <span className="text-sm font-medium text-cryptix-green">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
            {/* Добавляем маркеры прогресса */}
            <div className="relative w-full h-0 -mt-2 flex justify-between px-[1px]">
              <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
              <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
              <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
              <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
              <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
            </div>
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