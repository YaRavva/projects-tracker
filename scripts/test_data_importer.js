// Скрипт для добавления тестовых проектов в базу данных
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { mockProjects } = require('./test_data_generator');

// Инициализация Supabase клиента с сервисным ключом
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Key is present' : 'Key is missing');

// Добавляем обработку ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

async function importTestData() {
  console.log('Начинаем добавление тестовых проектов...');

  try {
    // Получаем список пользователей, чтобы выбрать одного для создания проектов
    console.log('Получение списка пользователей...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);

    if (usersError) {
      console.error('Ошибка при получении пользователей:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error('Не найдено ни одного пользователя в базе данных.');
      return;
    }

    const user = users[0];
    console.log(`Используем пользователя: ${user.full_name} (ID: ${user.id})`);



    // Добавляем каждый проект
    for (const project of mockProjects) {
      // Добавляем проект в таблицу projects
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
          repository_url: project.repository_url,
          demo_url: project.demo_url,
          owner_id: user.id
        })
        .select()
        .single();

      if (projectError) {
        console.error(`Ошибка при добавлении проекта "${project.title}":`, projectError.message);
        continue;
      }

      console.log(`Добавлен проект: ${project.title} (ID: ${projectData.id})`);

      // Добавляем участников команды в метаданные проекта
      if (project.team_members && project.team_members.length > 0) {
        const { error: metaError } = await supabase
          .from('project_meta')
          .insert({
            project_id: projectData.id,
            key: 'team_members',
            value: project.team_members
          });

        if (metaError) {
          console.error(`Ошибка при добавлении участников для проекта "${project.title}":`, metaError.message);
        } else {
          console.log(`Добавлены участники для проекта: ${project.title}`);
        }
      }

      // Добавляем этапы проекта
      for (const stage of project.stages) {
        const { error: stageError } = await supabase
          .from('project_stages')
          .insert({
            project_id: projectData.id,
            name: stage.name,
            completed: stage.completed
          });

        if (stageError) {
          console.error(`Ошибка при добавлении этапа "${stage.name}" для проекта "${project.title}":`, stageError.message);
        }
      }

      console.log(`Добавлены этапы для проекта: ${project.title}`);

      // Добавляем комментарий для проектов с определенными статусами
      if (['returned', 'rejected'].includes(project.status)) {
        const comment = project.status === 'returned'
          ? 'Проект возвращен на доработку. Необходимо улучшить документацию и добавить больше тестов.'
          : 'Проект отклонен. Тема не соответствует требованиям программы.';

        const { error: reviewError } = await supabase
          .from('project_reviews')
          .insert({
            project_id: projectData.id,
            reviewer_id: user.id,
            status: project.status,
            comment: comment,
            status_changed: true
          });

        if (reviewError) {
          console.error(`Ошибка при добавлении комментария для проекта "${project.title}":`, reviewError.message);
        } else {
          console.log(`Добавлен комментарий для проекта: ${project.title}`);
        }
      }
    }

    console.log('Все тестовые проекты успешно добавлены!');
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
  }
}

// Запускаем функцию добавления проектов
importTestData();
