-- Добавляем политику доступа для таблицы project_meta, которая позволяет администраторам
-- вставлять, обновлять и удалять метаданные любых проектов

-- Политика для вставки метаданных администраторами
CREATE POLICY "Администраторы могут вставлять метаданные любых проектов" ON public.project_meta
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );

-- Политика для обновления метаданных администраторами
CREATE POLICY "Администраторы могут обновлять метаданные любых проектов" ON public.project_meta
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );

-- Политика для удаления метаданных администраторами
CREATE POLICY "Администраторы могут удалять метаданные любых проектов" ON public.project_meta
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );
