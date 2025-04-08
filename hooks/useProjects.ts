import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (filters?: {
    search?: string;
    status?: string;
    sortBy?: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Проверяем роль пользователя
      const { data: profileData } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      const isAdmin = profileData?.roles === 'admin';

      // Получаем проекты, где пользователь является владельцем или участником
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:owner_id (email, full_name),
          project_members!project_id (id),
          project_stages!project_id (id, completed)
        `);

      // Если пользователь не админ, ограничиваем видимость проектов
      if (!isAdmin) {
        // Пользователь видит все активные проекты и свои проекты в любом статусе
        query = query.or(`status.eq.active,owner_id.eq.${user.id}`);
      }

      // Дополнительно фильтруем по участию в проекте
      // query = query.or(`owner_id.eq.${user.id},project_members.user_id.eq.${user.id}`);

      // Применяем фильтры
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        // Здесь нужно адаптировать под вашу структуру данных
        // Например, если у вас есть поле status в таблице projects
        query = query.eq('status', filters.status);
      }

      // Получаем данные
      const { data, error } = await query;

      if (error) throw error;

      // Обрабатываем данные
      const processedProjects = data.map(project => {
        // Вычисляем прогресс на основе завершенных этапов
        const stages = project.project_stages || [];
        const completedStages = stages.filter((stage: any) => stage.completed).length;
        const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

        // Получаем количество участников
        const membersCount = (project.project_members || []).length;

        return {
          ...project,
          owner: project.profiles,
          progress,
          members_count: membersCount
        };
      });

      // Сортируем проекты
      if (filters?.sortBy) {
        processedProjects.sort((a, b) => {
          switch (filters.sortBy) {
            case 'newest':
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'name':
              return a.name.localeCompare(b.name);
            case 'progress':
              return b.progress - a.progress;
            case 'deadline':
              // Если есть дедлайны, сортируем по ним
              if (a.deadline && b.deadline) {
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              }
              // Проекты без дедлайна в конце
              if (!a.deadline) return 1;
              if (!b.deadline) return -1;
              return 0;
            default:
              return 0;
          }
        });
      }

      setProjects(processedProjects);
    } catch (err: any) {
      console.error('Ошибка при загрузке проектов:', err);
      setError(err.message || 'Не удалось загрузить проекты');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return { projects, isLoading, error, fetchProjects };
};