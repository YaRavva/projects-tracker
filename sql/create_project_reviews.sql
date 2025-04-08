-- Создаем таблицу project_reviews, если она не существует
CREATE TABLE IF NOT EXISTS project_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Создаем индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS project_reviews_project_id_idx ON project_reviews(project_id);
CREATE INDEX IF NOT EXISTS project_reviews_reviewer_id_idx ON project_reviews(reviewer_id);

-- Включаем RLS для таблицы project_reviews
ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть
DROP POLICY IF EXISTS "Все могут просматривать отзывы" ON project_reviews;
DROP POLICY IF EXISTS "Авторизованные пользователи могут добавлять отзывы" ON project_reviews;
DROP POLICY IF EXISTS "Пользователи могут редактировать свои отзывы" ON project_reviews;
DROP POLICY IF EXISTS "Администраторы могут редактировать все отзывы" ON project_reviews;

-- Политика для просмотра отзывов (все авторизованные пользователи)
CREATE POLICY "Все могут просматривать отзывы"
ON project_reviews FOR SELECT
TO authenticated
USING (true);

-- Политика для добавления отзывов (все авторизованные пользователи)
CREATE POLICY "Авторизованные пользователи могут добавлять отзывы"
ON project_reviews FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

-- Политика для редактирования своих отзывов
CREATE POLICY "Пользователи могут редактировать свои отзывы"
ON project_reviews FOR UPDATE
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Политика для администраторов (могут редактировать все отзывы)
CREATE POLICY "Администраторы могут редактировать все отзывы"
ON project_reviews FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.roles = 'admin'
  )
);
