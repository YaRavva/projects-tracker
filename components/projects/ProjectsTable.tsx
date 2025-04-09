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
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/6">Название</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/3">Описание</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/6">Участники</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Класс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Дедлайн</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Прогресс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell w-1/6">Добавил</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-[180px]">Статус</th>
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

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;