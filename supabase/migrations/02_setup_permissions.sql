-- Отключаем RLS для всех таблиц
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_meta DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews DISABLE ROW LEVEL SECURITY;

-- Предоставляем полные права на все таблицы для всех ролей
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.projects TO anon, authenticated, service_role;
GRANT ALL ON public.project_members TO anon, authenticated, service_role;
GRANT ALL ON public.project_stages TO anon, authenticated, service_role;
GRANT ALL ON public.project_meta TO anon, authenticated, service_role;
GRANT ALL ON public.project_reviews TO anon, authenticated, service_role;

-- Предоставляем права на последовательности (если они есть)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Предоставляем права на таблицу auth.users для роли authenticated
GRANT SELECT, UPDATE ON auth.users TO authenticated;

-- Создаем функцию-обертку для обновления пользователя
CREATE OR REPLACE FUNCTION auth.update_user(
  user_id UUID,
  user_email TEXT DEFAULT NULL,
  user_password TEXT DEFAULT NULL,
  user_data JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Обновляем данные пользователя
  UPDATE auth.users
  SET
    email = COALESCE(user_email, email),
    encrypted_password = CASE
      WHEN user_password IS NOT NULL THEN crypt(user_password, gen_salt('bf'))
      ELSE encrypted_password
    END,
    raw_user_meta_data = COALESCE(user_data, raw_user_meta_data),
    updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Предоставляем права на выполнение функции
GRANT EXECUTE ON FUNCTION auth.update_user TO authenticated;

-- Создаем функцию для проверки прав доступа
CREATE OR REPLACE FUNCTION public.check_permissions()
RETURNS TABLE (
  table_name TEXT,
  has_select BOOLEAN,
  has_insert BOOLEAN,
  has_update BOOLEAN,
  has_delete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    has_table_privilege('authenticated', t.tablename, 'SELECT'),
    has_table_privilege('authenticated', t.tablename, 'INSERT'),
    has_table_privilege('authenticated', t.tablename, 'UPDATE'),
    has_table_privilege('authenticated', t.tablename, 'DELETE')
  FROM
    pg_tables t
  WHERE
    t.schemaname = 'public';
END;
$$;

-- Предоставляем права на выполнение функции
GRANT EXECUTE ON FUNCTION public.check_permissions TO anon, authenticated, service_role;
