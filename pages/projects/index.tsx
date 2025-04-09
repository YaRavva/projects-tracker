import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ProjectsTable from '../../components/projects/ProjectsTable';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AddProjectModal from '../../components/projects/AddProjectModal';
import ProjectFilters from '../../components/projects/ProjectFilters';
import ProjectModal from '../../components/projects/ProjectModal';
import { useProjects } from '../../hooks/useProjects';

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
  const { projects: allProjects, isLoading, error, fetchProjects } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояние для модальных окон
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectModalTab, setProjectModalTab] = useState<'view' | 'edit'>('view');

  // Состояние для фильтров
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'newest'
  });

  // Функция для загрузки проектов (устарела, используется хук useProjects)
  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Запрашиваем все проекты и связанные профили
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) throw projectsError;

      // Запрашиваем все профили
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Запрашиваем информацию об участниках проектов
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('project_meta')
        .select('project_id, key, value')
        .eq('key', 'team_members');

      if (teamMembersError) throw teamMembersError;

      // Объединяем данные проектов и профилей
      console.log('Projects data:', projectsData);
      console.log('Profiles data:', profilesData);
      console.log('Team members data:', teamMembersData);

      // Дополнительная отладочная информация о структуре данных участников
      if (teamMembersData && teamMembersData.length > 0) {
        console.log('Пример данных участников:', teamMembersData[0]);
        console.log('Тип данных value:', typeof teamMembersData[0].value);
        console.log('Структура value:', JSON.stringify(teamMembersData[0].value, null, 2));
      }

      // Добавляем информацию о пользователях и участниках в проекты
      const projectsWithProfiles = (projectsData || []).map(project => {
        // Находим профиль добавившего проект
        const ownerProfile = profilesData?.find(profile => profile.id === project.owner_id);

        // Находим участников проекта
        const teamMembersEntry = teamMembersData?.find(entry => entry.project_id === project.id);

        // Дополнительная отладочная информация о структуре данных участников конкретного проекта
        if (teamMembersEntry) {
          console.log(`Участники проекта ${project.title}:`, teamMembersEntry);
          console.log(`Тип данных value для проекта ${project.title}:`, typeof teamMembersEntry.value);
          console.log(`Структура value для проекта ${project.title}:`, JSON.stringify(teamMembersEntry.value, null, 2));
        }

        const teamMembers = teamMembersEntry ? teamMembersEntry.value : [];

        return {
          ...project,
          profiles: ownerProfile || { full_name: 'Не указан' },
          team_members: teamMembers
        };
      });

      console.log('Projects with profiles:', projectsWithProfiles);
      setProjects(projectsWithProfiles);
    } catch (err: any) {
      console.error('Ошибка при загрузке проектов:', err);
      setError(err.message || 'Не удалось загрузить проекты');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка профиля пользователя
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('User profile loaded:', data);
      setUserProfile(data);
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects(filters);
      fetchUserProfile();
    }
  }, [user?.id, filters]);

  // Обновляем локальное состояние проектов при изменении данных из хука
  useEffect(() => {
    // Устанавливаем состояние загрузки и обновляем проекты
    setLoading(isLoading);
    setProjects(allProjects as Project[]);
  }, [allProjects, isLoading]);

  // Фильтрация проектов при изменении фильтра или списка проектов
  useEffect(() => {
    // Если нет проектов или фильтр выключен, показываем все проекты
    if (projects.length === 0 || !showOnlyMyProjects || !user) {
      setFilteredProjects(projects);
      return;
    }

    // Фильтруем проекты по участию пользователя
    const myProjects = projects.filter(project => {
      // Проверяем, есть ли пользователь среди участников проекта
      if (!userProfile || !userProfile.full_name) {
        console.log('User profile not loaded yet');
        return false;
      }

      if (project.team_members && project.team_members.length > 0) {
        // Получаем имя пользователя из профиля
        const userFullName = userProfile.full_name;
        console.log(`Checking if user ${userFullName} is in project ${project.title} team members:`, project.team_members);

        // Проверяем по имени пользователя
        return project.team_members.some(member => {
          const match = member.name === userFullName;
          if (match) {
            console.log(`Found match for user ${userFullName} in project ${project.title}`);
          }
          return match;
        });
      }
      return false;
    });

    console.log('Filtered projects:', myProjects);

    setFilteredProjects(myProjects);
  }, [showOnlyMyProjects, projects, user?.id, userProfile]);

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
    fetchProjects(filters);
  };

  // Функция для обновления списка проектов после добавления
  const handleProjectAdded = () => {
    fetchProjects(filters);
  };

  // Функция для обработки изменения фильтров
  const handleFilterChange = (newFilters: {
    search: string;
    status: string;
    sortBy: string;
  }) => {
    setFilters(newFilters);
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
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