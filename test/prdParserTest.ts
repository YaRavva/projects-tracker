import fs from 'fs';
import path from 'path';
import { parsePRDFile } from '../lib/prdParser';

// Чтение файла шаблона
const templatePath = path.join(process.cwd(), 'docs', 'demo', 'PRD_template.md');
const templateContent = fs.readFileSync(templatePath, 'utf-8');

// Парсинг шаблона
const parsedData = parsePRDFile(templateContent);

// Вывод результатов
console.log('Результаты парсинга:');
console.log(JSON.stringify(parsedData, null, 2));

// Проверка корректности парсинга
console.log('\nПроверка результатов:');
console.log('Название проекта:', parsedData.name);
console.log('Описание:', parsedData.description);
console.log('Участники:', parsedData.team_members);
console.log('Количество этапов:', parsedData.stages.length);
console.log('Репозиторий:', parsedData.repository_url);
console.log('Демо:', parsedData.demo_url);
