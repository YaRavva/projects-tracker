-- Изменяем значение по умолчанию для поля status с 'active' на 'pending'
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'pending';

-- Добавляем поле review_comment для хранения комментариев при отклонении или возврате на доработку
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS review_comment TEXT;

-- Создаем таблицу project_reviews для хранения истории рассмотрения проектов
CREATE TABLE IF NOT EXISTS public.project_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем политики доступа для таблицы project_reviews
CREATE POLICY "Пользователи могут видеть все записи истории рассмотрения" ON public.project_reviews
  FOR SELECT USING (true);

CREATE POLICY "Только администраторы могут создавать записи истории рассмотрения" ON public.project_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );

-- Обновляем политики доступа для таблицы projects
-- Разрешаем администраторам обновлять любые проекты
CREATE POLICY "Администраторы могут обновлять любые проекты" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND roles = 'admin'
    )
  );
