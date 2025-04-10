// Скрипт для создания favicon.png из favicon.svg
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { DOMParser } = new JSDOM().window;

async function createFaviconPng() {
  try {
    console.log('Создание favicon.png из favicon.svg...');
    
    // Путь к файлам
    const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
    const pngPath = path.join(__dirname, '..', 'public', 'favicon.png');
    
    // Чтение SVG файла
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Создание canvas
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    
    // Заполнение фона
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, 32, 32);
    
    // Рисование контура
    ctx.strokeStyle = '#32BC7C';
    ctx.lineWidth = 2;
    
    // Рисование прямоугольника
    ctx.beginPath();
    ctx.roundRect(4, 4, 24, 24, 4);
    ctx.stroke();
    
    // Рисование верхней панели
    ctx.beginPath();
    ctx.roundRect(8, 4, 16, 6, 2);
    ctx.stroke();
    
    // Рисование круга в верхней панели
    ctx.fillStyle = '#32BC7C';
    ctx.beginPath();
    ctx.arc(16, 7, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисование линий
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.lineTo(20, 14);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, 18);
    ctx.lineTo(18, 18);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(16, 22);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, 26);
    ctx.lineTo(14, 26);
    ctx.stroke();
    
    // Рисование круга с галочкой
    ctx.beginPath();
    ctx.arc(21, 24, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Рисование галочки
    ctx.beginPath();
    ctx.moveTo(18, 24);
    ctx.lineTo(20, 26);
    ctx.lineTo(24, 22);
    ctx.stroke();
    
    // Сохранение PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`favicon.png успешно создан: ${pngPath}`);
  } catch (error) {
    console.error(`Ошибка при создании favicon.png: ${error.message}`);
  }
}

// Проверка наличия необходимых модулей
try {
  require('canvas');
  require('jsdom');
  createFaviconPng();
} catch (error) {
  console.error('Необходимые модули не установлены. Пожалуйста, установите их:');
  console.error('npm install canvas jsdom');
  console.error('Или используйте онлайн-конвертер, например: https://convertio.co/svg-png/');
}
