import React from 'react';
import { formatDate, parseDate } from '../../lib/dateUtils';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';

interface Project {  
  id: string;  
  commentsCount: number;
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
  stages?: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

interface ProjectsTableProps {
  projects: Project[];
  onEdit?: (projectId: string) => void;
  onView?: (projectId: string) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onEdit, onView }) => {

  return (
    <div className="overflow-x-auto relative z-0">
      <table className="w-full border-collapse" style={{ zIndex: 1 }}>
        <thead>
          <tr className="bg-glass-bg backdrop-blur-md border-b border-glass-border" style={{ zIndex: 1 }}>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/6">Название</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/3">Описание</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden md:table-cell w-1/6">Участники</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Класс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell">Дедлайн</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Прогресс</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden lg:table-cell w-1/6">Добавил</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-[180px]">Статус</th>
          </tr>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300"></th> 
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
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-cryptix-green font-medium">{project.progress}%</span>
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
              <td className="px-4 py-4 align-top">
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-5 h-5 text-cryptix-green mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.107-.07.215-.139.324-.206.54-.314 1.082-.636 1.63-.975zm-6.247-1.068a1.875 1.875 0 01-.757-.429 1.875 1.875 0 01-.332-1.275 3.125 3.125 0 01.974-2.688 11.51 11.51 0 01-.662-1.255C3.441 16.292 2.25 14.329 2.25 12c0-5.046 4.562-9 10.125-9S22.5 6.954 22.5 12c0 3.165-1.113 5.959-2.919 8.025l-2.888-2.271a2.625 2.625 0 00-1.013-.634 2.875 2.875 0 00-2.13-1.074l-.345.032.295-3.342c.057-.643-.182-1.269-.642-1.703-.461-.435-1.185-.555-1.815-.319l-.416.167z" /></svg>
                  <span className="font-bold text-white">{Math.floor(Math.random() * 6)}</span>
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