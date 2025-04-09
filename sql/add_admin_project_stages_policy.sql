-- Добавляем политики доступа для таблицы project_stages, которые позволяют администраторам
-- вставлять, обновлять и удалять этапы любых проектов

-- Политика для вставки этапов администраторами
CREATE POLICY "Администраторы могут вставлять этапы любых проектов" ON public.project_stages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );

-- Политика для обновления этапов администраторами
CREATE POLICY "Администраторы могут обновлять этапы любых проектов" ON public.project_stages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );

-- Политика для удаления этапов администраторами
CREATE POLICY "Администраторы могут удалять этапы любых проектов" ON public.project_stages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );
