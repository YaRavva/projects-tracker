import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ProjectsTable from '../../components/projects/ProjectsTable';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EditProjectModal from '../../components/projects/EditProjectModal';
import AddProjectModal from '../../components/projects/AddProjectModal';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  progress: number;
  repository_url: string | null;
  demo_url: string | null;
  owner_id: string; // Добавляем поле owner_id
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для модальных окон
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Состояние для фильтра "Показывать только мои проекты"
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Функция для загрузки проектов
  const fetchProjects = async () => {
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

  useEffect(() => {
    fetchProjects();
  }, [user]);

  // Фильтрация проектов при изменении фильтра или списка проектов
  useEffect(() => {
    // Если фильтр выключен, показываем все проекты
    if (!showOnlyMyProjects || !user) {
      setFilteredProjects(projects);
      return;
    }

    // Получаем имя пользователя из профиля
    const fetchUserProfile = async () => {
      try {
        // Получаем профиль пользователя
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Ошибка при получении профиля пользователя:', profileError);
          setFilteredProjects(projects);
          return;
        }

        const userFullName = profileData?.full_name || '';
        console.log('Имя пользователя из профиля:', userFullName);

        // Фильтруем проекты, где пользователь является участником
        const myProjects = projects.filter(project => {

          // Проверяем, есть ли участники в проекте
          if (!project.team_members || project.team_members.length === 0) {
            return false;
          }

          // Проверяем, есть ли имя пользователя среди участников проекта
          try {
            console.log(`Проект ${project.title} - участники:`, project.team_members);

            if (Array.isArray(project.team_members)) {
              // Выводим всех участников проекта для отладки
              console.log(`Участники проекта ${project.title}:`);
              project.team_members.forEach((member, index) => {
                if (member && typeof member === 'object' && 'name' in member) {
                  console.log(`Участник ${index}: ${member.name}`);
                }
              });

              // Проверяем, есть ли имя пользователя среди имен участников
              console.log(`Ищем пользователя ${userFullName} среди участников...`);

              const isUserInTeam = project.team_members.some(member => {
                if (member && typeof member === 'object' && 'name' in member) {
                  const memberName = member.name || '';
                  const isMatch = memberName === userFullName;

                  if (isMatch) {
                    console.log(`НАЙДЕНО СОВПАДЕНИЕ: участник "${memberName}" = пользователь "${userFullName}"`);
                  }

                  return isMatch;
                }
                return false;
              });

              if (isUserInTeam) {
                console.log(`Пользователь найден в команде проекта ${project.title}`);
                return true;
              }
            }

            console.log(`Пользователь не найден в команде проекта ${project.title}`);
            return false;
          } catch (err) {
            console.error(`Ошибка при проверке участников проекта ${project.title}:`, err);
            return false;
          }
        });

        console.log('Отфильтрованные проекты:', myProjects.length);
        setFilteredProjects(myProjects);
      } catch (error) {
        console.error('Ошибка при фильтрации проектов:', error);
        setFilteredProjects(projects);
      }
    };

    fetchUserProfile();
  }, [showOnlyMyProjects, projects, user, supabase]);

  // Функция для открытия модального окна редактирования
  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsEditModalOpen(true);
  };

  // Функция для закрытия модального окна
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingProjectId(null);
  };

  // Функция для обновления списка проектов после редактирования
  const handleProjectUpdated = () => {
    fetchProjects();
  };

  // Функция для обновления списка проектов после добавления
  const handleProjectAdded = () => {
    fetchProjects();
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

        <div className="container mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-crypto-black/30 border border-glass-border rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-white mb-4">Проектов пока нет</h3>
              <p className="text-gray-400 mb-6">Добавьте первый проект, чтобы начать работу</p>
              <button
                onClick={handleCreateProject}
                className="btn-primary"
              >
                Добавить проект
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
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
              <ProjectsTable projects={filteredProjects} onEdit={handleEditProject} />
            </>
          )}
        </div>

        {/* Модальное окно редактирования проекта */}
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          projectId={editingProjectId}
          onProjectUpdated={handleProjectUpdated}
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