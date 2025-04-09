import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ProjectsTable from '../../components/projects/ProjectsTable';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AddProjectModal from '../../components/projects/AddProjectModal';
import ProjectFilters from '../../components/projects/ProjectFilters';
import ProjectModal from '../../components/projects/ProjectModal';
// Удален неиспользуемый импорт useProjects

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  progress: number;
  repository_url: string | null;
  demo_url: string | null;
  owner_id: string;
  status: 'active' | 'pending' | 'returned' | 'rejected';
  review_comment?: string | null;
  profiles: {
    full_name: string;
  };
  team_members?: {
    name: string;
    class: string;
    isLeader: boolean;
  }[];
}

const ProjectsPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  // Не используем хук useProjects, так как загружаем данные напрямую
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для модальных окон
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectModalTab, setProjectModalTab] = useState<'view' | 'edit'>('view');

  // Состояние для фильтров
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  // Удалено неиспользуемое состояние userProfile
  // Инициализируем флаг готовности данных как false, чтобы показывать спиннер до загрузки данных
  const [dataReady, setDataReady] = useState(false);

  // Сбрасываем флаг готовности данных при монтировании компонента и при изменении маршрута
  useEffect(() => {
    // Сбрасываем флаг готовности данных при монтировании
    setDataReady(false);
    setLoading(true);

    // При переходе на страницу проектов сбрасываем флаг готовности данных
    const handleRouteChange = (url: string) => {
      if (url === '/projects') {
        setDataReady(false);
        setLoading(true);
      }
    };

    // Подписываемся на событие изменения маршрута
    if (router.events) {
      router.events.on('routeChangeComplete', handleRouteChange);

      // Отписываемся при размонтировании
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }

    return () => {};
  }, [router]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'newest'
  });

  // Централизованный эффект для загрузки и фильтрации данных
  useEffect(() => {
    // Функция для загрузки данных и их фильтрации
    const loadAndFilterData = async () => {
      // Если это контекстный поиск, не показываем спиннер
      if (filters.search && projects.length > 0) {
        // Для контекстного поиска не сбрасываем флаги
      } else {
        // Сбрасываем флаг готовности данных и устанавливаем состояние загрузки
        setDataReady(false);
        setLoading(true);
      }

      // Проверяем, что пользователь авторизован
      if (!user) {
        setLoading(false);
        return;
      }

      // Если это контекстный поиск и у нас уже есть загруженные проекты
      if (filters.search && projects.length > 0) {
        // Фильтруем существующие проекты по поисковому запросу
        const searchResults = projects.filter(project =>
          project.title.toLowerCase().includes(filters.search.toLowerCase())
        );

        // Применяем фильтр "Показывать только мои проекты"
        if (showOnlyMyProjects) {
          const mySearchResults = searchResults.filter(project => {
            if (project.team_members && project.team_members.length > 0) {
              return project.team_members.some((member: { name: string }) => {
                return member.name === user.user_metadata?.full_name;
              });
            }
            return false;
          });
          setFilteredProjects(mySearchResults);
        } else {
          setFilteredProjects(searchResults);
        }

        // Устанавливаем флаг готовности данных мгновенно
        setLoading(false);
        setDataReady(true);
        return;
      }

      try {
        // Загружаем профиль пользователя
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        // Загружаем профиль пользователя для проверки роли
        const { data: profileRoleData } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();

        const isAdmin = profileRoleData?.roles === 'admin';

        // Загружаем проекты с применением фильтров
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

        // Применяем фильтр по статусу, если он указан и не равен 'all'
        if (filters.status && filters.status !== 'all') {
          if (isAdmin) {
            // Для администраторов показываем проекты с указанным статусом
            query = query.eq('status', filters.status);
          } else {
            // Для обычных пользователей показываем только активные проекты или их собственные проекты с указанным статусом
            if (filters.status === 'active') {
              query = query.eq('status', 'active');
            } else {
              // Для других статусов показываем только собственные проекты пользователя
              query = query.eq('status', filters.status).eq('owner_id', user.id);
            }
          }
        }

        // Применяем фильтр поиска
        if (filters.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }

        // Получаем данные
        const { data: projectsData, error: projectsError } = await query;

        if (projectsError) {
          throw projectsError;
        }

        // Загружаем информацию об участниках проектов
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('project_meta')
          .select('project_id, key, value')
          .eq('key', 'team_members');

        if (teamMembersError) {
          console.error('Ошибка при загрузке данных об участниках:', teamMembersError);
        }

        // Обрабатываем данные
        const processedProjects = (projectsData || []).map(project => {
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
        const sortedProjects = [...processedProjects].sort((a, b) => {
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

        // Обновляем локальное состояние проектов
        setProjects(sortedProjects as Project[]);

        // Применяем фильтр "Показывать только мои проекты"
        if (showOnlyMyProjects && profileData?.full_name && sortedProjects.length > 0) {
          const myProjects = sortedProjects.filter(project => {
            if (project.team_members && project.team_members.length > 0) {
              return project.team_members.some((member: { name: string }) => {
                return member.name === profileData.full_name;
              });
            }
            return false;
          });
          setFilteredProjects(myProjects as Project[]);
        } else {
          setFilteredProjects(sortedProjects as Project[]);
        }

        // Устанавливаем флаг готовности данных
        // Если это контекстный поиск, показываем результаты мгновенно
        if (filters.search) {
          setLoading(false);
          setDataReady(true);
        } else {
          // Для остальных случаев даем минимальную задержку
          setTimeout(() => {
            setLoading(false);
            setDataReady(true);
          }, 50);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Не удалось загрузить проекты');
        setLoading(false);
      }
    };

    // Запускаем загрузку и фильтрацию данных
    loadAndFilterData();

  }, [user?.id, filters, showOnlyMyProjects]);

  // Функция для открытия модального окна редактирования
  const handleEditProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setProjectModalTab('edit');
    setIsProjectModalOpen(true);
  };

  // Функция для открытия модального окна просмотра
  const handleViewProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setProjectModalTab('view');
    setIsProjectModalOpen(true);
  };

  // Функция для закрытия модального окна проекта
  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setCurrentProjectId(null);
  };

  // Функция для обновления списка проектов после редактирования
  const handleProjectUpdated = () => {
    // Сбрасываем флаг готовности данных и перезагружаем данные
    setDataReady(false);
    setLoading(true);
    // Изменение фильтров запустит эффект загрузки данных
    setFilters({ ...filters });
  };

  // Функция для обновления списка проектов после добавления
  const handleProjectAdded = () => {
    // Сбрасываем флаг готовности данных и перезагружаем данные
    setDataReady(false);
    setLoading(true);
    // Изменение фильтров запустит эффект загрузки данных
    setFilters({ ...filters });
  };

  // Функция для обработки изменения фильтров
  const handleFilterChange = (newFilters: {
    search: string;
    status: string;
    sortBy: string;
  }) => {
    // Если это контекстный поиск, не показываем спиннер
    if (newFilters.search && filters.search !== newFilters.search) {
      // Сохраняем флаг готовности данных для контекстного поиска
      setFilters(newFilters);
    } else {
      // Сбрасываем флаг готовности данных для других фильтров
      setDataReady(false);
      setFilters(newFilters);
    }
  };

  const handleCreateProject = () => {
    setIsAddModalOpen(true);
  };

  // Функция для закрытия модального окна добавления
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Функция для переключения фильтра "Показывать только мои проекты"
  const handleToggleMyProjects = () => {
    // Сбрасываем флаг готовности данных при переключении фильтра
    setDataReady(false);
    setShowOnlyMyProjects(!showOnlyMyProjects);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Projects | Digital Projects Tracker</title>
        </Head>

        <div className="container mx-auto px-4 mt-2">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Фильтры проектов */}
          <ProjectFilters initialFilters={filters} onFilterChange={handleFilterChange} />

          <div className="mb-6 mt-8 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showMyProjects"
                  checked={showOnlyMyProjects}
                  onChange={handleToggleMyProjects}
                  className="cursor-pointer"
                />
                <label htmlFor="showMyProjects" className="text-white text-sm cursor-pointer">
                  Показывать только мои проекты
                </label>
              </div>
            </div>
            <button
              onClick={handleCreateProject}
              className="btn-primary"
            >
              Добавить проект
            </button>
          </div>


          {loading || !dataReady ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cryptix-green shadow-glow"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-crypto-black/30 border border-glass-border rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-white mb-4">Проектов пока нет</h3>
              <p className="text-gray-400 mb-6">{projects.length > 0 ? 'Нет проектов, соответствующих выбранным фильтрам' : 'Добавьте первый проект, чтобы начать работу'}</p>
              <button
                onClick={handleCreateProject}
                className="glass-button hover:bg-cryptix-green hover:text-cryptix-darker"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить проект
                </span>
              </button>
            </div>
          ) : (
            <>
              <ProjectsTable
                projects={filteredProjects}
                onEdit={handleEditProject}
                onView={handleViewProject}
              />
            </>
          )}
        </div>

        {/* Модальное окно проекта */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          projectId={currentProjectId}
          onProjectUpdated={handleProjectUpdated}
          defaultTab={projectModalTab}
        />

        {/* Модальное окно добавления проекта */}
        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onProjectAdded={handleProjectAdded}
        />
      </Layout>
    </ProtectedRoute>
  );
};

// Добавляем getServerSideProps, чтобы Next.js не пытался использовать getStaticPaths
export async function getServerSideProps() {
  return {
    props: {}, // Будет передано в компонент ProjectsPage
  };
}

export default ProjectsPage;