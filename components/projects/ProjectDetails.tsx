import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/dateUtils';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';
import ProjectReviewForm from './ProjectReviewForm';
import ProjectReviewHistory from './ProjectReviewHistory';

interface ProjectDetailsProps {
  projectId: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  status: ProjectStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  repository_url: string | null;
  demo_url: string | null;
  review_comment: string | null;
  owner?: {
    full_name: string;
    email: string;
    roles: string;
  };
  team_members?: {
    name: string;
    class: string;
    isLeader: boolean;
  }[];
  stages?: {
    id: string;
    name: string;
    deadline: string | null;
    completed: boolean;
  }[];
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Проверяем роль пользователя
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', user.id)
            .single();

          setIsAdmin(profileData?.roles === 'admin');
        }

        // Загружаем данные проекта
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            owner:owner_id (
              full_name,
              email,
              roles
            )
          `)
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Проект не найден');

        // Проверяем, является ли пользователь владельцем проекта
        setIsOwner(user?.id === projectData.owner_id);

        // Загружаем метаданные проекта (участники команды)
        const { data: metaData } = await supabase
          .from('project_meta')
          .select('key, value')
          .eq('project_id', projectId)
          .eq('key', 'team_members')
          .single();

        // Загружаем этапы проекта
        const { data: stagesData } = await supabase
          .from('project_stages')
          .select('id, name, deadline, completed')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        // Объединяем данные
        setProject({
          ...projectData,
          team_members: metaData?.value || [],
          stages: stagesData || []
        });
      } catch (err) {
        console.error('Ошибка при загрузке данных проекта:', err);
        setError('Не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, user]);

  // Обработчик обновления проекта
  const handleProjectUpdated = async () => {
    try {
      setLoading(true);
      
      // Перезагружаем данные проекта
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:owner_id (
            full_name,
            email,
            roles
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      // Обновляем состояние
      setProject(prev => prev ? { ...prev, ...data } : data);
    } catch (err) {
      console.error('Ошибка при обновлении данных проекта:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="glass-card">
        <div className="glass-card-body">
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md">
            {error || 'Проект не найден'}
          </div>
        </div>
      </div>
    );
  }

  // Проверяем доступ к проекту
  const canViewProject = isAdmin || isOwner || project.status === 'active';
  
  if (!canViewProject) {
    return (
      <div className="glass-card">
        <div className="glass-card-body">
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md">
            У вас нет доступа к этому проекту
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <div className="glass-card-body">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            <ProjectStatusBadge status={project.status} />
          </div>

          {/* Информация о проекте */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Описание</h3>
            <p className="text-gray-300">{project.description || 'Описание отсутствует'}</p>
          </div>

          {/* Комментарий администратора (если есть) */}
          {project.review_comment && (project.status === 'returned' || project.status === 'rejected') && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                {project.status === 'returned' ? 'Комментарий для доработки' : 'Причина отклонения'}
              </h3>
              <div className="bg-crypto-black/30 p-4 rounded-md text-gray-300 border border-glass-border">
                {project.review_comment}
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Основная информация</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Создан</span>
                  <span className="text-white">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Последнее обновление</span>
                  <span className="text-white">{formatDate(project.updated_at)}</span>
                </div>
                {project.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дедлайн</span>
                    <span className="text-white">{formatDate(project.deadline)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Владелец</span>
                  <span className="text-white">{project.owner?.full_name || project.owner?.email || 'Неизвестно'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Ссылки</h3>
              <div className="space-y-2">
                {project.repository_url ? (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Репозиторий</span>
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cryptix-green hover:underline"
                    >
                      {project.repository_url}
                    </a>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Репозиторий</span>
                    <span className="text-gray-500 italic">Не указан</span>
                  </div>
                )}

                {project.demo_url ? (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Демо</span>
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cryptix-green hover:underline"
                    >
                      {project.demo_url}
                    </a>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Демо</span>
                    <span className="text-gray-500 italic">Не указано</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Прогресс */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <h3 className="text-lg font-semibold text-white">Прогресс</h3>
              <span className="text-sm font-medium text-cryptix-green">{project.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${project.progress}%` }}
              ></div>
              <div className="relative w-full h-0 -mt-2 flex justify-between px-[1px]">
                <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
                <div className="w-1 h-1 rounded-full bg-cryptix-green/30"></div>
              </div>
            </div>
          </div>

          {/* Участники команды */}
          {project.team_members && project.team_members.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Участники команды</h3>
              <ul className="space-y-2">
                {project.team_members.map((member, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-white">{member.name}</span>
                    {member.class && (
                      <span className="text-gray-400 ml-2">{member.class}</span>
                    )}
                    {member.isLeader && (
                      <span className="ml-2 px-2 py-0.5 bg-cryptix-green/20 text-cryptix-green text-xs rounded-full">
                        Лидер
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Этапы проекта */}
          {project.stages && project.stages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Этапы проекта</h3>
              <ul className="space-y-3">
                {project.stages.map((stage) => (
                  <li key={stage.id} className="flex items-start">
                    <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      stage.completed
                        ? 'bg-cryptix-green/20 text-cryptix-green'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {stage.completed ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <span className={stage.completed ? 'text-white line-through' : 'text-white'}>
                          {stage.name}
                        </span>
                        {stage.deadline && (
                          <span className="text-gray-400 text-sm">
                            {formatDate(stage.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Форма рассмотрения проекта (только для администраторов) */}
      {isAdmin && (
        <ProjectReviewForm
          projectId={project.id}
          currentStatus={project.status}
          onStatusUpdated={handleProjectUpdated}
        />
      )}

      {/* История рассмотрения проекта */}
      <ProjectReviewHistory projectId={project.id} />
    </div>
  );
};

export default ProjectDetails;
