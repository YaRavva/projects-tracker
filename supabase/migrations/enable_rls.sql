-- Включаем RLS для таблицы profiles обратно
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Обновляем политики для таблицы profiles
DROP POLICY IF EXISTS "Разрешить создание профилей" ON public.profiles;

-- Создаем новую политику для создания профилей
CREATE POLICY "Разрешить создание профилей при регистрации" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Разрешаем создание профиля, если id совпадает с id пользователя
    auth.uid() = id
  );
