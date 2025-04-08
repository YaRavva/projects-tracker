-- Добавляем поле status_changed в таблицу project_reviews
ALTER TABLE project_reviews ADD COLUMN IF NOT EXISTS status_changed BOOLEAN DEFAULT FALSE;
