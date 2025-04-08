import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/dateUtils';
import ProjectStatusBadge, { ProjectStatus } from './ProjectStatusBadge';

interface ReviewRecord {
  id: string;
  project_id: string;
  reviewer_id: string;
  status: ProjectStatus;
  comment: string | null;
  created_at: string;
  reviewer?: {
    full_name: string;
    email: string;
  };
}

interface ProjectReviewHistoryProps {
  projectId: string;
}

const ProjectReviewHistory: React.FC<ProjectReviewHistoryProps> = ({ projectId }) => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('project_reviews')
          .select(`
            *,
            reviewer:reviewer_id (
              full_name,
              email
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setReviews(data || []);
      } catch (err) {
        console.error('Ошибка при загрузке истории рассмотрения:', err);
        setError('Не удалось загрузить историю рассмотрения проекта');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewHistory();
  }, [projectId]);

  if (loading) {
    return (
      <div className="glass-card mt-6">
        <div className="glass-card-body">
          <h3 className="text-lg font-semibold text-white mb-4">История рассмотрения</h3>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-crypto-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card mt-6">
        <div className="glass-card-body">
          <h3 className="text-lg font-semibold text-white mb-4">История рассмотрения</h3>
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="glass-card mt-6">
        <div className="glass-card-body">
          <h3 className="text-lg font-semibold text-white mb-4">История рассмотрения</h3>
          <p className="text-gray-400">История рассмотрения проекта пуста</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card mt-6">
      <div className="glass-card-body">
        <h3 className="text-lg font-semibold text-white mb-4">История рассмотрения</h3>
        
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-glass-border pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <ProjectStatusBadge status={review.status} />
                  <span className="ml-2 text-gray-400 text-sm">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {review.reviewer?.full_name || review.reviewer?.email || 'Неизвестный пользователь'}
                </span>
              </div>
              
              {review.comment && (
                <div className="mt-2 text-gray-300 text-sm bg-crypto-black/30 p-3 rounded-md">
                  {review.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectReviewHistory;
