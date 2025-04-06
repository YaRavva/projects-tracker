-- Создаем таблицу profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  roles TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deadline TIMESTAMP WITH TIME ZONE,
  repository_url TEXT,
  demo_url TEXT,
  name TEXT
);

-- Создаем таблицу project_members
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу project_stages
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу project_meta
CREATE TABLE IF NOT EXISTS public.project_meta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем политики доступа для таблицы profiles
CREATE POLICY "Пользователи могут видеть все профили" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Пользователи могут создавать свой профиль" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Создаем политики доступа для таблицы projects
CREATE POLICY "Пользователи могут видеть все проекты" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать проекты" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Пользователи могут обновлять свои проекты" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Пользователи могут удалять свои проекты" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Создаем политики доступа для таблицы project_members
CREATE POLICY "Пользователи могут видеть всех участников проектов" ON public.project_members
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут добавлять участников в свои проекты" ON public.project_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут обновлять участников в своих проектах" ON public.project_members
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут удалять участников из своих проектов" ON public.project_members
  FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

-- Создаем политики доступа для таблицы project_stages
CREATE POLICY "Пользователи могут видеть все этапы проектов" ON public.project_stages
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать этапы в своих проектах" ON public.project_stages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут обновлять этапы в своих проектах" ON public.project_stages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут удалять этапы из своих проектов" ON public.project_stages
  FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

-- Создаем политики доступа для таблицы project_meta
CREATE POLICY "Пользователи могут видеть все метаданные проектов" ON public.project_meta
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать метаданные в своих проектах" ON public.project_meta
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут обновлять метаданные в своих проектах" ON public.project_meta
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Пользователи могут удалять метаданные из своих проектов" ON public.project_meta
  FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

-- Включаем Row Level Security для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_meta ENABLE ROW LEVEL SECURITY;

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_stages_updated_at
BEFORE UPDATE ON public.project_stages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_meta_updated_at
BEFORE UPDATE ON public.project_meta
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
