import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import ProjectForm from './ProjectForm';
import { useAuth } from '../../contexts/AuthContext';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';
import { formatDate } from '../../lib/dateUtils';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onProjectUpdated: () => void;
  defaultTab?: 'view' | 'edit';
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onProjectUpdated,
  defaultTab = 'view'
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>(defaultTab);

  // Загружаем данные проекта при открытии модального окна
  useEffect(() => {
    if (isOpen && projectId) {
      console.log('Modal opened, fetching project data for ID:', projectId);
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

      setIsAdmin(profileData?.roles === 'admin');
    } catch (err) {
      // Пропускаем ошибки при проверке роли пользователя
    }
  };

  // Функция для загрузки данных проекта
  const fetchProjectData = async () => {
    if (!projectId) return;

    console.log('Fetching project data for ID:', projectId, 'Timestamp:', new Date().toISOString());
    setLoading(true);
    setError(null);

    try {
      // Загружаем основные данные проекта
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, profiles:owner_id(full_name, email)')
        .eq('id', projectId)
        .single();

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

      console.log('Loaded project stages:', stages);

      if (stagesError) throw stagesError;

      // Загружаем комментарии к проекту из таблицы project_reviews
      let processedReviews = [];

      try {
        // Загружаем комментарии из таблицы project_reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('project_reviews')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        console.log('Loaded reviews:', reviews);

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
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }

      // Обрабатываем метаданные
      const teamMembersItem = metaData?.find(item => item.key === 'team_members');
      const teamMembers = teamMembersItem?.value || [];

      // Формируем полные данные проекта
      console.log('Preparing full project data with stages:', stages);

      // Проверяем формат дат этапов
      if (stages && stages.length > 0) {
        stages.forEach((stage, index) => {
          console.log(`Stage ${index} deadline:`, stage.deadline, 'type:', typeof stage.deadline);

          // Добавляем поле display_deadline для отображения в формате дд.мм.гг
          if (stage.deadline) {
            try {
              // Проверяем, что дата в формате ISO (YYYY-MM-DD)
              if (typeof stage.deadline === 'string' && !stage.deadline.match(/^\d{4}-\d{2}-\d{2}$/)) {
                console.log(`Stage ${index} deadline is not in ISO format:`, stage.deadline);
                // Преобразуем дату в формат ISO
                const date = new Date(stage.deadline);
                stage.deadline = date.toISOString().split('T')[0];
                console.log(`Converted stage ${index} deadline to ISO format:`, stage.deadline);
              }

              const date = new Date(stage.deadline);
              stage.display_deadline = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              });
              console.log(`Added display_deadline for stage ${index}:`, stage.display_deadline);
            } catch (e) {
              console.error(`Error formatting date for stage ${index}:`, e);
            }
          }
        });
      }

      const fullProjectData = {
        ...project,
        team_members: teamMembers,
        stages: stages || [],
        reviews: processedReviews
      };

      console.log('Full project data prepared:', fullProjectData);

      setProjectData(fullProjectData);
      setNewStatus(fullProjectData.status);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить данные проекта');
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления статуса и/или добавления комментария
  const handleUpdateStatus = async () => {
    if (!projectId || !user) {
      return false; // Возвращаем false, если не удалось сохранить
    }

    // Проверяем, что есть комментарий или пользователь администратор и меняет статус
    const hasComment = comment.trim().length > 0;
    const isStatusChange = isAdmin && newStatus !== projectData.status;

    if (!hasComment && !isStatusChange) {
      return false; // Возвращаем false, если нечего сохранять
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

      // Добавляем комментарий в таблицу project_reviews
      const commentData = {
        project_id: projectId,
        reviewer_id: user?.id || '',
        status: isAdmin ? newStatus : projectData.status,
        comment: comment.trim(),
        status_changed: isAdmin && newStatus !== projectData.status
      };

      console.log('Adding comment:', commentData);

      const { data: insertedReview, error: insertReviewError } = await supabase
        .from('project_reviews')
        .insert(commentData)
        .select();

      console.log('Insert result:', { insertedReview, insertReviewError });

      if (insertReviewError) {
        console.error('Error inserting comment:', insertReviewError);
        throw insertReviewError;
      }

      // Обновляем данные проекта
      console.log('Comment added successfully');

      // Добавляем новый комментарий в локальное состояние
      if (projectData && projectData.reviews) {
        const newComment = {
          id: insertedReview?.[0]?.id || `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          comment: comment.trim(),
          status: isAdmin ? newStatus : projectData.status,
          reviewer_id: user.id,
          reviewer_name: user.email?.split('@')[0] || 'Пользователь',
          reviewer_roles: isAdmin ? 'admin' : 'student',
          status_changed: isAdmin && newStatus !== projectData.status
        };

        const updatedReviews = [newComment, ...projectData.reviews];
        setProjectData({
          ...projectData,
          reviews: updatedReviews,
          status: isAdmin ? newStatus : projectData.status
        });
      }

      // Вызываем колбэк для обновления списка проектов
      onProjectUpdated();

      // Очищаем поле комментария
      setComment('');

      // Обновляем данные проекта
      fetchProjectData();

      return true; // Возвращаем true, если сохранение прошло успешно

      // Статус уже обновлен в списке проектов через onProjectUpdated
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить статус проекта');
      return false; // Возвращаем false в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления комментария
  const handleDeleteComment = async (commentId: string, reviewerId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Deleting comment with ID:', commentId, 'by reviewer:', reviewerId);

      // Проверяем роль автора комментария
      const { data: reviewerData, error: reviewerError } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', reviewerId)
        .single();

      if (reviewerError) {
        console.error('Error fetching reviewer data:', reviewerError);
      }

      const isReviewerAdmin = reviewerData?.roles === 'admin';
      const isOwnComment = user.id === reviewerId;
      const isProjectOwner = projectData?.owner_id === user.id;

      console.log('Permission check:', {
        isReviewerAdmin,
        isOwnComment,
        isProjectOwner,
        isAdmin,
        currentUserId: user.id,
        projectOwnerId: projectData?.owner_id
      });

      // Проверяем права на удаление
      if (isOwnComment || isAdmin || (isProjectOwner && !isReviewerAdmin)) {
        console.log('User has permission to delete comment');

        // Пытаемся удалить комментарий из базы данных
        try {
          // Удаляем комментарий из базы данных
          const { error: deleteError } = await supabase
            .from('project_reviews')
            .delete()
            .eq('id', commentId);

          console.log('Delete result:', { deleteError });

          if (deleteError) {
            console.error('Error deleting comment:', deleteError);
          }
        } catch (deleteErr) {
          console.error('Exception during delete operation:', deleteErr);
          // Продолжаем выполнение, не выбрасывая ошибку
        }

        // Обновляем список комментариев в локальном состоянии
        if (projectData && projectData.reviews) {
          console.log('Updating local state to remove comment with ID:', commentId);
          const updatedReviews = projectData.reviews.filter((review: any) => review.id !== commentId);
          setProjectData({
            ...projectData,
            reviews: updatedReviews
          });
        }

        // Снимаем флаг загрузки
        setLoading(false);

        // Вызываем колбэк для обновления списка проектов
        onProjectUpdated();

        // Обновляем данные проекта
        fetchProjectData();
      } else {
        console.log('User does not have permission to delete this comment');
        setError('У вас нет прав на удаление этого комментария');
        // Снимаем флаг загрузки
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error in handleDeleteComment:', err);
      setError(err.message || 'Не удалось удалить комментарий');
      // Снимаем флаг загрузки
      setLoading(false);
    }
  };

  // Обработчик успешного обновления проекта
  const handleProjectUpdated = () => {
    console.log('handleProjectUpdated called');
    // Обновляем данные проекта
    fetchProjectData();
    // Вызываем коллбэк для обновления списка проектов
    onProjectUpdated();
    // Закрываем модальное окно
    handleClose();
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    console.log('Modal closing');

    // Вызываем колбэк для обновления списка проектов
    onProjectUpdated();

    // Закрываем модальное окно
    onClose();
  };

  // Содержимое вкладки "Просмотр"
  const renderViewTab = () => (
    <div className="space-y-6">
      {/* Заголовок и статус */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">{projectData.title}</h2>
        <div className="flex items-center space-x-2">
          <ProjectStatusBadge status={projectData.status} />
        </div>
      </div>

      {/* Основная информация */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-medium text-white mb-3">Информация о проекте</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Описание</p>
            <p className="text-white">{projectData.description || 'Нет описания'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Добавил</p>
            <p className="text-white">{projectData.profiles?.full_name || 'Неизвестно'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Дата создания</p>
            <p className="text-white">{formatDate(projectData.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Дедлайн</p>
            <p className="text-white">{projectData.deadline ? formatDate(projectData.deadline) : 'Не указан'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Прогресс</p>
            <div className="w-full bg-glass-bg h-2 rounded-full overflow-hidden">
              <div
                className="bg-cryptix-green h-full rounded-full"
                style={{ width: `${projectData.progress || 0}%` }}
              ></div>
            </div>
            <p className="text-white text-xs mt-1 text-left">{projectData.progress || 0}%</p>
          </div>
          <div>
            {(projectData.repository_url || projectData.demo_url) && (
              <>
                <p className="text-gray-400 text-sm mb-1">Ссылки</p>
                <div className="flex flex-row space-x-3">
                  {projectData.repository_url && (
                    <a
                      href={projectData.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-cryptix-green/10 text-cryptix-green text-sm font-medium rounded-md border border-cryptix-green/30 hover:bg-cryptix-green/20 transition-colors max-w-fit"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Репозиторий
                    </a>
                  )}
                  {projectData.demo_url && (
                    <a
                      href={projectData.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-cryptix-green/10 text-cryptix-green text-sm font-medium rounded-md border border-cryptix-green/30 hover:bg-cryptix-green/20 transition-colors max-w-fit"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Демо-версия
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Участники команды */}
      {projectData.team_members && projectData.team_members.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-lg font-medium text-white mb-3">Участники команды</h3>
          <ul className="space-y-2">
            {projectData.team_members.map((member: any, index: number) => (
              <li key={index} className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${member.isLeader ? 'bg-cryptix-green' : 'bg-gray-400'} mr-2`}></div>
                <span className="text-white">{member.name}</span>
                {member.class && <span className="text-gray-400 ml-2">{member.class}</span>}
                {member.isLeader && <span className="text-cryptix-green ml-2 text-xs"></span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Этапы проекта */}
      {projectData.stages && projectData.stages.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-lg font-medium text-white mb-3">Этапы проекта</h3>
          <ul className="space-y-3">
            {projectData.stages.map((stage: any, index: number) => (
              <li key={index} className="flex items-start">
                <div className="mt-1">
                  {stage.completed ? (
                    <svg className="w-5 h-5 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

      {/* Комментарии */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-medium text-white mb-3">Комментарии</h3>
        {projectData.reviews && projectData.reviews.length > 0 ? (
          <div className="space-y-3">
            {projectData.reviews.map((review: any, index: number) => (
              <div key={review.id} className={`p-3 rounded-md ${index === 0 ? 'bg-cryptix-green/10 border border-cryptix-green/20' : 'bg-cryptix-darker/50 border border-glass-border'}`}>
                {/* Раскомментируйте для отладки */}
                {/* <div className="text-xs text-gray-500 mb-1">ID: {review.id} (type: {typeof review.id})</div> */}
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
                      // 2. Админ
                      // 3. Владелец проекта может удалять комментарии не от админа
                      (user.id === review.reviewer_id || // Свой комментарий
                       isAdmin || // Админ
                       (projectData?.owner_id === user.id && // Владелец проекта
                        (!review.reviewer_roles || review.reviewer_roles !== 'admin'))) && // Не комментарий админа
                      <button
                        onClick={() => {
                          console.log('Delete button clicked for review:', review);
                          handleDeleteComment(review.id, review.reviewer_id);
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
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
        ) : (
          <p className="text-gray-400">Нет комментариев</p>
        )}

        {/* Форма добавления комментария */}
        <div className="mt-6">
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
                    <option value="pending">На рассмотрении</option>
                    <option value="active">Активный</option>
                    <option value="returned">Возвращен на доработку</option>
                    <option value="rejected">Отклонен</option>
                    <option value="completed">Завершен</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Поле для комментария */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
                Комментарий
              </label>
              <textarea
                id="comment"
                rows={3}
                className="w-full px-3 py-2 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30 focus:border-cryptix-green/50"
                placeholder="Введите комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-cryptix-green/80 to-cryptix-green text-black font-medium rounded-md shadow-lg hover:shadow-cryptix-green/20 transition-all duration-300 flex items-center justify-center min-w-[200px]"
                onClick={async () => {
                  const success = await handleUpdateStatus();
                  if (success !== false) {
                    handleClose();
                  }
                }}
                disabled={loading || !(comment.trim() || (isAdmin && newStatus !== projectData.status))}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Содержимое вкладки "Редактирование"
  const renderEditTab = () => {
    console.log('Rendering edit tab with projectData:', projectData);
    if (projectData && projectData.stages) {
      console.log('Project stages:', projectData.stages);
    }

    return (
      <ProjectForm
        initialData={projectData}
        mode="edit"
        onSuccess={handleProjectUpdated}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Проект"
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
        <Tabs
          tabs={[
            {
              id: 'view',
              label: 'Просмотр',
              content: renderViewTab()
            },
            ...(isAdmin || isOwner ? [
              {
                id: 'edit',
                label: 'Редактирование',
                content: renderEditTab()
              }
            ] : [])
          ]}
          defaultTab={activeTab}
          onChange={(tabId) => {
            console.log('Tab changed to:', tabId);
            setActiveTab(tabId as 'view' | 'edit');
            if (tabId === 'edit') {
              // Обновляем данные проекта при переключении на вкладку редактирования
              fetchProjectData();
            }
          }}
        />
      ) : (
        <div className="text-center text-gray-400 py-8">
          Проект не найден
        </div>
      )}
    </Modal>
  );
};

export default ProjectModal;
