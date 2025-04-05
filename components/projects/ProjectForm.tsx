import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { parsePRDFile } from '../../lib/prdParser';

// Функция для форматирования даты в формат дд.мм.гг
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// Функция для преобразования даты из формата дд.мм.гг в формат ISO для input type="date"
const parseDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Если дата уже в формате ISO, возвращаем её
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  
  try {
    // Парсим дату в формате дд.мм.гг или дд.мм.гггг
    const parts = dateString.split('.');
    if (parts.length !== 3) return '';
    
    let year = parts[2];
    // Если год двузначный, добавляем 20 в начало
    if (year.length === 2) {
      year = `20${year}`;
    }
    
    // Формируем дату в формате ISO (YYYY-MM-DD)
    return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
};

interface TeamMember {
  name: string;
  class: string;
  role: string;
}

interface Stage {
  name: string;
  deadline: string;
  completed: boolean;
  display_deadline?: string; // Для отображения в формате дд.мм.гг
}

interface FormData {
  title: string;
  description: string;
  deadline: string;
  display_deadline: string; // Для отображения в формате дд.мм.гг
  repository_url: string;
  demo_url: string;
  team_members: TeamMember[];
  stages: Stage[];
}

const ProjectForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    deadline: '',
    display_deadline: '',
    repository_url: '',
    demo_url: '',
    team_members: [{ name: '', class: '', role: 'Лидер' }],
    stages: [{ name: '', deadline: '', completed: false, display_deadline: '' }],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'deadline') {
      // Если изменяется дедлайн, обновляем также отображаемую дату
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        display_deadline: value ? formatDate(value) : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const newTeamMembers = [...formData.team_members];
    newTeamMembers[index] = { ...newTeamMembers[index], [field]: value };
    
    // Если это первый участник, его роль всегда "Лидер"
    if (index === 0) {
      newTeamMembers[index].role = 'Лидер';
    }
    
    setFormData(prev => ({ ...prev, team_members: newTeamMembers }));
  };

  const addTeamMember = () => {
    if (formData.team_members.length < 3) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, { name: '', class: '', role: 'Участник' }]
      }));
    }
  };

  const removeTeamMember = (index: number) => {
    // Нельзя удалить лидера (первого участника)
    if (index === 0) return;
    
    const newTeamMembers = [...formData.team_members];
    newTeamMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, team_members: newTeamMembers }));
  };

  const handleStageChange = (index: number, field: string, value: any) => {
    const newStages = [...formData.stages];
    
    if (field === 'deadline') {
      // Если изменяется дедлайн этапа, обновляем также отображаемую дату
      newStages[index] = { 
        ...newStages[index], 
        [field]: value,
        display_deadline: value ? formatDate(value) : ''
      };
    } else {
      newStages[index] = { ...newStages[index], [field]: value };
    }
    
    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, { name: '', deadline: '', completed: false, display_deadline: '' }]
    }));
  };

  const removeStage = (index: number) => {
    if (formData.stages.length > 1) {
      const newStages = [...formData.stages];
      newStages.splice(index, 1);
      setFormData(prev => ({ ...prev, stages: newStages }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setImportSuccess(false);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/markdown' && !selectedFile.name.endsWith('.md')) {
      setError('Пожалуйста, загрузите файл в формате Markdown (.md)');
      return;
    }
    
    try {
      const fileContent = await selectedFile.text();
      const parsedData = parsePRDFile(fileContent);
      
      // Преобразуем данные из парсера в формат формы
      const teamMembers: TeamMember[] = [];
      
      // Обрабатываем участников
      parsedData.team_members.forEach((member, index) => {
        // Разделяем имя и класс, если они в формате "Имя Фамилия, 10А"
        const parts = member.split(',');
        const name = parts[0].trim();
        const classValue = parts.length > 1 ? parts[1].trim() : '';
        
        // Определяем роль (первый - лидер, остальные - участники)
        const role = index === 0 ? 'Лидер' : 'Участник';
        
        teamMembers.push({ name, class: classValue, role });
      });
      
      // Если нет участников, добавляем пустого лидера
      if (teamMembers.length === 0) {
        teamMembers.push({ name: '', class: '', role: 'Лидер' });
      }
      
      // Обрабатываем этапы, преобразуя даты в нужный формат
      const stages = parsedData.stages.map(stage => {
        // Преобразуем дату из формата дд.мм.гг в ISO для input type="date"
        const isoDeadline = parseDate(stage.deadline);
        
        return {
          ...stage,
          deadline: isoDeadline,
          display_deadline: stage.deadline // Сохраняем оригинальную дату для отображения
        };
      });
      
      // Обновляем состояние формы
      setFormData({
        title: parsedData.name,
        description: parsedData.description,
        deadline: '', // Дедлайн проекта нужно будет установить вручную
        display_deadline: '',
        repository_url: parsedData.repository_url,
        demo_url: parsedData.demo_url,
        team_members: teamMembers,
        stages: stages.length > 0 ? stages : [{ name: '', deadline: '', completed: false, display_deadline: '' }]
      });
      
      setImportSuccess(true);
      
      // Сбрасываем файловый инпут
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError('Ошибка при чтении файла: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.title.trim()) {
      setError('Название проекта обязательно');
      return;
    }
    
    if (!user) {
      setError('Необходимо авторизоваться');
      return;
    }
    
    setLoading(true);
    
    try {
      // Рассчитываем прогресс проекта
      const validStages = formData.stages.filter(stage => stage.name.trim());
      const completedStages = validStages.filter(stage => stage.completed);
      const progress = validStages.length > 0 
        ? Math.round((completedStages.length / validStages.length) * 100) 
        : 0;
      
      // Создаем проект
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          owner_id: user.id,
          deadline: formData.deadline || null,
          progress: progress,
          repository_url: formData.repository_url || null,
          demo_url: formData.demo_url || null
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Сохраняем информацию об участниках в метаданных проекта
      const validTeamMembers = formData.team_members.filter(member => member.name.trim());
      if (validTeamMembers.length > 0) {
        const { error: metaError } = await supabase
          .from('project_meta')
          .insert([
            {
              project_id: project.id,
              key: 'team_members',
              value: validTeamMembers
            }
          ]);
        
        if (metaError) console.error('Ошибка при сохранении участников:', metaError);
      }
      
      // Сохраняем этапы проекта
      const stagesToInsert = validStages.map(stage => ({
        project_id: project.id,
        name: stage.name,
        deadline: stage.deadline || null,
        completed: stage.completed
      }));
      
      const { error: stagesError } = await supabase
        .from('project_stages')
        .insert(stagesToInsert);
      
      if (stagesError) console.error('Ошибка при сохранении этапов:', stagesError);
      
      // Перенаправляем на страницу проекта
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      console.error('Ошибка при создании проекта:', err);
      setError(err.message || 'Произошла ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-crypto-black/30 border border-glass-border rounded-lg p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      {importSuccess && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-md text-green-200">
          Данные успешно импортированы из PRD.md файла
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Данные проекта</h3>
          <div>
            <label className="btn-secondary-sm cursor-pointer">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".md"
                className="hidden"
              />
              Импорт из PRD.md
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="form-group">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Название проекта *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="Введите название проекта"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
              placeholder="Введите описание проекта"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
              Дедлайн проекта
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
            />
            {formData.display_deadline && (
              <div className="mt-1 text-sm text-gray-400">
                Дата: {formData.display_deadline}
              </div>
            )}
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
          
          <div className="form-group">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Участники проекта (до 3-х человек)
              </label>
              {formData.team_members.length < 3 && (
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="text-crypto-green-500 hover:text-crypto-green-400 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить участника
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {formData.team_members.map((member, index) => (
                <div key={index} className="p-3 bg-crypto-black/30 rounded-md border border-glass-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-white font-medium">{index === 0 ? 'Лидер проекта' : `Участник ${index}`}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
                        placeholder="Имя Фамилия"
                        required={index === 0} // Имя лидера обязательно
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={member.class}
                        onChange={(e) => handleTeamMemberChange(index, 'class', e.target.value)}
                        className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
                        placeholder="Класс (например, 10А)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <select
                      value={member.role}
                      onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                      className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
                      disabled={index === 0} // Нельзя изменить роль лидера
                    >
                      <option value="Лидер">Лидер</option>
                      <option value="Участник">Участник</option>
                      <option value="Разработчик">Разработчик</option>
                      <option value="Дизайнер">Дизайнер</option>
                      <option value="Тестировщик">Тестировщик</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Этапы проекта
              </label>
              <button
                type="button"
                onClick={addStage}
                className="text-crypto-green-500 hover:text-crypto-green-400 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить этап
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.stages.map((stage, index) => (
                <div key={index} className="p-3 bg-crypto-black/30 rounded-md border border-glass-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-white font-medium">
                      Этап {index + 1} 
                      {stage.completed && (
                        <span className="ml-2 text-crypto-green-500">[✓]</span>
                      )}
                    </h4>
                    {formData.stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
                        placeholder="Название этапа"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={stage.deadline}
                        onChange={(e) => handleStageChange(index, 'deadline', e.target.value)}
                        className="w-full px-3 py-2 bg-crypto-black/50 border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-crypto-green-500/50"
                      />
                      {stage.display_deadline && (
                        <div className="mt-1 text-sm text-gray-400">
                          Дата: {stage.display_deadline}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={stage.completed}
                        onChange={(e) => handleStageChange(index, 'completed', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-crypto-green-500 rounded border-glass-border bg-crypto-black/50"
                      />
                      <span className="ml-2 text-gray-300">Этап завершен</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
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

export default ProjectForm; 