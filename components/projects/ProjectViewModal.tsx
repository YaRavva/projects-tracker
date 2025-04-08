import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';
import { formatDate } from '../../lib/dateUtils';

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onEdit?: (projectId: string) => void;
  onProjectUpdated: () => void;
}

const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onEdit,
  onProjectUpdated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus | ''>('');

  // Загружаем данные проекта при открытии модального окна
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectData();
      checkUserRole();
    }
  }, [isOpen, projectId, user]);

  // Проверяем роль пользователя
  const checkUserRole = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const isUserAdmin = profileData?.roles === 'admin';
      console.log('Роль пользователя:', { userId: user.id, role: profileData?.roles, isAdmin: isUserAdmin });
      setIsAdmin(isUserAdmin);
    } catch (err) {
      console.error('Ошибка при проверке роли пользователя:', err);
    }
  };

  // Функция для загрузки данных проекта
  const fetchProjectData = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    console.log('Загрузка данных проекта:', { projectId });

    try {
      // Загружаем основные данные проекта
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, profiles:owner_id(full_name, email)')
        .eq('id', projectId)
        .single();

      console.log('Получены данные проекта:', project);

      if (projectError) throw projectError;

      // Проверяем, является ли текущий пользователь владельцем проекта
      setIsOwner(user?.id === project.owner_id);

      // Загружаем метаданные проекта (участники команды)
      const { data: metaData, error: metaError } = await supabase
        .from('project_meta')
        .select('key, value')
        .eq('project_id', projectId);

      if (metaError) throw metaError;

      // Загружаем этапы проекта
      const { data: stages, error: stagesError } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('id', { ascending: true });

      if (stagesError) throw stagesError;

      // Загружаем комментарии к проекту из всех источников
      let processedReviews = [];

      try {
        // Пробуем загрузить комментарии из таблицы project_reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('project_reviews')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        // Если таблица project_reviews существует и есть комментарии
        if (!reviewsError && reviews && reviews.length > 0) {
          // Загружаем имена и роли пользователей для комментариев
          const reviewerIds = [...new Set(reviews.map(review => review.reviewer_id))];

          const { data: reviewers } = await supabase
            .from('profiles')
            .select('id, full_name, roles')
            .in('id', reviewerIds);

          // Добавляем имена и роли пользователей к комментариям
          processedReviews = reviews.map(review => {
            const reviewer = reviewers?.find(r => r.id === review.reviewer_id);
            return {
              ...review,
              reviewer_name: reviewer?.full_name || 'Пользователь',
              reviewer_roles: reviewer?.roles
            };
          });
        } else {
          // Если таблица project_reviews не существует, загружаем комментарии из метаданных
          const { data: commentsData, error: commentsError } = await supabase
            .from('project_meta')
            .select('*')
            .eq('project_id', projectId)
            .eq('key', 'comment')
            .order('created_at', { ascending: false });

          if (!commentsError && commentsData && commentsData.length > 0) {
            // Преобразуем метаданные в комментарии
            for (const commentMeta of commentsData) {
              try {
                const commentData = typeof commentMeta.value === 'string'
                  ? JSON.parse(commentMeta.value)
                  : commentMeta.value;

                // Загружаем роль автора комментария
                const { data: reviewerData } = await supabase
                  .from('profiles')
                  .select('roles')
                  .eq('id', commentData.author_id)
                  .single();

                processedReviews.push({
                  id: commentMeta.id,
                  created_at: commentMeta.created_at,
                  comment: commentData.text,
                  status: commentData.status || 'pending',
                  reviewer_name: commentData.author || 'Пользователь',
                  reviewer_id: commentData.author_id,
                  reviewer_roles: reviewerData?.roles,
                  status_changed: commentData.status_changed || false
                });
              } catch (e) {
                // Пропускаем ошибки при обработке комментариев
              }
            }

            // Сортируем комментарии по дате (сначала новые)
            processedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        }
      } catch (error) {
        // Пропускаем ошибки при загрузке комментариев
      }

      // Обрабатываем метаданные
      const teamMembersItem = metaData?.find(item => item.key === 'team_members');
      const teamMembers = teamMembersItem?.value || [];

      // Формируем полные данные проекта
      const fullProjectData = {
        ...project,
        team_members: teamMembers,
        stages: stages || [],
        reviews: processedReviews
      };

      setProjectData(fullProjectData);
      setNewStatus(fullProjectData.status);
    } catch (err: any) {
      console.error('Ошибка при загрузке данных проекта:', err);
      setError(err.message || 'Не удалось загрузить данные проекта');
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления статуса и/или добавления комментария
  const handleUpdateStatus = async () => {
    if (!projectId) {
      return;
    }

    // Проверяем, что есть комментарий или пользователь администратор
    if (!comment.trim() && !(isAdmin && newStatus !== projectData.status)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Если пользователь администратор, обновляем статус проекта
      if (isAdmin && newStatus && newStatus !== projectData.status) {
        // Обновляем статус проекта
        const { data, error: updateError } = await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', projectId)
          .select();

        if (updateError) {
          throw updateError;
        } else {
          // Обновляем локальные данные проекта
          setProjectData(prev => ({
            ...prev,
            status: newStatus
          }));
        }
      }

      // Проверяем, существует ли таблица project_reviews
      try {
        // Добавляем комментарий в таблицу project_reviews
        const { error: insertReviewError } = await supabase
          .from('project_reviews')
          .insert({
            project_id: projectId,
            reviewer_id: user?.id || '',
            status: isAdmin ? newStatus : projectData.status,
            comment: comment.trim(),
            status_changed: isAdmin && newStatus !== projectData.status
          });

        if (insertReviewError) {
          // Если таблица не существует, сохраняем комментарий в метаданных
          if (insertReviewError.code === '42P01' || insertReviewError.code === '404') {

            // Получаем имя пользователя
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user?.id || '')
              .single();

            // Создаем объект с данными комментария
            const commentData = {
              text: comment.trim(),
              status: isAdmin ? newStatus : projectData.status,
              author: profileData?.full_name || 'Пользователь',
              author_id: user?.id || '',
              status_changed: isAdmin && newStatus !== projectData.status
            };

            // Сохраняем комментарий в метаданных
            const { error: metaError } = await supabase
              .from('project_meta')
              .insert({
                project_id: projectId,
                key: 'comment',
                value: commentData
              });

            if (metaError) {
              throw metaError;
            }
          } else {
            throw insertReviewError;
          }
        }
      } catch (error) {
        throw error;
      }

      // Обновляем данные проекта
      await fetchProjectData();
      onProjectUpdated();
      setComment('');

      // Перезагружаем страницу, чтобы обновить статус в списке проектов
      if (isAdmin && newStatus && newStatus !== projectData.status) {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить статус проекта');
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления комментария
  const handleDeleteComment = async (commentId: string, reviewerId: string) => {
    if (!user) return;

    try {
      setLoading(true);

      // Проверяем права на удаление
      // 1. Все пользователи могут удалять свои комментарии
      // 2. Владельцы проекта могут удалять все комментарии к своему проекту, кроме комментариев админа
      // 3. Админы могут удалять любые комментарии

      // Проверяем роль автора комментария
      const { data: reviewerData } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', reviewerId)
        .single();

      const isReviewerAdmin = reviewerData?.roles === 'admin';
      const isOwnComment = user.id === reviewerId;
      const isProjectOwner = projectData?.owner_id === user.id;

      // Проверяем права на удаление
      if (isOwnComment || isAdmin || (isProjectOwner && !isReviewerAdmin)) {
        // Удаляем комментарий
        const { error: deleteError } = await supabase
          .from('project_reviews')
          .delete()
          .eq('id', commentId);

        if (deleteError) {
          throw deleteError;
        }

        // Обновляем данные проекта
        await fetchProjectData();
      } else {
        setError('У вас нет прав на удаление этого комментария');
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось удалить комментарий');
    } finally {
      setLoading(false);
    }
  };

  // Функция для перехода к редактированию проекта
  const handleEditClick = () => {
    if (onEdit && projectId) {
      onClose();
      onEdit(projectId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Просмотр проекта"
      size="lg"
      statusBadge={projectData && <ProjectStatusBadge status={projectData.status as ProjectStatus} />}
    >
      {loading && !projectData ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cryptix-green"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      ) : projectData ? (
        <div className="space-y-6">
          {/* Заголовок и статус */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{projectData.title}</h2>
            <div className="flex items-center space-x-2">
              <ProjectStatusBadge status={projectData.status} />
              {(isAdmin || isOwner) && (
                <button
                  onClick={handleEditClick}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Редактировать"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Описание</h3>
                <p className="text-white">{projectData.description || 'Нет описания'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Добавил</h3>
                <p className="text-white">{projectData.profiles?.full_name || 'Не указан'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Дата создания</h3>
                <p className="text-white">{formatDate(projectData.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Дедлайн</h3>
                <p className="text-white">{projectData.deadline ? formatDate(projectData.deadline) : 'Не указан'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Участники</h3>
                {projectData.team_members && projectData.team_members.length > 0 ? (
                  <div className="space-y-2">
                    {projectData.team_members.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center">
                        <span className={`text-sm ${member.isLeader ? 'text-cryptix-green font-medium' : 'text-white'}`}>
                          {member.name || 'Имя не указано'} {member.isLeader && '(Лидер)'} - {member.class || 'Класс не указан'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Не указаны</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Прогресс</h3>
                <div className="progress-bar w-full">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${projectData.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-cryptix-green">{projectData.progress}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Ссылки</h3>
                <div className="flex flex-col space-y-2">
                  {projectData.repository_url ? (
                    <a
                      href={projectData.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cryptix-green hover:underline flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Репозиторий
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">Репозиторий не указан</span>
                  )}

                  {projectData.demo_url ? (
                    <a
                      href={projectData.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cryptix-green hover:underline flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Демо
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">Демо не указано</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Этапы проекта */}
          {projectData.stages && projectData.stages.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Этапы проекта</h3>
              <div className="space-y-3">
                {projectData.stages.map((stage: any, idx: number) => (
                  <div key={idx} className="glass-card p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{stage.name}</h4>
                        {stage.deadline && (
                          <p className="text-sm text-gray-400">
                            Дедлайн: {formatDate(stage.deadline)}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stage.completed
                          ? 'bg-cryptix-green/20 text-cryptix-green'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {stage.completed ? 'Завершен' : 'В процессе'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Комментарии к проекту */}
          {projectData.reviews && projectData.reviews.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-lg font-medium text-white mb-4">Комментарии</h3>
              <div className="space-y-4">
                {projectData.reviews.map((review: any, index: number) => (
                  <div key={review.id} className={`p-3 rounded-md ${index === 0 ? 'bg-cryptix-green/10 border border-cryptix-green/20' : 'bg-cryptix-darker/50 border border-glass-border'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-medium text-white">{review.reviewer_name || 'Пользователь'}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(review.created_at).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Показываем бейдж со статусом только если в этом комментарии админ изменил статус */}
                        {review.status_changed ? (
                          <ProjectStatusBadge status={review.status as ProjectStatus} />
                        ) : null}
                        {user && (
                          // Показываем кнопку удаления только если у пользователя есть права на удаление
                          // 1. Свой комментарий
                          // 2. Владелец проекта может удалять комментарии не от админа
                          // 3. Админ может удалять любые комментарии
                          (user.id === review.reviewer_id || // Свой комментарий
                           isAdmin || // Админ
                           (projectData?.owner_id === user.id && // Владелец проекта
                            (!review.reviewer_roles || review.reviewer_roles !== 'admin'))) && // Не комментарий админа
                          <button
                            onClick={() => handleDeleteComment(review.id, review.reviewer_id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Удалить комментарий"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Форма добавления комментария */}
          <div className="glass-card p-4 mt-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {isAdmin ? 'Изменить статус и добавить комментарий' : 'Добавить комментарий'}
            </h3>
            <div className="space-y-4">
              {/* Выбор статуса (только для админов) */}
              {isAdmin && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                    Статус
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      className="w-full px-3 py-2 h-10 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50 appearance-none"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                    >
                      <option value="active">Активный</option>
                      <option value="pending">На рассмотрении</option>
                      <option value="returned">Возвращен</option>
                      <option value="rejected">Отклонен</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Поле для комментария (для всех пользователей) */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
                  Комментарий
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  className="w-full px-3 py-2 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50"
                  placeholder="Добавьте комментарий..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-cryptix-green/20 hover:bg-cryptix-green/30 text-cryptix-green border border-cryptix-green/30 rounded-md transition-colors"
                  onClick={handleUpdateStatus}
                  disabled={loading || (!comment.trim() && !(isAdmin && newStatus !== projectData.status))}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          Проект не найден
        </div>
      )}
    </Modal>
  );
};

export default ProjectViewModal;
