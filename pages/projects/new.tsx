import React from 'react';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProjectForm from '../../components/projects/ProjectForm';

const NewProjectPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout title="New Project | Digital Projects Tracker">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Создание нового проекта</h1>
            <p className="text-gray-300 mt-2">
              Заполните форму или импортируйте данные из PRD.md файла
            </p>
          </div>

          <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-lg">
            <ProjectForm />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default NewProjectPage;