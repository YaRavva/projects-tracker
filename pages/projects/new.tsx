import React from 'react';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProjectForm from '../../components/projects/ProjectForm';

const NewProjectPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout title="Новый проект | Управление проектами">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Создание нового проекта</h1>
          <p className="text-gray-300 mt-2">
            Заполните форму или импортируйте данные из PRD.md файла
          </p>
        </div>
        
        <ProjectForm />
      </Layout>
    </ProtectedRoute>
  );
};

export default NewProjectPage; 