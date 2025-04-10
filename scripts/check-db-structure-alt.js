// Скрипт для проверки структуры базы данных (альтернативный метод)
const { createClient } = require('@supabase/supabase-js');

// Получаем переменные окружения из .env.local
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Загружаем переменные окружения из .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL или ключ не найдены в переменных окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  try {
    console.log('Проверка структуры базы данных...');

    // Пытаемся получить список таблиц с помощью функции get_tables
    try {
      const { data: tables, error: tablesError } = await supabase.rpc('get_tables');

      if (tablesError) {
        console.error('Ошибка при получении списка таблиц через RPC:', tablesError.message);
      } else if (tables) {
        console.log('Список таблиц:', tables);
      }
    } catch (e) {
      console.log('Функция get_tables не найдена или недоступна:', e.message);
    }

    // Проверяем наличие основных таблиц
    const requiredTables = ['profiles', 'projects', 'project_members', 'project_stages', 'project_meta', 'project_reviews'];

    for (const tableName of requiredTables) {
      await checkTable(tableName);
    }

    console.log('Проверка завершена');
  } catch (error) {
    console.error('Ошибка при проверке структуры базы данных:', error);
  }
}

async function checkTable(tableName) {
  try {
    // Пытаемся получить одну запись из таблицы
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Ошибка при проверке таблицы ${tableName}:`, error.message);
      return false;
    }

    console.log(`Таблица ${tableName} существует`);

    // Получаем структуру таблицы с помощью SQL-запроса
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_info', { table_name: tableName });

    if (columnsError) {
      console.log(`Не удалось получить структуру таблицы ${tableName} через RPC:`, columnsError.message);

      // Альтернативный метод: получаем структуру таблицы с помощью SQL-запроса
      const { data: columnsAlt, error: columnsAltError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');

      if (columnsAltError) {
        console.log(`Не удалось получить структуру таблицы ${tableName} через SQL:`, columnsAltError.message);
      } else if (columnsAlt) {
        console.log(`Структура таблицы ${tableName}:`);
        console.log(JSON.stringify(columnsAlt, null, 2));
      }
    } else if (columns) {
      console.log(`Структура таблицы ${tableName}:`);
      console.log(JSON.stringify(columns, null, 2));
    }

    return true;
  } catch (error) {
    console.error(`Ошибка при проверке таблицы ${tableName}:`, error);
    return false;
  }
}

// Запускаем проверку
checkDatabaseStructure();
