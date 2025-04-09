-- Проверяем, включен ли RLS для таблицы projects
SELECT
    relname AS table_name,
    relrowsecurity AS row_level_security_enabled
FROM
    pg_class
WHERE
    relname = 'projects';

-- Проверяем существующие RLS политики для таблицы projects
SELECT
    polname AS policy_name,
    polcmd AS command,
    polpermissive AS permissive,
    polroles::text AS roles,
    polqual::text AS using_expression,
    polwithcheck::text AS with_check_expression
FROM
    pg_policy
WHERE
    polrelid = 'projects'::regclass;

-- Включаем RLS для таблицы projects (если еще не включен)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики для обновления проектов
DROP POLICY IF EXISTS "Администраторы могут обновлять любые проекты" ON projects;
DROP POLICY IF EXISTS "Владельцы могут обновлять свои проекты" ON projects;

-- Создаем политику для обновления проектов администраторами
CREATE POLICY "Администраторы могут обновлять любые проекты"
ON projects FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.roles = 'admin'
  )
);

-- Создаем политику для обновления проектов владельцами
CREATE POLICY "Владельцы могут обновлять свои проекты"
ON projects FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Проверяем обновленные RLS политики для таблицы projects
SELECT
    polname AS policy_name,
    polcmd AS command,
    polpermissive AS permissive,
    polroles::text AS roles,
    polqual::text AS using_expression,
    polwithcheck::text AS with_check_expression
FROM
    pg_policy
WHERE
    polrelid = 'projects'::regclass;
