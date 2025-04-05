import React from 'react';
import Layout from '../components/layout/Layout';
import ProjectList from '../components/projects/ProjectList';
import ProjectFilters from '../components/projects/ProjectFilters';
import { useProjects } from '../hooks/useProjects';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Link from 'next/link';

const ProjectsPage: React.FC = () => {
  const { projects, isLoading, error, fetchProjects } = useProjects();
  
  const handleFilterChange = (filters: {
    search: string;
    status: string;
    sortBy: string;
  }) => {
    fetchProjects(filters);
  };

  return (
    <ProtectedRoute>
      <Layout title="Проекты | Управление проектами">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Проекты</h1>
          <Link 
            href="/projects/new" 
            className="btn-primary"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Создать проект
            </span>
          </Link>
        </div>
        
        <ProjectFilters onFilterChange={handleFilterChange} />
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <ProjectList projects={projects} isLoading={isLoading} />
      </Layout>
    </ProtectedRoute>
  );
};

export default ProjectsPage; 