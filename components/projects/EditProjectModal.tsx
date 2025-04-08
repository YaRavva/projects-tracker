import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import ProjectForm from './ProjectForm';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onProjectUpdated: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onProjectUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);

  // Загружаем данные проекта при открытии модального окна
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectData();
    }
  }, [isOpen, projectId]);

  // Функция для загрузки данных проекта
  const fetchProjectData = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Загружаем основные данные проекта
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Загружаем метаданные проекта (участники команды)
      const { data: metaData, error: metaError } = await supabase
        .from('project_meta')
        .select('key, value')
        .eq('project_id', projectId);

      if (metaError) throw metaError;

      // Загружаем этапы проекта
      const { data: stages, error: stagesError } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('id', { ascending: true });

      if (stagesError) throw stagesError;

      // Обрабатываем метаданные
      console.log('Метаданные проекта:', metaData);
      const teamMembersItem = metaData?.find(item => item.key === 'team_members');
      console.log('Данные об участниках:', teamMembersItem);
      const teamMembers = teamMembersItem?.value || [];

      // Формируем полные данные проекта
      const fullProjectData = {
        ...project,
        team_members: teamMembers,
        stages: stages?.map(stage => ({
          ...stage,
          display_deadline: stage.deadline ? new Date(stage.deadline).toLocaleDateString('ru-RU') : ''
        })) || []
      };

      setProjectData(fullProjectData);
    } catch (err: any) {
      console.error('Ошибка при загрузке данных проекта:', err);
      setError(err.message || 'Не удалось загрузить данные проекта');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик успешного обновления проекта
  const handleProjectUpdated = () => {
    onProjectUpdated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактирование проекта"
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cryptix-green"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      ) : projectData ? (
        <ProjectForm
          initialData={projectData}
          mode="edit"
          onSuccess={handleProjectUpdated}
        />
      ) : (
        <div className="text-center text-gray-400 py-8">
          Проект не найден
        </div>
      )}
    </Modal>
  );
};

export default EditProjectModal;
