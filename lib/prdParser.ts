interface ParsedPRD {
  name: string;
  description: string;
  repository_url: string;
  demo_url: string;
  team_members: string[];
  stages: { name: string; deadline: string; completed: boolean }[];
  deadline: string; // Добавляем поле для дедлайна проекта
}

// Функция для проверки и форматирования даты
const formatDateString = (dateStr: string): string => {
  // Если дата уже в формате дд.мм.гг или дд.мм.гггг, возвращаем её как есть
  if (/^\d{2}\.\d{2}\.\d{2}(\d{2})?$/.test(dateStr)) {
    return dateStr;
  }

  try {
    // Пытаемся распарсить дату
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    // Форматируем в дд.мм.гг
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateStr;
  }
};

export function parsePRDFile(content: string): ParsedPRD {
  const lines = content.split('\n');

  // Инициализируем результат
  const result: ParsedPRD = {
    name: '',
    description: '',
    repository_url: '',
    demo_url: '',
    team_members: [],
    stages: [],
    deadline: '', // Инициализируем пустой дедлайн
  };

  let currentSection = '';
  let descriptionLines: string[] = [];

  // Функция для удаления квадратных скобок из текста
  const removeSquareBrackets = (text: string): string => {
    // Если текст в квадратных скобках, извлекаем содержимое
    if (text.startsWith('[') && text.endsWith(']')) {
      return text.substring(1, text.length - 1).trim();
    }
    return text.trim();
  };

  // Обрабатываем каждую строку
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Проверяем, не является ли строка дедлайном в квадратных скобках
    if (line.startsWith('[') && line.endsWith(']') && line.includes('.') && line.length <= 12) {
      // Похоже на дату в формате [15.12.24]
      const dateStr = removeSquareBrackets(line);
      if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(dateStr)) {
        console.log('Found date-like string outside of deadline section:', dateStr);
        result.deadline = dateStr;
      }
    }

    // Пропускаем пустые строки и комментарии HTML
    if (!line || line.startsWith('<!--') || line.endsWith('-->') || line.includes('<!--') || line.includes('-->')) continue;

    // Определяем секцию
    if (line.startsWith('# ')) {
      const sectionName = line.substring(2).trim();
      console.log('Found section:', sectionName);

      if (sectionName.toLowerCase() === 'название проекта') {
        currentSection = 'name';
      } else if (sectionName.toLowerCase() === 'описание') {
        currentSection = 'description';
      } else if (sectionName.toLowerCase() === 'исполнители') {
        currentSection = 'team';
      } else if (sectionName.toLowerCase() === 'этапы') {
        currentSection = 'stages';
      } else if (sectionName.toLowerCase() === 'ссылки') {
        currentSection = 'links';
      } else if (sectionName.toLowerCase() === 'дедлайн' || sectionName.toLowerCase().includes('дедлайн')) {
        currentSection = 'deadline';
        console.log('Switching to deadline section, exact match:', sectionName.toLowerCase() === 'дедлайн');
      } else if (sectionName.toLowerCase().includes('шаблон prd')) {
        // Пропускаем заголовок шаблона
        currentSection = '';
      } else {
        // Если это название проекта в первой строке
        if (i === 0) {
          result.name = sectionName;
        }
        currentSection = '';
      }
      console.log('Current section set to:', currentSection);
      continue;
    }

    // Обрабатываем содержимое секции
    switch (currentSection) {
      case 'name':
        // Название проекта обычно идет после заголовка
        if (line.startsWith('-')) {
          result.name = removeSquareBrackets(line.substring(1).trim());
        } else if (line.startsWith('[') && line.endsWith(']')) {
          // Формат: [Название проекта]
          result.name = removeSquareBrackets(line);
        } else {
          result.name = line;
        }
        break;

      case 'description':
        // Собираем все строки описания
        if (line.startsWith('**Технический стек**:') || line.startsWith('Технический стек:')) {
          // Пропускаем технический стек
        } else if (line.startsWith('-') || line.startsWith('*')) {
          descriptionLines.push(removeSquareBrackets(line));
        } else if (line.startsWith('[') && line.endsWith(']')) {
          // Формат: [Описание проекта]
          descriptionLines.push(removeSquareBrackets(line));
        } else {
          descriptionLines.push(line);
        }
        break;

      case 'team':
        // Извлекаем имена участников
        if (line.startsWith('-')) {
          // Формат: - [Иванов Иван, 10А] (Лидер)
          const memberMatch = line.match(/- \[(.*?)\]( \((.*?)\))?/);
          if (memberMatch && memberMatch[1]) {
            // Добавляем информацию о классе и роли, если она есть
            result.team_members.push(memberMatch[1].trim());
          } else {
            // Простой формат: - Иванов Иван
            const simpleMember = line.substring(1).trim();
            if (simpleMember) {
              result.team_members.push(simpleMember);
            }
          }
        } else if (line.match(/\[(.*?)\]( \((.*?)\))?/)) {
          // Формат: [Иванов Иван, 10А] (Лидер)
          const memberMatch = line.match(/\[(.*?)\]( \((.*?)\))?/);
          if (memberMatch && memberMatch[1]) {
            result.team_members.push(memberMatch[1].trim());
          }
        }
        break;

      case 'stages':
        // Извлекаем этапы
        // Проверяем формат с дефисом в начале
        if (line.startsWith('-')) {
          // Формат: - [x] Этап 1 (29.03.25)
          const stageMatch = line.match(/- \[(x| )\] (.*?) \((.*?)\)/i);
          if (stageMatch) {
            result.stages.push({
              name: stageMatch[2].trim(),
              deadline: formatDateString(stageMatch[3].trim()),
              completed: stageMatch[1].toLowerCase() === 'x',
            });
          } else {
            // Формат: - [] Этап 2 (10.04.25)
            const emptyBracketMatch = line.match(/- \[\] (.*?) \((.*?)\)/i);
            if (emptyBracketMatch) {
              result.stages.push({
                name: emptyBracketMatch[1].trim(),
                deadline: formatDateString(emptyBracketMatch[2].trim()),
                completed: false,
              });
            } else {
              // Простой формат: - [x] Этап без даты
              const simpleStageMatch = line.match(/- \[(x| |)\] (.*)/i);
              if (simpleStageMatch) {
                result.stages.push({
                  name: simpleStageMatch[2].trim(),
                  deadline: '',
                  completed: simpleStageMatch[1].toLowerCase() === 'x',
                });
              }
            }
          }
        } else {
          // Формат без дефиса: [x] Этап 1: Проектирование интерфейса (20.09.24)
          const stageMatch = line.match(/\[(x| )\] (.*?) \((.*?)\)/i);
          if (stageMatch) {
            result.stages.push({
              name: stageMatch[2].trim(),
              deadline: formatDateString(stageMatch[3].trim()),
              completed: stageMatch[1].toLowerCase() === 'x',
            });
          } else {
            // Формат: [] Этап 2 (10.04.25)
            const emptyBracketMatch = line.match(/\[\] (.*?) \((.*?)\)/i);
            if (emptyBracketMatch) {
              result.stages.push({
                name: emptyBracketMatch[1].trim(),
                deadline: formatDateString(emptyBracketMatch[2].trim()),
                completed: false,
              });
            } else {
              // Простой формат: [x] Этап без даты
              const simpleStageMatch = line.match(/\[(x| |)\] (.*)/i);
              if (simpleStageMatch) {
                result.stages.push({
                  name: simpleStageMatch[2].trim(),
                  deadline: '',
                  completed: simpleStageMatch[1].toLowerCase() === 'x',
                });
              }
            }
          }
        }
        break;

      case 'deadline':
        // Извлекаем дедлайн проекта
        console.log('Processing deadline section, line:', line);
        console.log('Current section:', currentSection);

        // Проверяем, что строка не пустая и не содержит комментариев
        if (line && !line.includes('<!--') && !line.includes('-->')) {
          if (line.startsWith('[') && line.endsWith(']')) {
            // Формат: [15.12.24]
            result.deadline = removeSquareBrackets(line);
            console.log('Extracted deadline from brackets:', result.deadline);
          } else {
            // Простой формат: 15.12.24
            result.deadline = line.trim();
            console.log('Extracted deadline without brackets:', result.deadline);
          }
        }
        break;

      case 'links':
        // Извлекаем ссылки
        if (line.toLowerCase().includes('репозиторий:')) {
          const repoMatch = line.match(/\[(.*?)\]/);
          if (repoMatch && repoMatch[1]) {
            result.repository_url = repoMatch[1].trim();
          }
        } else if (line.toLowerCase().includes('демо:')) {
          const demoMatch = line.match(/\[(.*?)\]/);
          if (demoMatch && demoMatch[1]) {
            result.demo_url = demoMatch[1].trim();
          }
        }
        break;
    }
  }

  // Объединяем строки описания
  result.description = descriptionLines.join(' ').trim();

  // Ограничиваем количество участников до 3
  if (result.team_members.length > 3) {
    result.team_members = result.team_members.slice(0, 3);
  }

  // Если нет участников, добавляем пустого
  if (result.team_members.length === 0) {
    result.team_members.push('');
  }

  // Логируем итоговый результат
  console.log('Final parsed result:', JSON.stringify(result, null, 2));

  return result;
}