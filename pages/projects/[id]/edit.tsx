import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Layout from '../../../components/layout/Layout';
import ProjectForm from '../../../components/projects/ProjectForm';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

const EditProjectPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Загружаем основные данные проекта
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('owner_id', user.id)
          .single();
        
        if (projectError) throw projectError;
        if (!project) throw new Error('Проект не найден');
        
        // Загружаем этапы проекта
        const { data: stages, error: stagesError } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: true });
        
        if (stagesError) throw stagesError;
        
        // Загружаем метаданные проекта (участники команды)
        const { data: meta, error: metaError } = await supabase
          .from('project_meta')
          .select('*')
          .eq('project_id', id)
          .eq('key', 'team_members')
          .single();
        
        // Формируем данные для формы
        setProjectData({
          ...project,
          team_members: meta?.value || [{ name: '', class: '', role: 'Лидер' }],
          stages: stages?.length > 0 
            ? stages.map(s => ({
                name: s.name,
                deadline: s.deadline || '',
                completed: s.completed
              })) 
            : [{ name: '', deadline: '', completed: false }]
        });
      } catch (err: any) {
        console.error('Ошибка при загрузке проекта:', err);
        setError(err.message || 'Не удалось загрузить проект');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crypto-green-500"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !projectData) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md">
              {error || 'Проект не найден'}
            </div>
            <div className="mt-4">
              <Link href="/projects" className="text-crypto-green-500 hover:underline">
                ← Вернуться к списку проектов
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Редактирование проекта | IT Projects</title>
        </Head>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={`/projects/${id}`} className="text-crypto-green-500 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться к проекту
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-6">Редактирование проекта</h1>
          
          <ProjectForm initialData={projectData} isEditing={true} projectId={id as string} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default EditProjectPage; 