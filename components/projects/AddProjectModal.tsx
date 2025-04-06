import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import ProjectForm from './ProjectForm';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectAdded
}) => {
  const [error, setError] = useState<string | null>(null);

  // Обработчик успешного добавления проекта
  const handleProjectAdded = () => {
    onProjectAdded();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавление проекта"
      size="lg"
    >
      {error ? (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      ) : (
        <ProjectForm 
          mode="create" 
          onSuccess={handleProjectAdded}
        />
      )}
    </Modal>
  );
};

export default AddProjectModal;
