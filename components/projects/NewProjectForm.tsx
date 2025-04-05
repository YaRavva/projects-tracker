import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  name: string;
  description: string;
  deadline: string;
  repository_url: string;
  demo_url: string;
}

const NewProjectForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    deadline: '',
    repository_url: '',
    demo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) throw new Error('Пользователь не авторизован');

      // Создаем новый проект
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            deadline: formData.deadline || null,
            repository_url: formData.repository_url || null,
            demo_url: formData.demo_url || null,
            owner_id: user.id,
            progress: 0,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Ошибка при создании проекта');

      // Добавляем владельца как участника проекта
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            role: 'owner',
          }
        ]);

      if (memberError) throw memberError;

      // Перенаправляем на страницу проекта
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card">
      <div className="glass-card-body">
        <h2 className="text-2xl font-bold text-white mb-6">Создание нового проекта</h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Название проекта *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="Введите название проекта"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Описание проекта
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="Опишите ваш проект"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
              Дедлайн
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="repository_url" className="block text-sm font-medium text-gray-300 mb-1">
              URL репозитория
            </label>
            <input
              id="repository_url"
              name="repository_url"
              type="url"
              value={formData.repository_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="https://github.com/username/repo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="demo_url" className="block text-sm font-medium text-gray-300 mb-1">
              URL демо
            </label>
            <input
              id="demo_url"
              name="demo_url"
              type="url"
              value={formData.demo_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="https://your-demo-site.com"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать проект'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default NewProjectForm; 