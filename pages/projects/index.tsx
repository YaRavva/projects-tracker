import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ProjectsTable from '../../components/projects/ProjectsTable';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EditProjectModal from '../../components/projects/EditProjectModal';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline: string | null;
  progress: number;
  repository_url: string | null;
  demo_url: string | null;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
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

        // Добавляем информацию о пользователях и участниках в проекты
        const projectsWithProfiles = (projectsData || []).map(project => {
          // Находим профиль владельца
          const ownerProfile = profilesData?.find(profile => profile.id === project.owner_id);

          // Находим участников проекта
          const teamMembersEntry = teamMembersData?.find(entry => entry.project_id === project.id);
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

    fetchProjects();
  }, [user]);

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
    // Запускаем функцию загрузки проектов
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

        // Добавляем информацию о пользователях в проекты
        const projectsWithProfiles = (projectsData || []).map(project => {
          // Находим профиль владельца
          const ownerProfile = profilesData?.find(profile => profile.id === project.owner_id);

          // Находим участников проекта
          const teamMembersEntry = teamMembersData?.find(entry => entry.project_id === project.id);
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

    fetchProjects();
  };

  const handleCreateProject = () => {
    router.push('/projects/new');
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
              <ProjectsTable projects={projects} onEdit={handleEditProject} />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCreateProject}
                  className="btn-primary"
                >
                  Добавить проект
                </button>
              </div>
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