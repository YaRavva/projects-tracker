-- Создаем функцию для удаления комментариев
CREATE OR REPLACE FUNCTION delete_project_review(review_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Удаляем комментарий
  DELETE FROM project_reviews
  WHERE id = review_id
  AND (
    -- Пользователь является автором комментария
    auth.uid() = reviewer_id
    OR
    -- Пользователь является администратором
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.roles = 'admin'
    )
    OR
    -- Пользователь является владельцем проекта
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_reviews.project_id AND projects.owner_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
