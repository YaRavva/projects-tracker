-- Скрипт для проверки и обновления существующих пользователей

-- Получаем список всех пользователей из auth.users
WITH auth_users AS (
  SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'name' as name
  FROM auth.users
)

-- Вставляем записи для пользователей, которых нет в таблице profiles
INSERT INTO public.profiles (id, email, full_name, roles)
SELECT 
  au.id, 
  au.email, 
  COALESCE(au.full_name, au.name, au.email) as full_name,
  'student' as roles
FROM auth_users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Выводим список пользователей, для которых были созданы записи
SELECT 
  p.id, 
  p.email, 
  p.full_name, 
  p.roles
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
