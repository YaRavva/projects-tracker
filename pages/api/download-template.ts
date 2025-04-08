import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Путь к файлу шаблона
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'PRD_template.md');
    
    // Проверяем, существует ли файл
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    
    // Читаем содержимое файла
    const fileContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Устанавливаем заголовки для скачивания файла
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=PRD_template.md');
    
    // Отправляем содержимое файла
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Ошибка при скачивании шаблона:', error);
    res.status(500).json({ error: 'Не удалось скачать шаблон' });
  }
}
