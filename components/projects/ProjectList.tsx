import React from 'react';
import ProjectCard from './ProjectCard';
import { Database } from '../../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  owner: {
    email: string;
    full_name?: string;
  };
  name: string; // Добавляем поле name для совместимости с ProjectCard
  progress: number;
  deadline?: string;
  members_count: number;
  status: 'active' | 'pending' | 'returned' | 'rejected';
  review_comment?: string | null;
};

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600">Проекты не найдены</h3>
        <p className="mt-2 text-gray-500">Создайте новый проект или измените параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          name={project.name}
          description={project.description || undefined}
          owner={project.owner}
          progress={project.progress}
          deadline={project.deadline}
          members={project.members_count}
          status={project.status}
          review_comment={project.review_comment}
        />
      ))}
    </div>
  );
};

export default ProjectList;