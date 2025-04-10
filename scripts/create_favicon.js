// Скрипт для создания favicon.ico
const fs = require('fs');
const path = require('path');

console.log('Создание favicon.ico...');

// Создаем заглушку для favicon.ico
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

// Базовая иконка в формате ICO (16x16 пикселей)
const icoHeader = Buffer.from([
  0x00, 0x00,             // Reserved, must be 0
  0x01, 0x00,             // Image type: 1 for icon (.ICO)
  0x01, 0x00,             // Number of images in the file: 1
  0x10, 0x10,             // Width and height of image: 16x16 pixels
  0x00,                   // Number of colors in the color palette: 0 (no palette)
  0x00,                   // Reserved, must be 0
  0x01, 0x00,             // Color planes: 1
  0x20, 0x00,             // Bits per pixel: 32
  0x28, 0x00, 0x00, 0x00, // Size of the image data: 40 bytes for BITMAPINFOHEADER + pixel data
  0x16, 0x00, 0x00, 0x00  // Offset of the image data from the beginning of the file: 22 bytes
]);

// BITMAPINFOHEADER структура (40 байт)
const bmpInfoHeader = Buffer.from([
  0x28, 0x00, 0x00, 0x00, // Size of this header: 40 bytes
  0x10, 0x00, 0x00, 0x00, // Width: 16 pixels
  0x20, 0x00, 0x00, 0x00, // Height: 32 pixels (16 pixels for XOR mask + 16 pixels for AND mask)
  0x01, 0x00,             // Planes: 1
  0x20, 0x00,             // Bits per pixel: 32
  0x00, 0x00, 0x00, 0x00, // Compression: 0 (no compression)
  0x00, 0x00, 0x00, 0x00, // Image size: 0 (can be 0 for BI_RGB)
  0x00, 0x00, 0x00, 0x00, // X pixels per meter: 0 (not specified)
  0x00, 0x00, 0x00, 0x00, // Y pixels per meter: 0 (not specified)
  0x00, 0x00, 0x00, 0x00, // Colors used: 0 (all colors are used)
  0x00, 0x00, 0x00, 0x00  // Important colors: 0 (all colors are important)
]);

// Создаем пиксельные данные для иконки (16x16 пикселей, 32 бита на пиксель)
// Формат: B, G, R, A (обратный порядок от обычного RGBA)
const pixelData = Buffer.alloc(16 * 16 * 4); // 16x16 пикселей, 4 байта на пиксель

// Заполняем пиксельные данные (прозрачный фон с зеленым блокнотом)
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    const offset = (y * 16 + x) * 4;

    // По умолчанию прозрачный фон
    pixelData[offset] = 0;     // B
    pixelData[offset + 1] = 0; // G
    pixelData[offset + 2] = 0; // R
    pixelData[offset + 3] = 0; // A (полностью прозрачный)

    // Зеленый блокнот - занимает почти всю область

    // Основная форма блокнота
    if (
      // Основная часть блокнота
      (x >= 2 && x <= 14 && y >= 1 && y <= 15) ||
      // Угол с загибом
      (x >= 10 && x <= 14 && y >= 1 && y <= 4)
    ) {
      // Зеленый цвет проекта
      pixelData[offset] = 124;     // B
      pixelData[offset + 1] = 188; // G (зеленый)
      pixelData[offset + 2] = 50;  // R
      pixelData[offset + 3] = 255; // A
    }

    // Добавляем линии текста
    if ((y === 5 || y === 8 || y === 11) && x >= 4 && x <= 12) {
      // Более светлый зеленый для линий
      pixelData[offset] = 200;     // B
      pixelData[offset + 1] = 255; // G (ярко-зеленый)
      pixelData[offset + 2] = 150;  // R
      pixelData[offset + 3] = 255; // A
    }
  }
}

// AND маска (16x16 пикселей, 1 бит на пиксель, выровнено до 4 байт на строку)
// Все биты установлены в 0, что означает, что все пиксели непрозрачные
const andMask = Buffer.alloc(16 * 2); // 16 строк, 2 байта на строку (16 бит, выровнено до 4 байт)

// Объединяем все части в один буфер
const basicIcoContent = Buffer.concat([icoHeader, bmpInfoHeader, pixelData, andMask]);

fs.writeFileSync(faviconPath, basicIcoContent);
console.log(`Favicon.ico создан: ${faviconPath}`);

