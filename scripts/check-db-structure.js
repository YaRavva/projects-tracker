// Скрипт для проверки структуры таблицы profiles
import { createClient } from '@supabase/supabase-js';

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

async function checkTableStructure() {
  try {
    // Получаем информацию о структуре таблицы profiles
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'profiles' });
    
    if (error) {
      throw error;
    }
    
    console.log('Структура таблицы profiles:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Ошибка при получении структуры таблицы:', error);
  }
}

checkTableStructure();
