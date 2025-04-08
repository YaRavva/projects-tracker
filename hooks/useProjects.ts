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
    status?: 'all' | 'active' | 'pending' | 'returned' | 'rejected';
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

      // Если администратор фильтрует по статусу 'pending', показываем только проекты на рассмотрении
      if (isAdmin && filters?.status === 'pending') {
        query = query.eq('status', 'pending');
      }

      // Если администратор фильтрует по статусу 'returned', показываем только возвращенные проекты
      if (isAdmin && filters?.status === 'returned') {
        query = query.eq('status', 'returned');
      }

      // Если администратор фильтрует по статусу 'rejected', показываем только отклоненные проекты
      if (isAdmin && filters?.status === 'rejected') {
        query = query.eq('status', 'rejected');
      }

      // Дополнительно фильтруем по участию в проекте
      // query = query.or(`owner_id.eq.${user.id},project_members.user_id.eq.${user.id}`);

      // Применяем фильтры поиска
      if (filters?.search) {
        console.log('Применяем фильтр поиска:', filters.search);
        query = query.ilike('title', `%${filters.search}%`);
      }

      // Применяем фильтр по статусу, если он указан и не равен 'all'
      // Для администраторов фильтрация уже применена выше
      if (filters?.status && filters.status !== 'all' && !isAdmin) {
        // Для обычных пользователей показываем только активные проекты или их собственные проекты с указанным статусом
        if (filters.status === 'active') {
          query = query.eq('status', 'active');
        } else {
          // Для других статусов показываем только собственные проекты пользователя
          query = query.eq('status', filters.status).eq('owner_id', user.id);
        }
      }

      // Получаем данные
      const { data, error } = await query;

      if (error) throw error;

      // Загружаем информацию об участниках проектов из метаданных
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('project_meta')
        .select('project_id, key, value')
        .eq('key', 'team_members');

      if (teamMembersError) {
        console.error('Ошибка при загрузке данных об участниках:', teamMembersError);
      }

      // Обрабатываем данные
      const processedProjects = data.map(project => {
        // Вычисляем прогресс на основе завершенных этапов
        const stages = project.project_stages || [];
        const completedStages = stages.filter((stage: any) => stage.completed).length;
        const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

        // Получаем количество участников
        const membersCount = (project.project_members || []).length;

        // Находим участников проекта в метаданных
        const teamMembersEntry = teamMembersData?.find(entry => entry.project_id === project.id);
        const teamMembers = teamMembersEntry ? teamMembersEntry.value : [];

        return {
          ...project,
          owner: project.profiles,
          progress,
          members_count: membersCount,
          team_members: teamMembers
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
              return a.title.localeCompare(b.title);
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