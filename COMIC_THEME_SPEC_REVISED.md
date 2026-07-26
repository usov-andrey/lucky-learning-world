# Итоговое задание агентам: Мультитемная архитектура (Pokémon Adventure и Comic Quest)

Статус документа: **final / source of truth для реализации**.

Документ заменяет предыдущий `COMIC_THEME_AGENT_BRIEF.md` и учитывает результаты архитектурного аудита: FOUC-защиту, событийно-ориентированную смену темы без `location.reload()`, токены для Canvas (Victory Card / QR) и строгое разделение файлов между параллельными агентами.

---

## 1. Проект и проверенная исходная точка

**Рабочий проект**: `D:\SD\personal\projects\lucky-learning-world`

**Исходная версия приложения**:
- Application baseline: commit `b10db88` (версия `v2.0.0-v16`);
- Zero-build PWA на Vanilla JS и ES modules;
- Parent Controls защищены 4-значным PIN (`localStorage["lucky_parent_pin"]`);
- Service worker использует Network-First с cache fallback;
- `controllerchange` выполняет однократный auto-reload при обновлении PWA;
- Touch actions используют единый click binding без пары `touchend + click`;
- Все 51 из 51 тестов успешно проходят командой `node --test tests/*.test.mjs`;
- Интерфейс полностью на английском языке (**100% English UI**).

---

## 2. Продуктовый контекст и цели релиза

Лаки (10 лет) увлекается детскими комиксами (в стиле *Dog Man*). Особенность их восприятия — короткие баблы, эмоциональные реакции персонажей, разбиение действий на кадрированные сцены и интерактивное переключение внимания.

**Цель релиза**: Добавить вторую полноценную тему **Comic Quest**, сохранив существующую тему **Pokémon Adventure** как тему по умолчанию, с возможностью переключения темы родителем в защищённом разделе Parent Controls.

- **Pokémon Adventure** (`id: "pokemon"`): текущая тёмная неоновая glassmorphism-тема.
- **Comic Quest** (`id: "comic"`): новая светлая бумажная тема в стиле оригинального интерактивного комикса.

Переключение темы меняет presentation layer, но **не сбрасывает** текущую сессию, введённые буквы, открытый экран, прогресс или счёт.

---

## 3. Зафиксированные продуктовые и технические инварианты

1. **Единое место смены темы**: Выбор темы находится **только внутри Parent Controls & Settings** после успешного ввода PIN. На детских экранах кнопок смены темы нет.
2. **Мгновенное применение**: Тема применяется мгновенно без вызова `location.reload()`, перезапуска Service Worker или пересоздания DOM-дерева.
3. **Хранение темы**: Ключ `localStorage["lucky_learning_theme"]` принимает значения `"pokemon"` или `"comic"`. При отсутствии или повреждении значения используется fallback `"pokemon"`.
4. **Сброс прогресса**: Reset Progress, изменение Parent PIN или очистка результатов уроков **не затрагивают** выбранную тему.
5. **100% English UI**: Весь интерфейс, включая настройки Appearance, aria-label, диалоги и подсказки — строго на английском языке.
6. **Граница авторских прав**:
   - **Pokémon Adventure**: Все 46 ассетов и имена сохраняются без изменений.
   - **Comic Quest**: Запрещено копировать Dog Man, Cat Kid, логотипы, обложки или фрагменты существующих книг. Разрешена только оригинальная графическая стилистика комикса (frames, captions, speech bubbles, action bursts, halftone) и оригинальные авторские персонажи.
7. **Zero-build & PWA**: Приложение работает без bundler'ов (Webpack/Vite) на чистых Vanilla ES Modules и статических файлах.

---

## 4. Архитектура и контракты

### 4.1. Inline Bootstrap (Защита от FOUC)
Чтобы исключить мелькание тёмной темы при включённой `Comic Quest`, в `<head>` файла [index.html](file:///d:/SD/personal/projects/lucky-learning-world/index.html) добавляется синхронный скрипт:

```html
<script>
  (function() {
    try {
      var saved = localStorage.getItem('lucky_learning_theme');
      var theme = (saved === 'comic' || saved === 'pokemon') ? saved : 'pokemon';
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'pokemon');
    }
  })();
</script>
```

### 4.2. Модуль ThemeManager (`content/themes.js`)
Единый источник truth для работы с темами и персонажами:

```js
export const ThemeManager = {
  STORAGE_KEY: 'lucky_learning_theme',
  DEFAULT_THEME: 'pokemon',

  getTheme() {
    try {
      const val = localStorage.getItem(this.STORAGE_KEY);
      return (val === 'comic' || val === 'pokemon') ? val : this.DEFAULT_THEME;
    } catch (e) {
      return this.DEFAULT_THEME;
    }
  },

  setTheme(themeId) {
    const validTheme = (themeId === 'comic' || themeId === 'pokemon') ? themeId : this.DEFAULT_THEME;
    try {
      localStorage.setItem(this.STORAGE_KEY, validTheme);
    } catch (e) {}

    document.documentElement.setAttribute('data-theme', validTheme);

    // Уведомление компонентов без перезагрузки страницы
    window.dispatchEvent(new CustomEvent('lucky:themechanged', {
      detail: { theme: validTheme }
    }));
    return validTheme;
  },

  getCharacterPresentation(characterId) {
    const theme = this.getTheme();
    if (theme === 'comic' && window.COMIC_CHARACTERS && window.COMIC_CHARACTERS[characterId]) {
      return window.COMIC_CHARACTERS[characterId];
    }
    // Fallback к существующему каталогу Pokémon
    return window.POKEMON_CHARACTERS ? window.POKEMON_CHARACTERS[characterId] : null;
  }
};
```

### 4.3. Динамические цвета Canvas (Victory Card & QR)
Модуль `engine/share-controller.js` запрашивает токены темы для отрисовки карточек:

```js
export function getThemeCanvasTokens(themeId) {
  if (themeId === 'comic') {
    return {
      bgColor: '#FFF8E8',
      textColor: '#202020',
      accentColor: '#FF9F1C',
      borderColor: '#202020',
      fontFamily: '"Fredoka", "Outfit", sans-serif'
    };
  }
  return {
    bgColor: '#0f1225',
    textColor: '#ffffff',
    accentColor: '#00f2fe',
    borderColor: '#1e293b',
    fontFamily: '"Fredoka", "Outfit", sans-serif'
  };
}
```

---

## 5. Разделение зон ответственности между агентами

Каждый агент работает в своём наборе файлов. Изменение файлов чужого агента запрещено во избежание мерж-конфликтов.

### 🤖 Агент 0 — Интегратор и Координатор
* **Владение файлами**: `index.html`, `app.js`, `styles.css`, `engine/share-controller.js`, `sw.js`, `manifest.json`, `README.md`.
* **Задачи**:
  1. Встроить Inline Bootstrap в `<head>` `index.html`.
  2. Разместить UI-секцию `#parent-appearance-section` в модалке Parent Controls.
  3. Настроить подписку компонентов в `app.js` на событие `lucky:themechanged` для обновления отображения текстов и картинок без пересоздания DOM.
  4. Обновить Canvas-генератор в `share-controller.js` с поддержкой светлой/тёмной тем.
  5. Синхронизировать версии `APP_VERSION`, `CACHE_NAME` и прогнать полный интеграционный цикл.

### 🎨 Агент 1 — Theme Engine & CSS Infrastructure
* **Владение файлами**: `content/themes.js`, `theme-bootstrap.js`, `themes.css`, `tests/theme-settings.test.mjs`.
* **Задачи**:
  1. Реализовать модуль `content/themes.js` (`ThemeManager`).
  2. Создать `themes.css` с вариативными CSS-переменными для `[data-theme="pokemon"]` и `[data-theme="comic"]`.
  3. Сверстать радио-карточки выбора темы для Parent Settings (высота $\ge 64\text{px}$, ARIA radiogroup, WCAG AA контраст).
  4. Написать unit-тесты для валидации тем и безопасного работы с `localStorage`.

### 🖼️ Агент 2 — Comic Catalog & Assets
* **Владение файлами**: `assets/themes/comic/**`, `content/comic-characters.js`, `tests/comic-catalog.test.mjs`.
* **Задачи**:
  1. Создать каталог `content/comic-characters.js` для всех 20 стабильных ID персонажей (`res_x6`...`res_x10`, `embercub`...`moonkit`).
  2. Подготовить векторные SVG/WebP ассеты персонажей в `assets/themes/comic/` с фиксированными пропорциями 1:1 (во избежание CLS).
  3. Обеспечить оригинальные подписи, реплики и английские имена персонажей.
  4. Написать тесты полноты каталога (каждый ID из Pokémon темы имеет сопоставление в Comic теме).

### 🧪 Агент 3 — QA & Test Suite
* **Владение файлами**: `tests/theme-integration.test.mjs`, `tests/integration-imports.test.mjs`.
* **Задачи**:
  1. Написать тесты проверки сохранения темы при сбросе игровых данных.
  2. Написать тесты отсутствия глобального хардкода `Pikachu` или путей `pokemon/` в универсальных модулях.
  3. Провести регрессионный прогон 51 исходного теста.
  4. Сформировать итоговую матрицу функционального и визуального QA.

---

## 6. Требования к UI и доступности (Accessibility)

- **Touch targets**: Не менее $64\text{px} \times 64\text{px}$ для радио-карточек и кнопок Done/Close.
- **Индикация фокуса**: Выделенный радио-элемент должен быть чётко различим не только по цвету, но и по рамке/иконке Checkmark.
- **Screen Readers**: Переключение темы выбывает объявление `aria-live`: *"Comic Quest theme applied"*.
- **Reduced Motion**: При `prefers-reduced-motion: reduce` длительность всех комикс-анимаций (bursts, bubbles) сводится к $0\text{ms}$.

---

## 7. Проверка и автоматические тесты

Перед каждым коммитом обязательно выполнение команды:
```powershell
node --test tests/*.test.mjs
```

**Обязательные проверки кода**:
```powershell
# 1. Проверка отсутствия хардкода Pikachu в ядре
rg -n "pokemon/pikachu.png|name: 'Pikachu'" app.js index.html engine/

# 2. Проверка отсутствия кириллицы в UI
rg -n "[А-Яа-яЁё]" index.html app.js content/ engine/

# 3. Проверка чистоты git status
git status --short
```

---

## 8. Критерии приёмки (Definition of Done)

1. Раздел Parent Controls после ввода PIN содержит секцию **Appearance** с двумя темами.
2. Тема по умолчанию при чистом запуске — **Pokémon Adventure**.
3. Выбранная тема применяется моментально, сохраняется в `localStorage` и работает при offline-перезагрузке.
4. Никакой игровой процесс (Math, Spelling, Collection) не сбрасывается при смене темы.
5. Все 20 персонажей корректно отображаются в обеих темах.
6. Все 51 исходных плюс новые тесты проходят без ошибок (`51+ pass`).
7. Интерфейс на 100% на английском языке.
8. Соблюдены правила сенсорного ввода ($\ge 64\text{px}$) и адаптивных модалок.
