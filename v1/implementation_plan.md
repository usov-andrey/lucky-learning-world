# Implementation Plan: Lucky's Learning World (Web PWA)

Объединение образовательной игры `math-monster` и генератора тестов `lucky-spelling-skill` в единый геймифицированный мультипредметный PWA-хаб **Lucky's Learning World** для Лаки и её одноклассников из школы с международной программой в Таиланде.

## 🎯 Цели и ключевые особенности

1. **Единый PWA-хаб (Math Realm + Spelling Realm)** на базе чистого JS движка `math-monster` (zero-build ES Modules, мгновенная загрузка на iPad/телефонах, PWA/офлайн поддержка, деплой на GitHub Pages).
2. **Игровой движок Spelling**: Перенос механики боя/коллекционирования питомцев из `math-monster` на орфографию (услышал слово $\rightarrow$ собрал из букв/ввел $\rightarrow$ победил монстра $\rightarrow$ поймал покемона/питомца).
3. **Zero-Friction Sharing**: Отправка ссылок с конкретными сетами слов/примеров и рекордами Лаки в мессенджер **LINE** (одноклассники играют в 1 клик без регистрации).
4. **Content & OCR Pipeline**: Перенос Python CLI утилиты из `lucky-spelling-skill` в `scripts/` для автоматической генерации сетов из фото домашки (OCR) и предзагрузки MP3-аудио.
5. **Совместимость с программой школ Таиланда**: Пресеты для Cambridge / Oxford Primary (UK/US Grade 1-5).

---

## 🏛️ Проектная структура в `personal/projects/`

Согласно правилам [AGENTS.md](file:///d:/SD/AGENTS.md), проект будет изолирован в собственном Git-репозитории:

`d:\SD\personal\projects\lucky-learning-world\`
- `.git/` — Git репозиторий проекта
- `AGENTS.md` — Инструкции и правила работы над проектом
- `README.md` — Описание проекта, архитектура и инструкции по запуску
- `index.html` — Главная PWA точка входа (выбор предмета: Math / Spelling / Pokedex / Settings)
- `styles.css` — Единая стилизация (адаптирована под iPad Touch UI)
- `app.js` — Инициализация и маршрутизация экранов
- `content/` — Данные учебных программ (Math facts, Spelling decks, Characters)
- `engine/` — Чистые модули математики, орфографии, наград и прогрессии
- `scripts/` — Python OCR/TTS пайплайн для сборки словарей из фото и текста
- `pokemon/` — Графика питомцев / покемонов

---

## 🛠️ Предлагаемые изменения и фазы реализации

### Фаза 1: Инициализация репозитория и базового хаба
#### [NEW] [AGENTS.md](file:///d:/SD/personal/projects/lucky-learning-world/AGENTS.md)
Правила проекта, стандарты кода (Vanilla ES Modules, Node tests), каналы деплоя.

#### [NEW] [README.md](file:///d:/SD/personal/projects/lucky-learning-world/README.md)
Документация по продукту, стэку, локальному запуску и деплою на GitHub Pages.

#### [NEW] `index.html`, `styles.css`, `app.js`
Базовый каркас с выбором мира:
- 🧮 **Math Monster Realm** (Таблица умножения x2..x10)
- 🔤 **Word Monster Realm** (Spelling & Vocabulary)
- 🐾 **Pokédex & Pet Collection** (Общий прогресс и открытые персонажи)

---

### Фаза 2: Интеграция Spelling Realm & Audio TTS
#### [NEW] `engine/spelling-engine.js`
Чистый JS модуль логики орфографии:
- Воспроизведение звука слова (TTS / MP3 fallback).
- Состояния ввода: буква за буквой (для младших) / ввод слова целиком (для старших).
- Формирование набора вариантов и подсказок без штрафов (No-Lose policy).

#### [NEW] `content/spelling-catalog.js`
Каталог школьных словарей:
- `UK Year 1-6 Spelling Lists`
- `Phonics & Sight Words`
- `Custom Decks` (переданные через URL)

---

### Фаза 3: Социальный шеринг (LINE / Web Share API)
#### [NEW] `engine/share-controller.js`
Генератор ссылок вызова для LINE/WhatsApp:
- Кодирование ID деки и рекорда: `?deck=y3-w12&from=Lucky&time=45s`
- Встроенное кодирование кастомных слов из фото: `?words=cactus,fungus,virus`
- Экран вызова друга («Lucky challenged you!»).

---

### Фаза 4: Python OCR & Content Pipeline
#### [NEW] `scripts/generate-deck.py`
Перенос утилиты из `lucky-spelling-skill`:
- Генерация JSON словаря из `words.txt` или изображения (`input.jpg` via Tesseract OCR).
- Скачивание/генерация MP3 произношений в `audio/`.

---

## 🧪 Plan по проверке (Verification Plan)

### Automated Tests
- Запуск юнит-тестов движка без браузера: `node --test`
- Проверка генерации карточек и словарей: `python -m unittest discover -s tests`

### Manual Verification
1. **Локальный запуск**: `python -m http.server 8080` в директории проекта.
2. **Проверка в мобильном эмуляторе / iPad**:
   - Проверка первого тапа для разблокировки звука на iOS.
   - Проверка кнопок размером не менее 64px для пальцев ребенка.
   - Проверка отсутствия тупиковых экранов и "Game Over".
3. **Проверка шеринга**: Проверка генерации ссылки и ее успешного открытия в новой приватной вкладке браузера без авторизации.
