import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { parsePRDFile } from '../../lib/prdParser';
import CustomDatePicker from '../ui/DatePicker';
import SimpleDatePicker from '../ui/SimpleDatePicker';

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
  isLeader: boolean;
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
    team_members: [{ name: '', class: '', isLeader: true }],
    stages: [{ name: '', deadline: '', completed: false, display_deadline: '' }],
  });

  // Состояние для хранения дат в формате Date
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [stageDates, setStageDates] = useState<(Date | null)[]>([null]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения даты дедлайна
  const handleDeadlineChange = (date: Date | null) => {
    setDeadlineDate(date);
    if (date) {
      const isoDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
      const displayDate = formatDate(isoDate);
      setFormData(prev => ({
        ...prev,
        deadline: isoDate,
        display_deadline: displayDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        deadline: '',
        display_deadline: ''
      }));
    }
  };

  const handleTeamMemberChange = (index: number, field: string, value: any) => {
    const newTeamMembers = [...formData.team_members];
    newTeamMembers[index] = { ...newTeamMembers[index], [field]: value };

    // Если меняем статус лидера, обновляем всех участников
    if (field === 'isLeader' && value === true) {
      // Снимаем статус лидера со всех других участников
      newTeamMembers.forEach((member, i) => {
        if (i !== index) {
          newTeamMembers[i].isLeader = false;
        }
      });
    }

    setFormData(prev => ({ ...prev, team_members: newTeamMembers }));
  };

  const addTeamMember = () => {
    if (formData.team_members.length < 3) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, { name: '', class: '', isLeader: false }]
      }));
    }
  };

  const removeTeamMember = (index: number) => {
    const newTeamMembers = [...formData.team_members];
    const isRemovingLeader = newTeamMembers[index].isLeader;

    // Удаляем участника
    newTeamMembers.splice(index, 1);

    // Если удаляем лидера и есть другие участники, назначаем первого лидером
    if (isRemovingLeader && newTeamMembers.length > 0) {
      newTeamMembers[0].isLeader = true;
    }

    setFormData(prev => ({ ...prev, team_members: newTeamMembers }));
  };

  const handleStageChange = (index: number, field: string, value: any) => {
    const newStages = [...formData.stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  // Обработчик изменения даты этапа
  const handleStageDeadlineChange = (index: number, date: Date | null) => {
    // Обновляем массив дат этапов
    const newStageDates = [...stageDates];
    newStageDates[index] = date;
    setStageDates(newStageDates);

    // Обновляем данные формы
    const newStages = [...formData.stages];
    if (date) {
      const isoDate = date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
      const displayDate = formatDate(isoDate);
      newStages[index] = {
        ...newStages[index],
        deadline: isoDate,
        display_deadline: displayDate
      };
    } else {
      newStages[index] = {
        ...newStages[index],
        deadline: '',
        display_deadline: ''
      };
    }

    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, { name: '', deadline: '', completed: false, display_deadline: '' }]
    }));
    setStageDates(prev => [...prev, null]);
  };

  const removeStage = (index: number) => {
    if (formData.stages.length > 1) {
      const newStages = [...formData.stages];
      newStages.splice(index, 1);
      setFormData(prev => ({ ...prev, stages: newStages }));

      const newStageDates = [...stageDates];
      newStageDates.splice(index, 1);
      setStageDates(newStageDates);
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

        // Определяем лидера (первый - лидер, остальные - участники)
        const isLeader = index === 0;

        teamMembers.push({ name, class: classValue, isLeader });
      });

      // Если нет участников, добавляем пустого лидера
      if (teamMembers.length === 0) {
        teamMembers.push({ name: '', class: '', isLeader: true });
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

      // Обновляем состояние дат
      setDeadlineDate(null);
      setStageDates(stages.length > 0 ? stages.map(stage => stage.deadline ? new Date(stage.deadline) : null) : [null]);

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

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-cryptix-green">Данные проекта</h3>
          <div>
            <label className="inline-flex items-center px-3 py-1.5 bg-cryptix-green/20 text-cryptix-green text-sm font-medium rounded-md border border-cryptix-green/30 hover:bg-cryptix-green/30 transition-colors cursor-pointer">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
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

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
              placeholder="Введите название проекта"
            />
          </div>

        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
              placeholder="Введите описание проекта"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
              Дедлайн проекта
            </label>
            <CustomDatePicker
              id="deadline"
              name="deadline"
              selectedDate={deadlineDate}
              onChange={handleDeadlineChange}
              required={false}
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
              className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
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
              className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
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
                  className="text-cryptix-green hover:text-cryptix-green/80 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить участника
                </button>
              )}
            </div>

            <div className="space-y-2">
              {formData.team_members.map((member, index) => (
                <div key={index} className="p-2 bg-glass-bg backdrop-blur-xs rounded-md border border-glass-border">
                  <div className="mb-2">
                    <span className="text-cryptix-green font-medium">Участник {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                        placeholder="Имя Фамилия"
                        required={index === 0} // Имя лидера обязательно
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={member.class}
                        onChange={(e) => handleTeamMemberChange(index, 'class', e.target.value)}
                        className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                        placeholder="Класс"
                      />
                    </div>
                    <div className="col-span-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
                          <input
                            type="checkbox"
                            checked={member.isLeader}
                            onChange={(e) => handleTeamMemberChange(index, 'isLeader', e.target.checked)}
                          />
                        </div>
                        <span className="text-white text-sm">Лидер</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
                className="text-cryptix-green hover:text-cryptix-green/80 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить этап
              </button>
            </div>

            <div className="space-y-2">
              {formData.stages.map((stage, index) => (
                <div key={index} className="p-2 bg-glass-bg backdrop-blur-xs rounded-md border border-glass-border">
                  <div className="mb-2">
                    <span className="text-cryptix-green font-medium">Этап {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-glass-bg backdrop-blur-xs border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                        placeholder="Название этапа"
                      />
                    </div>
                    <div className="col-span-3">
                      <CustomDatePicker
                        selectedDate={stageDates[index]}
                        onChange={(date) => handleStageDeadlineChange(index, date)}
                        placeholder="Дата"
                      />
                    </div>
                    <div className="col-span-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={stage.completed}
                          onChange={(e) => handleStageChange(index, 'completed', e.target.checked)}
                        />
                        <span className="text-white text-sm">Завершен</span>
                      </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-cryptix-green/80 to-cryptix-green text-black font-medium rounded-md shadow-lg hover:shadow-cryptix-green/20 transition-all duration-300 flex items-center justify-center min-w-[200px]"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Добавление...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить проект
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProjectForm;