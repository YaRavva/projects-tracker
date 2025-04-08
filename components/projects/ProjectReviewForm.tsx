import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProjectStatus } from './ProjectStatusBadge';

interface ProjectReviewFormProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusUpdated?: () => void;
}

const ProjectReviewForm: React.FC<ProjectReviewFormProps> = ({
  projectId,
  currentStatus,
  onStatusUpdated
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Функция для обновления статуса проекта
  const updateProjectStatus = async (action: 'approve' | 'reject' | 'return') => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Определяем новый статус в зависимости от действия
      let newStatus: ProjectStatus;
      let actionText: string;

      switch (action) {
        case 'approve':
          newStatus = 'active';
          actionText = 'утвержден';
          break;
        case 'reject':
          newStatus = 'rejected';
          actionText = 'отклонен';
          break;
        case 'return':
          newStatus = 'returned';
          actionText = 'возвращен на доработку';
          break;
        default:
          throw new Error('Неизвестное действие');
      }

      // Проверяем, что комментарий заполнен для отклонения и возврата
      if ((action === 'reject' || action === 'return') && !comment.trim()) {
        setError('Необходимо добавить комментарий');
        setLoading(false);
        return;
      }

      // Отправляем запрос на обновление статуса
      const response = await fetch('/api/projects/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении статуса проекта');
      }

      // Обновляем статус проекта напрямую в базе данных
      // (это временное решение, пока не реализован API)
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status: newStatus,
          review_comment: action !== 'approve' ? comment.trim() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      // Добавляем запись в историю рассмотрения
      const { error: reviewError } = await supabase
        .from('project_reviews')
        .insert([
          {
            project_id: projectId,
            reviewer_id: (await supabase.auth.getUser()).data.user?.id,
            status: newStatus,
            comment: action !== 'approve' ? comment.trim() : null
          }
        ]);

      if (reviewError) throw reviewError;

      setSuccess(`Проект успешно ${actionText}`);
      setComment('');

      // Вызываем коллбэк для обновления UI
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении статуса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card mt-6">
      <div className="glass-card-body">
        <h3 className="text-lg font-semibold text-white mb-4">Рассмотрение проекта</h3>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-cryptix-green/20 border border-cryptix-green/30 text-cryptix-green px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
            Комментарий (обязателен для отклонения и возврата)
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
            placeholder="Укажите причину отклонения или комментарии для доработки..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {currentStatus !== 'active' && (
            <button
              type="button"
              className="btn-success"
              onClick={() => updateProjectStatus('approve')}
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Утвердить проект'}
            </button>
          )}

          {currentStatus !== 'rejected' && (
            <button
              type="button"
              className="btn-danger"
              onClick={() => updateProjectStatus('reject')}
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Отклонить проект'}
            </button>
          )}

          {currentStatus !== 'returned' && currentStatus !== 'active' && (
            <button
              type="button"
              className="btn-warning"
              onClick={() => updateProjectStatus('return')}
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Вернуть на доработку'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectReviewForm;
