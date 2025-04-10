// Скрипт для проверки структуры базы данных (простой метод)
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
    
    console.log(`Таблица ${tableName} существует и доступна`);
    console.log(`Количество записей: ${data ? data.length : 0}`);
    
    if (data && data.length > 0) {
      console.log(`Пример данных:`, JSON.stringify(data[0], null, 2));
    }
    
    return true;
  } catch (error) {
    console.error(`Ошибка при проверке таблицы ${tableName}:`, error);
    return false;
  }
}

// Запускаем проверку
checkDatabaseStructure();
