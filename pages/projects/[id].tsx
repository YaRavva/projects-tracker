import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { formatDate, isOverdue, daysUntilDeadline } from '../../lib/dateUtils';

interface TeamMember {
  name: string;
  class: string;
  role: string;
}

interface Stage {
  id: string;
  name: string;
  deadline: string | null;
  completed: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  progress: number;
  repository_url: string | null;
  demo_url: string | null;
  team_members: TeamMember[];
  stages: Stage[];
}

const ProjectDetailPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);

        // Загружаем основные данные проекта
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('owner_id', user.id)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Проект не найден');

        // Загружаем этапы проекта
        const { data: stagesData, error: stagesError } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: true });

        if (stagesError) throw stagesError;

        // Загружаем метаданные проекта (участники команды)
        const { data: metaData, error: metaError } = await supabase
          .from('project_meta')
          .select('*')
          .eq('project_id', id)
          .eq('key', 'team_members')
          .single();

        // Формируем полные данные проекта
        const fullProject: Project = {
          ...projectData,
          team_members: metaData?.value || [],
          stages: stagesData || []
        };

        setProject(fullProject);
      } catch (err: any) {
        console.error('Ошибка при загрузке проекта:', err);
        setError(err.message || 'Не удалось загрузить проект');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handleStageToggle = async (stageId: string, completed: boolean) => {
    if (!project) return;

    try {
      // Обновляем статус этапа
      const { error: updateError } = await supabase
        .from('project_stages')
        .update({ completed })
        .eq('id', stageId);

      if (updateError) throw updateError;

      // Обновляем этапы в локальном состоянии
      const updatedStages = project.stages.map(stage =>
        stage.id === stageId ? { ...stage, completed } : stage
      );

      // Рассчитываем новый прогресс
      const validStages = updatedStages.filter(stage => stage.name.trim());
      const completedStages = validStages.filter(stage => stage.completed);
      const progress = validStages.length > 0
        ? Math.round((completedStages.length / validStages.length) * 100)
        : 0;

      // Обновляем прогресс проекта
      const { error: progressError } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', project.id);

      if (progressError) throw progressError;

      // Обновляем локальное состояние
      setProject({
        ...project,
        progress,
        stages: updatedStages
      });
    } catch (err: any) {
      console.error('Ошибка при обновлении этапа:', err);
      setError(err.message || 'Не удалось обновить этап');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md">
              {error || 'Проект не найден'}
            </div>
            <div className="mt-4">
              <Link href="/projects" className="text-crypto-green-500 hover:underline">
                ← Вернуться к списку проектов
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const deadlineDays = project.deadline ? daysUntilDeadline(project.deadline) : null;

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>{project.title} | IT Projects</title>
        </Head>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/projects" className="text-crypto-green-500 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться к списку проектов
            </Link>
          </div>

          <div className="bg-crypto-black/30 border border-glass-border rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">{project.title}</h1>

              <div className="flex space-x-2">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="btn-secondary-sm"
                >
                  Редактировать
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Описание</h3>
                <p className="text-white">
                  {project.description || 'Описание отсутствует'}
                </p>
              </div>

              <div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Информация о проекте</h3>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Создан</div>
                      <div className="text-white">{formatDate(project.created_at)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Дедлайн</div>
                      {project.deadline ? (
                        <div className={`text-white ${isOverdue(project.deadline) ? 'text-red-400' : ''}`}>
                          {formatDate(project.deadline)}
                          {deadlineDays !== null && (
                            <span className={`ml-2 text-xs ${deadlineDays < 0 ? 'text-red-400' : deadlineDays <= 7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                              {deadlineDays < 0
                                ? `(просрочен на ${Math.abs(deadlineDays)} дн.)`
                                : deadlineDays === 0
                                  ? '(сегодня)'
                                  : `(осталось ${deadlineDays} дн.)`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">Не указан</div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Прогресс</div>
                      <div className="mt-1">
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${project.progress}%` }}
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
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">0%</span>
                          <span className="text-xs text-cryptix-green">{project.progress}%</span>
                          <span className="text-xs text-gray-400">100%</span>
                        </div>
                      </div>
                    </div>

                    {(project.repository_url || project.demo_url) && (
                      <div className="pt-2 border-t border-glass-border">
                        <div className="text-xs text-gray-500 mb-2">Ссылки</div>
                        <div className="flex flex-col space-y-2">
                          {project.repository_url && (
                            <a
                              href={project.repository_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-crypto-green-500 hover:text-crypto-green-400 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              Репозиторий
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-crypto-green-500 hover:text-crypto-green-400 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Демо-версия
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {project.team_members && project.team_members.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Команда проекта</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.team_members.map((member, index) => (
                    <div
                      key={index}
                      className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-md p-4"
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-cryptix-green/20 flex items-center justify-center text-cryptix-green mr-3">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{member.name}</div>
                          <div className="text-xs text-gray-400">{member.class}</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-cryptix-green/10 text-cryptix-green inline-block">
                        {member.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Этапы проекта</h3>

              {project.stages.length === 0 ? (
                <div className="text-gray-400 italic">Этапы не определены</div>
              ) : (
                <div className="space-y-4">
                  {project.stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`p-4 border rounded-md ${
                        stage.completed
                          ? 'bg-cryptix-green/10 border-cryptix-green/30'
                          : 'bg-glass-bg backdrop-blur-xs border-glass-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                              stage.completed
                                ? 'bg-cryptix-green text-cryptix-darker'
                                : 'bg-glass-bg border border-glass-border text-gray-400'
                            }`}
                          >
                            {stage.completed ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{stage.name}</h4>
                            {stage.deadline && (
                              <div className={`text-xs ${
                                stage.completed
                                  ? 'text-gray-400'
                                  : isOverdue(stage.deadline)
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                              }`}>
                                Дедлайн: {formatDate(stage.deadline)}
                                {!stage.completed && stage.deadline && isOverdue(stage.deadline) && (
                                  <span className="ml-2 text-red-400">(просрочен)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stage.completed}
                            onChange={(e) => handleStageToggle(stage.id, e.target.checked)}
                            className="form-checkbox h-5 w-5 text-crypto-green-500 rounded border-glass-border bg-crypto-black/50"
                          />
                          <span className="ml-2 text-sm text-gray-300">
                            {stage.completed ? 'Завершен' : 'Завершить'}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProjectDetailPage;