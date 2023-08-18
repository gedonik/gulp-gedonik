# Gulp - сборка gedonik

> Используется Gulp 4

## Начало работы

Для работы с данной сборкой в новом проекте, склонируйте все содержимое репозитория <br>
`git clone <this repo>`
Затем, находясь в корне проекта, запустите команду `npm i`, которая установит все находящиеся в package.json зависимости.
После этого вы можете использовать любую из предложенных команд сборки (итоговые файлы попадают в папку __prod__ корневой директории): <br>
`gulp` - базовая команда, которая запускает сборку для разработки, используя browser-sync

`gulp build` - команда для продакшн-сборки проекта. Все ассеты сжаты и оптимизированы для выкладки на хостинг.

`gulp zip` - команда собирает ваш готовый код в zip-архив.

## Структура папок и файлов

```
├── src/                          # Исходники
│   ├── js                        # Скрипты
│   │   └── main.js               # Главный скрипт
│   │   ├── libs.js               # файл с подключениями библиотек
│   │   ├── components.js         # файл с подключениями компонентов
│   │   ├── components            # js-компоненты
│   │   ├── libs                  # папка для загрузки локальных версий библиотек
│   ├── scss                      # Стили сайта (препроцессор sass в scss-синтаксисе)
│   │   └── main.scss             # Главный файл стилей
│   │   └── libs.scss             # Файл для подключения стилей библиотек из папки vendor
│   │   └── _fonts.scss           # Файл для подключения шрифтов (можно использовать миксин)
│   │   └── _vars.scss            # Файл для написания css- или scss-переменных
│   │   └── _settings.scss        # Файл для написания глобальных стилей
│   │   ├── components            # scss-компоненты
│   │   ├── libs                  # папка для хранения локальных css-стилей библиотек
│   ├── html                      # папка для хранения html-частей страницы
│   │   ├── components            # html-компоненты
│   │   ├── pages                 # html-страницы
│   │   │   └── index.html        # Главный html-файл
│   ├── img                       # папка для хранения картинок
│   │   ├── svg                   # специальная папка для преобразования svg в спрайт
│   ├── files                     # папка для хранения иных ассетов - php, видео-файлы, favicon и т.д.
│   ├── fonts                     # папка для хранения шрифтов в формате woff2
└── gulpfile.js                   # файл с настройками Gulp
└── package.json                  # файл с настройками сборки и установленными пакетами
└── README.md                     # документация сборки
```

## Оглавление
1. [Работа с html](#работа-с-html)
2. [Работа с CSS](#работа-с-css)
3. [Работа с JavaScript](#работа-с-javascript)
4. [Работа со шрифтами](#работа-со-шрифтами)
5. [Работа с изображениями](#работа-с-изображениями)
6. [Работа с иными ресурсами](#работа-с-иными-ресурсами)

## Работа с html

Благодаря плагину __gulp-file-include__ вы можете разделять html-файл на различные шаблоны, которые должны храниться в папке __html/components__ и __html/pages__. Удобно делить html-страницу на секции.

> Для вставки html-частей в главный файл используйте `@@include('partials/filename.html')`

Если вы хотите создать многостраничный сайт - копируйте __index.html__, переименовывайте как вам нужно, и используйте.

При использовании команды `gulp build`, вы получите минифицированный html-код в одну строку для всех html-файлов.

## Работа с CSS

В сборке используется препроцессор __sass__ в синтаксисе __scss__.

Стили, написанные в __components__, следует подключать в __main.scss__.

Чтобы подключить сторонние css-файлы (библиотеки) - положите их в папку __libs__ и подключите в файле ___libs.scss__

Если вы хотите использовать scss-переменные - подключите ___vars.scss__ также в main.scss или в любое другое место, где он нужен, но обязательно удалите __:root__.

> Для подключения css-файлов используйте директиву `@import`

В итоговой папке __prod/css__ создаются два файла: <br> __main.css__ - для стилей страницы, <br> __libs.css__ - для стилей всех библиотек, использующихся в проекте.

При использовании команды `gulp build`, вы получите минифицированный css-код в одну строку для всех css-файлов. 

## Работа с JavaScript

Для сборки JS-кода используется webpack.

JS-код лучше делить на компоненты - небольшие js-файлы, которые содержат свою, изолированную друг от друга реализацию. Такие файлы помещайте в папку __components__, а потом импортируйте в файл ___components.js__

В файле __main.js__ ничего менять не нужно, он сделан просто как результирующий.

Подключать сторонние библиотеки можно через npm, для этого существует файл ___libs.js__. Импортируйте туда подключения.

Если какой-то библиотеки нет в npm или просто нужно подключить что-либо локальным файлом - кладите его в папку __libs__ и точно так же импортируйте, но уже с путем до файла.

При использовании команды `gulp build`, вы получите минифицированный js-код в одну строку для всех js-файлов.

## Работа со шрифтами

Т.к. автор не поддерживает IE11, в сборке реализована поддержка только формата __woff2__ (это значит, что в миксине подключения шрифтов используется только данный формат).

Загружайте файлы __woff2__ в папку __fonts__, а затем вызывайте миксин `@font-face` в файле ___fonts.scss__.

Также не забудьте прописать эти же шрифты в `<link preload>` в html.

## Работа с изображениями

Любые изображения кладите в папку __img__.

Если вам нужно сделать svg-спрайт, кладите нужные для спрайта svg-файлы в папку __img/svg__. При этом, такие атрибуты как fill, stroke, style будут автоматически удаляться. Иные svg-файлы просто оставляйте в папке __img__.

При использовании команды `gulp build`, вы получите минифицированные изображения в итоговой папке __img__.

В сборке доступна поддержка __webp__ и __avif__ форматов. Подключить их вы можете через тег `picture`. Для background можно использовать обычные __jpg__ или __png__, либо использовать `image-set` там, где это возможно.

## Работа с иными ресурсами

Любые ресурсы (ассеты) проекта, под которые не отведена соответствующая папка, должны храниться в папке __files__. Это могут быть видео-файлы, php-файлы (как, например, файл отправки формы) и прочие.
