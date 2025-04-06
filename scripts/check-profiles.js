// Скрипт для проверки структуры таблицы profiles
const { createClient } = require('@supabase/supabase-js');
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

async function checkProfiles() {
  try {
    // Получаем первую запись из таблицы profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Структура записи в таблице profiles:');
      console.log(JSON.stringify(data[0], null, 2));
      
      // Выводим список всех полей
      console.log('\nСписок полей:');
      const fields = Object.keys(data[0]);
      fields.forEach(field => {
        console.log(`- ${field}: ${typeof data[0][field]}`);
      });
      
      // Проверяем наличие поля role
      if (fields.includes('role')) {
        console.log('\nПоле role присутствует в таблице profiles');
      } else {
        console.log('\nПоле role отсутствует в таблице profiles');
      }
    } else {
      console.log('Таблица profiles пуста или не существует');
    }
  } catch (error) {
    console.error('Ошибка при получении данных из таблицы profiles:', error);
  }
}

checkProfiles();
