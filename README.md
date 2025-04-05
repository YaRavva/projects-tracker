# Digital Projects Tracker

Система для управления цифровыми проектами учащихся. Позволяет создавать проекты, отслеживать их прогресс, управлять этапами и участниками.

## Технологии

- Next.js
- TypeScript
- Supabase
- Tailwind CSS

## Установка и запуск

1. Клонировать репозиторий
```bash
git clone https://github.com/your-username/digital-projects-tracker.git
cd digital-projects-tracker
```

2. Установить зависимости
```bash
npm install
```

3. Создать файл `.env.local` и добавить переменные окружения
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Запустить проект в режиме разработки
```bash
npm run dev
```

## Структура проекта

- `/components` - React компоненты
- `/lib` - Утилиты и API
- `/pages` - Страницы приложения
- `/public` - Статические файлы
- `/styles` - CSS стили
- `/types` - TypeScript типы
- `/supabase` - Миграции и настройки Supabase

## Функциональность

- Аутентификация пользователей
- Управление проектами
- Отслеживание прогресса
- Управление этапами проектов
- Импорт данных из PRD.md файлов
- Аналитика и отчеты 