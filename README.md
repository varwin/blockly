# Varwin Blockly

Это форк Google Blockly с доработками для Varwin. Основная фича: "Модули", которая сильно затрагивает core.

# Алгорит обновления репозитория

1. Подтягиваем изменения из google/blockly. (Github сам предложит это сделать, если обнаружит новые коммиты в master google/blockly)
2. Если есть конфликты, будет создан PR для мерджа
3. Переходим на ветку слияния и решаем все конфликты
4. Выполняем npm run build
5. Запускаем локальный playground, которые лежит в tests/playground.html
6. Если обнаруживаются ошибки, то переходим к пункту 3 и решаем возникшие проблемы. Обратите внимание на раздел с частыми проблемами ниже
7. Выполняем npm run prepare
8. Переходим в директорию dist
9. Выполняем npm publish

# Как удобно тестить Varwin Blockly сразу в RMS

Можно вызывать gulp package с аргументом --output "path" где path это путь до папки blockly в node_modules RMS.  
Учитывайте, что путь должен быть относительно корня репозитория Varwin Blockly

Т.е.
1. Что-то исправляем в Varwin Blockly
2. Вызываем npm run build
3. Вызываем gulp package --output "~/node_modules/blockly/"
4. Запускаем сборку RMS (или hot reload сам подтянет node_modules)
5. Дебажим

# Частые проблемы

### Playground не может найти файлы

Идем в файл /blockly_uncompresed.js и исправляем пути до файлов.

### Build падает с ошибкой "No supported platform for closure-compiler found"

Можно попробовать установить не поддерживаемый пакет google-closure-compiler-js.  
Затем залезть в node_modules/google-closure-compiler/lib/utils.js и в методе getFirstSupportedPlatform всегда возвращать  
"google-closure-compiler-js".

Так пакет будет собираться средствами node.js, но это медленнее, зато работает. Пока что.
