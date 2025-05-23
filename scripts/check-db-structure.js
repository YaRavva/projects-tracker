// Скрипт для проверки структуры базы данных
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

    // Проверяем наличие основных таблиц
    const tables = ['profiles', 'projects', 'project_members', 'project_stages', 'project_meta', 'project_reviews'];

    for (const table of tables) {
      await checkTable(table);
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

    // Получаем структуру таблицы
    try {
      const { data: columns, error: columnsError } = await supabase.rpc('get_table_info', { table_name: tableName });

      if (columnsError) {
        console.log(`Не удалось получить структуру таблицы ${tableName} через RPC`);
      } else {
        console.log(`Структура таблицы ${tableName}:`);
        console.log(JSON.stringify(columns, null, 2));
      }
    } catch (e) {
      console.log(`Не удалось получить структуру таблицы ${tableName}:`, e.message);
    }

    return true;
  } catch (error) {
    console.error(`Ошибка при проверке таблицы ${tableName}:`, error);
    return false;
  }
}

// Запускаем проверку
checkDatabaseStructure();
