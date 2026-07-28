# Итоговое задание агентам: переключаемые Pokémon и Comic Quest темы

Статус документа: **final / source of truth для реализации**.

Этот документ заменяет все предыдущие версии задания по комикс-теме. Если
старые формулировки или предположения противоречат этому документу, использовать
этот документ.

## 1. Проект и проверенная исходная точка

Рабочий проект:

`D:\SD\personal\projects\lucky-learning-world`

Аудит выполнен 26 июля 2026 года после серии вечерних изменений.

Проверенная исходная версия приложения:

- application baseline: commit `b10db88`;
- видимая версия: `v2.0.0-v16`;
- zero-build PWA на Vanilla JS и ES modules;
- Parent Controls защищены 4-значным PIN;
- service worker использует Network-First с cache fallback;
- service worker `controllerchange` выполняет однократный auto-reload при
  фактическом обновлении PWA;
- version badge и diagnostics получают версию из `APP_VERSION`;
- touch actions используют единый click binding без пары `touchend + click`;
- действуют QR sharing, Victory Card, LINE/Web Share и reporter;
- интерфейс игры полностью на английском;
- на исходной точке проходят 51 из 51 тестов командой
  `node --test tests/*.test.mjs`;
- рабочее дерево на момент аудита чистое.

Перед реализацией каждый агент обязан:

1. прочитать корневой `D:\SD\AGENTS.md`;
2. прочитать проектные `AGENTS.md` и `DEVELOPMENT_RULES.md`;
3. работать от последнего актуального commit основной ветки, а не возвращать
   репозиторий к `b10db88`;
4. запустить baseline-тесты;
5. не откатывать сегодняшние исправления навигации, touch, модалок, QR,
   Parent PIN, cache и английского UI.

## 2. Контекст продукта

Лаки, 10 лет, охотно читает `Dog Man and Cat Kid`, потому что чтение ощущается
как весёлая последовательность событий:

- короткие реплики вместо длинных блоков;
- понятные эмоции персонажей;
- действие разбито на небольшие кадры;
- яркий фон сразу задаёт настроение;
- текст является частью истории;
- переход к следующему фрагменту хочется сделать самому.

Нужно перенести **эти общие принципы вовлечения** в Lucky's Learning World, не
копируя конкретную книгу.

## 3. Цель релиза

Добавить в существующую игру вторую полноценную тему и дать родителю менять тему
в уже существующих защищённых Parent Controls.

После релиза доступны:

1. **Pokémon Adventure** — текущая Pokémon-тема, сохранённая как тема по
   умолчанию;
2. **Comic Quest** — новая оригинальная тема интерактивного детского комикса.

Обе темы работают поверх одной учебной игры, одного прогресса и одного набора
уроков. Переключение темы меняет presentation layer, но не начинает новую игру.

Главный продуктовый критерий Comic Quest: **Лаки интересно читать сам интерфейс,
реплики и объяснения, а не только нажимать правильные ответы.**

## 4. Зафиксированные продуктовые решения

Эти решения не оставляются на усмотрение реализующих агентов:

1. Текущая тема называется **Pokémon Adventure**, id темы — `pokemon`.
2. Новая тема называется **Comic Quest**, id темы — `comic`.
3. Если сохранённого выбора нет, используется `pokemon`.
4. Pokémon-тема и существующая папка `pokemon/` сохраняются.
5. Comic Quest использует только новые оригинальные изображения и персонажей.
6. Выбор темы находится **только внутри Parent Controls & Settings**, после
   успешного ввода Parent PIN.
7. На детских экранах отдельной кнопки смены темы нет.
8. Тема применяется немедленно, без reload.
9. Текущий вопрос, введённые буквы, режим Spelling, счёт и открытый экран при
   смене темы не сбрасываются.
10. Выбор темы сохраняется и переживает reload, offline reload и повторный
    запуск установленной PWA.
11. Progress reset не меняет выбранную тему.
12. Смена темы не меняет Parent PIN.
13. Share/QR-ссылка не навязывает тему другому устройству: на устройстве
    получателя остаётся выбор его родителя.
14. Новый backend, framework, bundler и аккаунты в эту работу не входят.
15. Развёртывание production не входит в задачу без отдельного решения владельца.

## 5. Обязательные ограничения проекта

### 5.1. Язык

Весь пользовательский интерфейс, включая новый раздел Appearance, preview,
подсказки, ошибки и aria-label, должен быть **100% English**.

Русский разрешён в этом техническом задании, комментариях для разработчиков и
handoff, но не в игре.

### 5.2. Touch и навигация

- любой интерактивный элемент — минимум 64 × 64 px;
- `touch-action: manipulation` для интерактивных контейнеров;
- дочерние элементы кнопок не перехватывают pointer events;
- переход в Math/Word/Pokédex остаётся привязан только к явной action-кнопке,
  не ко всему `.realm-card`;
- сохранить click-only binding версии v16; не возвращать одновременную подписку
  на `touchend + click`, которая может выполнить действие дважды;
- Back/Previous на первом элементе должен быть действительно `disabled`;
- active tabs и bottom nav сохраняют высококонтрастный индикатор.

Существующие inline-высоты 42/48/56 px в Parent modal не считать правильным
примером. При переработке Parent Settings все затронутые controls привести к
требованию 64 px.

### 5.3. Модалки

- `max-height: 85vh` на desktop;
- `max-height: 92vh` на mobile;
- `overflow-y: auto`;
- заголовок и Done/Close остаются достижимыми;
- background scroll блокируется, пока открыта модалка;
- не возвращать `touch-action: none` на `body.modal-open`, удалённый в v16;
- закрытие одной модалки не снимает scroll lock, если другая ещё открыта;
- новая секция Appearance не должна сделать Parent Settings непригодной на
  iPhone/iPad portrait.

### 5.4. Parent PIN

- сохранить 4-значный PIN;
- default PIN остаётся `1234`;
- пользовательский PIN остаётся в `localStorage["lucky_parent_pin"]`;
- не заменять PIN арифметической задачей;
- theme selector доступен только после успешной проверки PIN.

### 5.5. Zero-build

- Vanilla JS и нативные ES modules;
- без npm runtime dependencies;
- без Vite/Webpack/React/Vue;
- запуск через статический HTTP server;
- пути совместимы с GitHub Pages subpath;
- ES module imports продолжают использовать согласованный cache-busting suffix.

Network-First стратегию не заменять обратно на stale Cache-First. После хотя бы
одного успешного online-запуска выбранной темы её shell и необходимые assets
должны быть доступны при offline reload.

Сохранить текущий однократный `controllerchange` auto-reload при обновлении
service worker. Обычная смена темы не должна регистрировать новый worker,
вызывать `controllerchange` или перезагружать страницу.

## 6. Граница по авторским правам

### 6.1. Pokémon Adventure

Владелец явно решил сохранить существующую Pokémon-тему для семейной игры.

В рамках этого задания:

- не удалять текущие 46 файлов из `pokemon/`;
- не переименовывать текущих Pokémon-персонажей в Pokémon-теме;
- не ломать существующие evolution/shiny/mega ladders;
- не скачивать дополнительные Pokémon-материалы;
- не заявлять, что проект или ассеты лицензированы/одобрены правообладателями;
- не расширять использование этих материалов за текущую область проекта.

Это техническое задание не является лицензией и не решает вопрос прав на
публичное распространение Pokémon-материалов.

### 6.2. Comic Quest

Книга используется только как референс общих приёмов комикса.

В Comic Quest запрещено:

- использовать Dog Man, Cat Kid и другие имена/персонажей книги;
- копировать логотип, обложку, панели, реплики или композицию страницы;
- обводить или перерисовывать предоставленные фотографии;
- имитировать точный узнаваемый почерк конкретного автора;
- использовать сканы книги или найденные в интернете официальные арты;
- делать «почти такого же» героя с минимально изменёнными деталями.

Разрешено:

- использовать общую грамматику комиксов: frames, captions, speech bubbles,
  action bursts, motion lines, halftone;
- создавать собственных животных-помощников, собственные реплики и сцены;
- создавать оригинальные CSS/SVG/PNG/WebP assets специально для проекта.

Фотографии книги в репозиторий не добавлять.

## 7. Что должно сохраниться без функциональных изменений

- Math ×6, ×7, ×8, ×9, ×10 и Mix;
- текущие правила генерации Math-сессий;
- no-lose исправление ошибки и повтор проблемного факта;
- звёзды, unlocks, rewards и collection leveling;
- Spelling Page 22, Schwa ‹or›, текущие 18 слов;
- Spelling Learn, Test и Game;
- Digital и Paper Test;
- локальные word/definition audio и TTS fallback;
- onboarding и выбор starter;
- Pokédex/collection с 15 collectible characters;
- QR modal, URL copy, Victory Card и LINE/Web Share;
- reporter;
- Parent PIN, progress resets и Hard Facts Focus;
- version badge и diagnostics;
- bottom navigation и возврат в Hub;
- Network-First PWA update behaviour;
- все существующие localStorage-ключи и сохранённый прогресс.

Не менять pure learning engines только ради темы.

## 8. Модель данных темы

### 8.1. Storage

Создать отдельный стабильный ключ:

```text
lucky_learning_theme
```

Допустимые значения:

```text
pokemon
comic
```

Причины отдельного ключа:

- `lmm3s:settings` уже зарезервирован для Math parent settings;
- в `app.js` и `content/settings.js` сейчас есть разные наборы Math defaults;
- тема не должна случайно изменить количество warmup, thresholds или
  Hard Facts Focus;
- legacy `lucky-spelling-theme` относится к старому spelling-приложению и не
  должен перезаписываться новой общей темой.

В эту задачу не входит исправление расхождения Math defaults. Не объединять его
с темой без отдельного решения владельца.

### 8.2. Безопасная загрузка

- чтение и запись localStorage обёрнуты в `try/catch`;
- `null`, неизвестная строка, объект или повреждённое значение дают fallback
  `pokemon`;
- тема устанавливается на `<html data-theme="pokemon|comic">`;
- атрибут устанавливается до первого paint, чтобы Comic Quest не мигал
  Pokémon-темой и наоборот;
- `meta[name="theme-color"]` и `color-scheme` синхронизируются с выбором;
- DOM и игровые engine instances не пересоздаются.

### 8.3. Стабильная идентичность героев

Прогресс коллекции хранит постоянные ids, например:

- residents: `res_x6` … `res_x10`;
- collectibles: `embercub`, `leafling`, `bubblit` … `moonkit`.

Эти ids и reward pools не менять.

Для каждого id существует presentation в каждой теме:

```js
{
  id: "embercub",
  name: "Growlithe",          // pokemon
  art: { src, stages, ... }
}

{
  id: "embercub",
  name: "Ember Cub",         // comic
  art: { src, stages, ... }
}
```

Тема может менять display name, art, stage art и тематическую подпись, но не id,
уровень, shiny/stage position, ownership или reward eligibility.

Comic mapping обязан покрывать:

- все 5 residents;
- все 15 collectibles;
- 3 onboarding starter presentations;
- Math Mix fallback;
- Spelling Game opponent;
- victory/share/QR fallback.

В generic `app.js` и `index.html` не должно остаться безусловных fallback вроде
`pokemon/pikachu.png` или имени `Pikachu`. Все такие значения разрешаются через
активную тему.

## 9. Parent Controls: точный UX

В существующий `#parent-settings-modal` добавить секцию:

```text
APPEARANCE
Choose Lucky's game theme.
```

Секция содержит две крупные radio-card:

### Pokémon Adventure

- subtitle: `Current Pokémon world`;
- preview тёмного неонового интерфейса;
- Pokémon/pokéball визуальный маркер из уже имеющихся локальных assets;
- value: `pokemon`.

### Comic Quest

- subtitle: `A funny interactive comic`;
- preview светлой paper/ink темы;
- оригинальный comic burst/персонаж;
- value: `comic`.

Поведение:

1. Открыть Parent Controls через существующую кнопку `#btn-parent-mode-header`.
2. Ввести PIN.
3. Увидеть текущую тему отмеченной `Selected`.
4. Нажать другую карточку.
5. Тема применяется сразу, модалка остаётся открытой.
6. Выбор сохраняется.
7. После Done/Close пользователь возвращается в тот же экран и состояние.

Требования доступности:

- использовать нативные radio inputs или полноценный radiogroup contract;
- `aria-checked`/checked соответствует реальному состоянию;
- выбор отличим не только цветом;
- focus outline хорошо виден в обеих темах;
- клавиши Space/Enter выбирают тему;
- Escape закрывает модалку;
- фокус после закрытия возвращается на Parent Settings trigger;
- смена темы объявляется через `aria-live`, например
  `Comic Quest theme applied`;
- все тексты на английском;
- карточки и Done/Close — минимум 64 px по высоте.

Не добавлять третью тему, `Auto`, расписание или автоматическую смену по времени.

## 10. Визуальный контракт тем

### 10.1. Pokémon Adventure

Это существующая тема, а не новый редизайн.

Нужно сохранить:

- тёмный фон `#0f1225`;
- текущий glassmorphism;
- текущие cyan/red/orange realm gradients;
- текущих Pokémon, Pokédex, evolution/shiny/mega stages;
- текущие названия и смысл пользовательских экранов;
- текущие анимации, если они не нарушают reduced motion;
- текущее отображение Math, Spelling, onboarding, victory и collection.

Допустимы только изменения, необходимые для общей theme infrastructure,
accessibility и устранения theme-specific hardcodes.

Критерий: после абстракции Pokémon Adventure не выглядит как случайно
перекрашенная Comic Quest.

### 10.2. Comic Quest

Общее направление:

- тёплая светлая бумага;
- тёмная контрастная обводка 3–5 px;
- плоские яркие цвета;
- панели с понятной иерархией;
- speech bubbles для коротких реплик;
- caption boxes для контекста;
- action bursts только для важных событий;
- немного halftone/motion lines как декор;
- оригинальные выразительные животные;
- одна главная учебная точка внимания на экран;
- анимации реакции до 400 ms;
- полноценный `prefers-reduced-motion`.

Рекомендуемые tokens:

```text
paper   #FFF8E8
ink     #202020
blue    #35A7FF
orange  #FF9F1C
pink    #FF5D8F
green   #A7D129
purple  #9B5DE5
```

Цвета можно уточнить после contrast audit, не превращая тему в тёмный neon
glassmorphism.

Типографика:

- сохранить Fredoka/Outfit и системные fallback;
- не использовать шрифты или логотип книги;
- основной текст — минимум 16 px;
- вопрос — минимум 36 px mobile / 48 px tablet;
- comic feeling создаётся композицией, а не плохой читаемостью.

## 11. Comic Quest по экранам

### 11.1. Hub

- выглядит как обложка нового выпуска Lucky's Comic Quest;
- Math, Spelling и collection — три крупные панели-главы;
- текущий материал сразу виден: ×6–×10 и Page 22;
- короткий оригинальный caption предлагает выбрать следующую главу;
- переходы остаются только на явных action buttons;
- stars, QR и Parent Controls остаются доступны.

### 11.2. Math

Один вопрос воспринимается как один комикс-кадр:

- themed resident раскрывается по текущей reveal-механике;
- вопрос находится в центральной bubble/panel;
- ответы остаются крупными и мгновенными;
- правильный ответ вызывает короткую реакцию;
- неправильный ответ показывает спокойную обучающую реплику с правильным фактом;
- подтверждение исправления и requeue работают без изменений;
- декор не задерживает следующий вопрос дольше 400 ms.

### 11.3. Spelling Learn

Каждое слово — мини-страница:

- крупное слово;
- Speak Word;
- предметная иллюстрация;
- английское определение в отдельной bubble/panel;
- Listen to Definition;
- Back/Next как перелистывание;
- Back disabled на первом слове;
- Page 22 / Schwa ‹or› видны, но не перекрывают слово.

Текущие предметные изображения слов могут использоваться в обеих темах; Comic
Quest меняет их framing, а не учебное значение.

### 11.4. Spelling Test

- спокойнее Game и без лишней анимации;
- Digital input, Paper reveal и self-check сохраняются;
- голосовая кнопка может выглядеть как реплика диктора;
- ошибка объясняется без ощущения поражения;
- тема не раскрывает слово раньше существующей логики.

### 11.5. Spelling Game

- буквы выглядят как крупные comic cut-outs;
- hint находится в caption;
- themed opponent реагирует на прогресс;
- success завершает короткий кадр;
- touch и порядок букв не сбрасываются при смене темы.

### 11.6. Collection

В Pokémon Adventure видимое название остаётся `Pokédex`.

В Comic Quest видимое название — `Comic Crew`.

Внутренние route/DOM ids с `pokedex` можно сохранить для совместимости.

- 15 карточек и текущие уровни одинаковы в обеих темах;
- Pokémon theme показывает Pokémon presentation;
- Comic theme показывает оригинальную presentation того же id;
- locked state интригует, но не выглядит наказанием;
- смена темы не добавляет и не удаляет owned characters.

### 11.7. Onboarding

- starter choice использует активную тему;
- три текущих starter ids сохраняются;
- theme switch после onboarding корректно меняет starter presentation;
- player name и collection не пересоздаются.

### 11.8. Victory, QR и Share

- victory modal использует themed name/art текущей награды;
- Victory Card использует активную тему;
- generic fallback разрешается через theme catalog;
- QR modal остаётся работоспособной и видимой поверх других экранов;
- share URL не записывает тему получателю;
- тема не меняет score, sender name или challenge content.

### 11.9. Parent Controls

- сама модалка читаема в обеих темах;
- Appearance находится до destructive Reset Progress Data;
- diagnostics показывают активную тему;
- текущие PIN, reset и Hard Facts controls продолжают работать;
- theme selector не смешивается визуально с destructive actions.

## 12. Предпочтительная архитектура

Допустимая целевая структура:

```text
assets/
└── themes/
    └── comic/
        ├── characters/
        ├── scenes/
        └── ui/
content/
├── characters.js                 # текущий Pokémon catalog и стабильные ids
├── comic-characters.js           # comic presentation для тех же ids
└── themes.js                     # metadata, labels, colors, resolvers
theme-bootstrap.js                # early data-theme, до первого paint
themes.css                        # theme-specific visual layer
index.html
app.js
styles.css                        # shared layout и baseline
sw.js
manifest.json
```

Имена новых файлов можно уточнить, но должны сохраняться следующие границы:

- learning engines не знают о теме;
- reward/progression хранят ids, а не themed names/paths;
- theme resolver — единственное место сопоставления id → presentation;
- общий DOM используется обеими темами;
- CSS выбирает тему через `html[data-theme]`;
- нельзя дублировать всё приложение или создавать отдельные HTML-страницы;
- theme change не вызывает `location.reload()`;
- пользовательский текст вставляется безопасно через `textContent`;
- `innerHTML` с данными из URL/localStorage запрещён.

Не добавлять canvas как основу интерфейса. Canvas остаётся допустим для QR и
Victory Card.

## 13. Разделение работы между агентами

Использовать отдельные branches/worktrees. Не запускать нескольких агентов на
запись в один checkout и не давать двум агентам владение одним файлом.

### Агент 0 — координатор и интегратор

Эксклюзивно владеет:

- `index.html`;
- `app.js`;
- `styles.css`;
- `engine/share-controller.js`;
- `manifest.json`;
- `sw.js`;
- `README.md`;
- version/cache-busting markers.

Задачи:

- зафиксировать фактический baseline и тестовый результат;
- согласовать contracts новых модулей до параллельной работы;
- добавить Appearance в существующий Parent Settings;
- подключить early theme bootstrap;
- заменить generic hardcoded Pokémon fallbacks на resolver;
- обновлять static/dynamic labels по активной теме;
- интегрировать результаты остальных агентов;
- сохранить Parent PIN, QR, share и modal fixes;
- синхронно обновить `APP_VERSION`, reporter version, import suffixes,
  service-worker registration suffix, `CACHE_NAME` и diagnostics;
- не deploy без отдельного указания.

### Агент 1 — theme foundation

Эксклюзивно владеет новыми файлами:

- `content/themes.js`;
- `theme-bootstrap.js`;
- `themes.css`;
- `tests/theme-settings.test.mjs`.

Задачи:

- описать два theme ids и metadata;
- реализовать normalize/fallback;
- обеспечить early application без flash;
- подготовить CSS tokens обеих тем;
- сохранить Pokémon visual baseline;
- реализовать Comic Quest components;
- реализовать reduced motion;
- написать unit tests theme storage/validation contract.

Не менять `app.js` и `index.html` в своей ветке; передать интегратору точный API.

### Агент 2 — оригинальный Comic Quest art и presentation

Эксклюзивно владеет:

- `assets/themes/comic/**`;
- `content/comic-characters.js`;
- tests проверки полноты comic catalog.

Задачи:

- создать оригинальных героев для всех стабильных ids;
- подготовить residents, collectibles, starter, Mix и fallback;
- сохранить stage counts или дать безопасное тематическое соответствие каждому
  существующему уровню;
- обеспечить одинаковые aspect ratios/размеры без layout shift;
- добавить alt/display names на английском;
- проверить отсутствие материалов книги и чужих логотипов;
- не менять Pokémon files.

### Агент 3 — тестовый контракт и QA

Эксклюзивно владеет:

- `tests/theme-integration.test.mjs`;
- `tests/integration-imports.test.mjs`;
- test fixtures, если они необходимы;
- итоговой QA-матрицей в handoff.

Задачи:

- проверить DOM ids Parent selector;
- проверить полноту themed mappings;
- проверить безопасный fallback;
- проверить, что progress ids не зависят от темы;
- проверить отсутствие generic Pokémon fallbacks;
- проверить version/cache markers;
- провести regression audit существующих 51 теста;
- сформировать ручной сценарий visual/touch/offline QA.

Browser skill или управление встроенным браузером использовать только после
отдельного явного подтверждения владельца согласно корневому `AGENTS.md`.

## 14. Порядок интеграции

1. Baseline: latest main, clean status, 51 тест.
2. Согласовать theme ids, storage key и presentation API.
3. Агент 1 создаёт foundation.
4. Агент 2 создаёт original comic assets/catalog параллельно.
5. Агент 3 создаёт тестовые contracts параллельно.
6. Интегратор подключает Parent Appearance и resolver в `app.js/index.html`.
7. Влить foundation, затем art/catalog, затем tests.
8. Исправить только реальные интеграционные конфликты.
9. Обновить PWA/version/cache markers.
10. Выполнить automated tests.
11. После разрешения владельца выполнить browser visual QA.
12. Подготовить handoff; production deployment не выполнять.

## 15. Автоматические проверки

Обязательная команда перед каждым содержательным commit:

```powershell
node --test tests/*.test.mjs
```

Обязательные новые тесты:

1. `normalizeThemeId("pokemon") === "pokemon"`.
2. `normalizeThemeId("comic") === "comic"`.
3. неизвестное/повреждённое значение даёт `pokemon`.
4. отсутствие/ошибка localStorage не ломает bootstrap.
5. theme mapping покрывает каждый `CHARACTERS.id`.
6. comic mapping не меняет ids и reward pools.
7. все comic asset paths существуют.
8. Parent Settings содержит radiogroup и обе опции.
9. default theme — Pokémon Adventure.
10. theme change не вызывает reload.
11. reset progress не удаляет `lucky_learning_theme`.
12. share URL не добавляет theme override.
13. обязательные navigation/back/QR/Parent ids остаются в HTML.
14. module import contracts продолжают работать.
15. cache/version markers согласованы.

Полезные audit-команды:

```powershell
rg -n "pokemon/pikachu.png|name: 'Pikachu'|name: \"Pikachu\"" app.js index.html engine
rg -n -i "dog man|cat kid|dav pilkey" assets content app.js index.html styles.css themes.css
rg -n "[А-Яа-яЁё]" index.html app.js content engine
git diff --check
git status --short
```

Первый поиск должен находить Pokémon paths только в Pokémon-specific catalog или
явно тематических fixtures, но не в generic fallback.

Второй поиск может находить термины только в этом brief, но не в runtime или
assets.

## 16. Ручной functional smoke test

Выполнить в обеих темах:

1. fresh profile → onboarding → starter selection;
2. Hub → Math ×6;
3. правильный Math answer;
4. неправильный Math answer → correction → retry;
5. Math Mix;
6. Spelling Learn: audio, definition, Back disabled, Next;
7. Digital Test;
8. Paper Test;
9. Spelling Game с частично набранным словом;
10. victory/reward;
11. collection;
12. QR open/copy/close;
13. Victory Card preparation;
14. bottom nav и все Hub back buttons;
15. Parent Gate: wrong PIN и correct PIN;
16. change Parent PIN;
17. Hard Facts toggle;
18. progress resets с confirmation;
19. reload и offline reload.

Отдельный theme-switch test:

1. начать Math question;
2. запомнить question, progress и reveal;
3. открыть Parent Controls, ввести PIN;
4. переключить `Pokémon Adventure → Comic Quest`;
5. закрыть modal;
6. подтвердить, что question/progress/reveal не изменились;
7. начать ввод Spelling word;
8. снова переключить тему;
9. подтвердить, что выбранные буквы и mode не сбросились;
10. проверить themed art/name на current screen, onboarding, collection, victory
    и share preview;
11. reload;
12. проверить сохранение выбора;
13. записать неизвестное значение в `lucky_learning_theme`;
14. reload и подтвердить безопасный fallback `pokemon`.

## 17. Visual и accessibility QA

Минимальные viewport:

- 390 × 844 portrait;
- 768 × 1024 portrait;
- 1024 × 768 landscape;
- 1440 × 900 desktop.

Матрица выполняется отдельно для Pokémon Adventure и Comic Quest.

Проверить:

- нет horizontal scroll;
- bubbles/bursts не обрезаются;
- question и answers читаемы;
- touch targets не меньше 64 px;
- Parent modal прокручивается внутри viewport;
- Appearance расположен отдельно от destructive resets;
- theme previews читаемы в обеих темах;
- focus outline и selected state различимы;
- victory, QR и onboarding modals не выходят за viewport;
- нет layout shifts при смене themed art;
- нет flash неправильной темы на startup;
- `prefers-reduced-motion: reduce`;
- contrast соответствует WCAG AA для обычного текста;
- touch scroll по realm cards не открывает realm;
- active bottom nav остаётся очевидным.

## 18. Критерии приёмки

Релиз готов только если одновременно выполнено следующее:

- Parent Settings после PIN содержит Pokémon Adventure и Comic Quest;
- default без сохранённого выбора — Pokémon Adventure;
- тема меняется сразу и сохраняется;
- смена темы не сбрасывает текущую игровую сессию;
- Pokémon Adventure сохраняет текущий вид и текущих Pokémon;
- Comic Quest выглядит как оригинальный интерактивный детский комикс;
- Comic Quest не копирует героев, страницы или логотип книги;
- все 20 стабильных character ids имеют presentation в обеих темах;
- collection ownership/levels одинаковы в обеих темах;
- Math/Spelling/QR/Share/Parent PIN работают;
- интерфейс игры полностью English;
- touch/modal/navigation rules выполнены;
- offline reload работает с последней выбранной темой;
- все тесты проходят;
- `git diff --check` чист;
- изменения разделены на понятные commits;
- production не изменён без отдельного разрешения.

## 19. Что не входит в релиз

- новые Math topics;
- новые spelling words или weekly uploader;
- изменение Page 22;
- исправление расхождения Math defaults между `app.js` и
  `content/settings.js`;
- новые accounts/backend/sync;
- публичный comic editor;
- третья тема или автоматическое расписание тем;
- замена или удаление Pokémon Adventure;
- добавление новых Pokémon assets;
- перенос progress на новые ids;
- redesign QR protocol;
- production deployment.

## 20. Итоговый handoff владельцу

Координатор передаёт:

1. итоговый commit SHA;
2. список commits по агентам;
3. точный storage/theme contract;
4. таблицу всех stable ids и двух presentations;
5. список новых original Comic Quest assets;
6. подтверждение, что Pokémon files не удалены;
7. результаты всех automated tests;
8. functional/visual QA matrix для обеих тем;
9. подтверждение сохранения progress и Parent PIN;
10. подтверждение offline поведения;
11. известные ограничения;
12. после разрешённого browser QA — скриншоты Hub, Math, Spelling, Collection и
    Parent Appearance на iPad/mobile.
