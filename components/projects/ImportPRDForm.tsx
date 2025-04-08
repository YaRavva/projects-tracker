import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { parsePRDFile } from '../../lib/prdParser';
import { parseDate } from '../../lib/dateUtils';

const ImportPRDForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    name: string;
    description: string;
    repository_url: string;
    demo_url: string;
    team_members: string[];
    stages: { name: string; deadline: string; completed: boolean }[];
    deadline: string; // Добавляем поле дедлайна
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (selectedFile.type !== 'text/markdown' && !selectedFile.name.endsWith('.md')) {
      setError('Пожалуйста, загрузите файл в формате Markdown (.md)');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);

    try {
      const fileContent = await selectedFile.text();
      console.log('File content loaded, length:', fileContent.length);

      // Прямая проверка на наличие дедлайна
      const deadlineMatch = fileContent.match(/# Дедлайн[^\n]*\n(?:[^\n]*\n)*?\[([^\]]+)\]/i);
      console.log('Direct deadline match:', deadlineMatch ? deadlineMatch[1] : 'not found');

      const parsedData = parsePRDFile(fileContent);
      console.log('Parsed data:', parsedData);

      // Если дедлайн не найден в парсере, но найден прямым поиском
      if (!parsedData.deadline && deadlineMatch && deadlineMatch[1]) {
        parsedData.deadline = deadlineMatch[1].trim();
        console.log('Setting deadline from direct match:', parsedData.deadline);
      }

      setPreview(parsedData);
    } catch (err: any) {
      console.error('Error parsing PRD file:', err);
      setError(err.message || 'Ошибка при чтении файла');
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file || !preview) {
      setError('Пожалуйста, загрузите PRD.md файл');
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error('Пользователь не авторизован');

      // Создаем новый проект
      console.log('Creating project with deadline:', preview.deadline);
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name: preview.name,
            description: preview.description,
            repository_url: preview.repository_url || null,
            demo_url: preview.demo_url || null,
            owner_id: user.id,
            progress: 0,
            deadline: preview.deadline ? preview.deadline : null
          }
        ])
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }
      if (!project) throw new Error('Ошибка при создании проекта');

      console.log('Project created successfully:', project);

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

      // Добавляем этапы проекта
      if (preview.stages && preview.stages.length > 0) {
        const stagesData = preview.stages.map(stage => ({
          project_id: project.id,
          name: stage.name,
          deadline: stage.deadline || null,
          completed: stage.completed || false,
        }));

        const { error: stagesError } = await supabase
          .from('project_stages')
          .insert(stagesData);

        if (stagesError) throw stagesError;
      }

      // Перенаправляем на страницу проектов
      router.push('/projects');
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="glass-card">
      <div className="glass-card-body">
        <h2 className="text-2xl font-bold text-white mb-6">Импорт из PRD.md</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="border-2 border-dashed border-glass-border rounded-lg p-8 text-center mb-6 cursor-pointer hover:border-crypto-green-500/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".md"
              className="hidden"
            />

            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>

            <p className="text-gray-300 mb-2">
              {file ? file.name : 'Перетащите PRD.md файл сюда или нажмите для выбора'}
            </p>
            <p className="text-sm text-gray-400">
              Поддерживаются только файлы в формате Markdown (.md)
            </p>
          </div>

          {preview && (
            <div className="mb-6 p-4 bg-crypto-black/30 rounded-lg border border-glass-border">
              <h3 className="text-xl font-semibold text-white mb-2">Предпросмотр проекта</h3>

              <div className="grid grid-cols-1 gap-4 text-gray-300">
                <div>
                  <span className="font-medium text-crypto-green-500">Название:</span> {preview.name}
                </div>

                {preview.description && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Описание:</span> {preview.description}
                  </div>
                )}

                {preview.repository_url && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Репозиторий:</span> {preview.repository_url}
                  </div>
                )}

                {preview.demo_url && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Демо:</span> {preview.demo_url}
                  </div>
                )}

                {preview.team_members && preview.team_members.length > 0 && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Участники:</span> {preview.team_members.join(', ')}
                  </div>
                )}

                {preview.deadline && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Дедлайн:</span> {preview.deadline}
                    <span className="ml-2 text-xs text-gray-400">(Проверено: {preview.deadline.split('.').length === 3 ? 'Да' : 'Нет'})</span>
                  </div>
                )}

                {preview.stages && preview.stages.length > 0 && (
                  <div>
                    <span className="font-medium text-crypto-green-500">Этапы:</span>
                    <ul className="list-disc list-inside ml-4 mt-2">
                      {preview.stages.map((stage, index) => (
                        <li key={index} className={stage.completed ? 'text-crypto-green-500' : ''}>
                          {stage.name} {stage.deadline && `(до ${stage.deadline})`} {stage.completed && '✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !file}
          >
            {loading ? 'Импорт...' : 'Импортировать проект'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImportPRDForm;