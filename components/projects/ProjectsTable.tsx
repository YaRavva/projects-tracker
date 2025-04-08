import React from 'react';
import { formatDate, parseDate } from '../../lib/dateUtils';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  progress: number;
  repository_url: string | null;
  demo_url: string | null;
  status: ProjectStatus;
  review_comment?: string | null;
  profiles: {
    full_name: string;
  };
  team_members?: {
    name: string;
    class: string;
    isLeader: boolean;
  }[];
}

interface ProjectsTableProps {
  projects: Project[];
  onEdit?: (projectId: string) => void;
  onView?: (projectId: string) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onEdit, onView }) => {

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-glass-bg backdrop-blur-md border-b border-glass-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Название</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/3">Описание</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell">Участники</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Класс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Дедлайн</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Прогресс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Добавил</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-[180px]">Статус</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Действия</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-glass-border hover:bg-glass-highlight transition-colors h-28 cursor-pointer"
              onClick={() => onView && onView(project.id)}
            >
              <td className="px-4 py-4 align-top">
                <span className="text-white font-medium">
                  {project.title}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-400 hidden md:table-cell align-top">
                {project.description ? (
                  <div className="line-clamp-4 max-w-md">
                    {project.description}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Нет описания</span>
                )}
              </td>
              <td className="px-4 py-4 hidden md:table-cell align-top">
                {project.team_members && project.team_members.length > 0 ? (
                  <div className="flex flex-col space-y-1">
                    {project.team_members.map((member, idx) => {
                      return (
                        <div key={idx} className="flex items-center">
                          <span className={`text-sm ${member.isLeader ? 'text-cryptix-green font-medium' : 'text-gray-400'}`}>
                            {member.name || 'Имя не указано'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Не указаны</span>
                )}
              </td>
              <td className="px-4 py-4 text-gray-400 hidden lg:table-cell align-top">
                {project.team_members && project.team_members.length > 0 ? (
                  <div className="flex flex-col space-y-1">
                    {project.team_members.map((member, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className={`text-sm ${member.isLeader ? 'text-cryptix-green font-medium' : 'text-gray-400'}`}>
                          {member.class || 'Не указан'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Не указан</span>
                )}
              </td>
              <td className="px-4 py-4 hidden lg:table-cell align-top">
                {project.deadline ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    // Проверяем, что дедлайн прошел
                    (() => {
                      try {
                        // Если дата в формате дд.мм.гг, преобразуем в ISO
                        const parts = project.deadline.split('.');
                        if (parts.length === 3) {
                          // Если год двухзначный, добавляем '20' впереди
                          let year = parts[2];
                          if (year.length === 2) {
                            year = '20' + year;
                          }
                          const isoDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                          return new Date(isoDate) < new Date();
                        }
                        // Если дата в другом формате, пробуем прямое преобразование
                        return new Date(project.deadline) < new Date();
                      } catch (e) {
                        return false;
                      }
                    })()
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {formatDate(project.deadline)}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">Не указан</span>
                )}
              </td>
              <td className="px-4 py-4 align-top">
                <div>
                  <div className="progress-bar w-full max-w-[150px]">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                    {/* Добавляем маркеры прогресса */}
                    <div className="relative w-full h-0 -mt-2 flex justify-between px-[1px]">
                      <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                      <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                      <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-cryptix-green">{project.progress}%</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-400 hidden lg:table-cell align-top">
                {project.profiles?.full_name || 'Не указан'}
              </td>
              <td className="px-4 py-4 align-top text-center">
                <div className="flex flex-col items-center">
                  <ProjectStatusBadge status={project.status} className="whitespace-nowrap" />
                  {project.status === 'returned' && project.review_comment && (
                    <div className="mt-1 text-xs text-gray-400 max-w-[150px] truncate" title={project.review_comment}>
                      {project.review_comment}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-right align-top">
                <div className="flex justify-end space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем всплытие события
                      onEdit && onEdit(project.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title="Редактировать"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Репозиторий"
                      onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие события
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Демо"
                      onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие события
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;