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
