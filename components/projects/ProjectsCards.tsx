import React from 'react';
import { formatDate } from '../../lib/dateUtils';
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

interface ProjectsCardsProps {
  projects: Project[];
  onEdit?: (projectId: string) => void;
  onView?: (projectId: string) => void;
}

const ProjectsCards: React.FC<ProjectsCardsProps> = ({ projects, onEdit, onView }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="glass-card p-4 rounded-lg border border-glass-border hover:border-cryptix-green/30 transition-all cursor-pointer animate-fadeIn"
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => onView && onView(project.id)}
        >
          <div className="mb-4">
            <h3 className="text-white font-medium text-lg mb-2 line-clamp-1">{project.title}</h3>

            {project.description ? (
              <p className={`text-gray-400 text-sm ${(!project.team_members || project.team_members.length < 3) ? 'line-clamp-6' : 'line-clamp-4'}`}>
                {project.description}
              </p>
            ) : (
              <p className="text-gray-500 text-sm italic">Нет описания</p>
            )}
          </div>

          <div className="flex-grow">
            {project.team_members && project.team_members.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {project.team_members.slice(0, 3).map((member, idx) => (
                    <span
                      key={idx}
                      className={`member-tag ${member.isLeader ? 'leader' : ''}`}
                    >
                      {member.name}
                    </span>
                  ))}
                  {project.team_members.length > 3 && (
                    <span className="member-tag">
                      +{project.team_members.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="mb-2">
              <div className="flex items-center justify-center">
                <div className="progress-bar w-2/3 shadow-glow-sm mr-2">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-cryptix-green font-medium whitespace-nowrap">{project.progress}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 pb-2">
              <div className="flex items-center space-x-3">
                <ProjectStatusBadge status={project.status} className="whitespace-nowrap" />

                {project.deadline && (
                  <span className={`text-sm px-2.5 py-1 rounded-full border flex items-center justify-center shadow-glow-sm ${
                    project.status === 'completed'
                      ? 'bg-cryptix-green/20 text-cryptix-green border-cryptix-green/30'
                      : 'bg-glass-bg text-gray-300 border-glass-border'
                  }`}>
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1.5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(project.deadline)}
                    </span>
                  </span>
                )}

                <span className="text-sm text-gray-300 bg-glass-bg px-2.5 py-1 rounded-full border border-glass-border flex items-center justify-center shadow-glow-sm">
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1.5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="font-medium">{project.commentsCount || 0}</span>
                  </span>
                </span>
              </div>

              <div className="flex space-x-2">
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-cryptix-green hover:text-cryptix-green-light transition-all duration-300 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                    title="Репозиторий"
                  >
                    <div className="bg-glass-bg p-1.5 rounded-full border border-glass-border hover:border-cryptix-green/50 shadow-glow-sm hover:shadow-glow-md transition-all duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                  </a>
                )}

                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-cryptix-green hover:text-cryptix-green-light transition-all duration-300 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                    title="Демо"
                  >
                    <div className="bg-glass-bg p-1.5 rounded-full border border-glass-border hover:border-cryptix-green/50 shadow-glow-sm hover:shadow-glow-md transition-all duration-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsCards;
