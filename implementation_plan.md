# Итоговый план реализации: Тематические нарративные механики, Toast-баннер ("Try Comic Quest ➔") и обновление PWA v19

<div style="background: rgba(124, 93, 250, 0.1); border-left: 4px solid #7c5dfa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
  <strong>Учтены все 5 финальных уточнений архитектурного аудита:</strong>
  контракт смены темы родителями, полное покрытие событий (включая <code>session.started</code>, <code>question.presented</code>, <code>correction.*</code>, <code>milestone.reached</code>), campaign-ключ баннера <code>comic-quest-v19</code>, сохранение пространства кеша <code>lucky-world-*</code> в Service Worker и динамический расчёт страниц.
</div>

---

## 🎨 1. Подтверждение темы в Parent Controls

- **Контракт переключения**:
  - После успешного ввода PIN открывается окно **Parent Controls & Settings** (раздел Appearance).
  - Родитель сам нажимает на опцию **Comic Quest** ➔ тема применяется **сразу** (`ThemeManager.setTheme("comic")`).
  - Кнопка <code>Done / Close ✖</code> просто закрывает модальное окно.
  - Программная установка `radio.checked = true` без родительского клика **не считает** тему подтверждённой.

---

## 🔔 2. Жизненный цикл и кампании Toast-баннера

- **Условия показа баннера**:
  - Активна тема **`pokemon`** (если уже включена `comic`, баннер не отображается).
  - Выполнен Onboarding (`this.player != null`).
  - Игра находится на **главном экране (Hub / Dashboard)** и нет открытых модальных окон.
- **Campaign Key**:
  - Фиксация в `localStorage["lucky_release_toast_seen"] = "comic-quest-v19"`.
  - Как нажатие кнопки **"Try Comic Quest ➔"**, так и нажатие кнопки закрытия **`✖`** помечают кампанию `comic-quest-v19` как просмотренную, предотвращая повторный показ при будущих обновлениях.
- **Доступность (A11y)**:
  - `role="status"`, `aria-live="polite"`, сенсорная зона закрытия $\ge 64\text{px} \times 64\text{px}$, отсутствие перекрытия нижней навигации.

---

## 🎮 3. Полный словарь событий и динамический расчёт страниц (`NarrativeEngine`)

### 3.1. Полное покрытие точек вызова событий в `app.js`:
1. `session.started` ➔ в `startMathLevelSession()`, `startMathMixSession()`, `switchSpellingMode()`.
2. `question.presented` ➔ при фактическом переходе к новому вопросу (не вызывается при theme refresh).
3. `answer.correct` ➔ правильный ответ на первый/последующий ввод.
4. `answer.incorrect` ➔ неверный ответ (с атрибутом `{ requeued: true }` в контексте, не перезаписывает событие).
5. `correction.shown` ➔ показ подсказки факт-тренажёра при ошибке.
6. `correction.confirmed` ➔ подтверждение правильного факта после ошибки.
7. `milestone.reached` ➔ после каждого 4-го вопроса Math (`(index + 1) % 4 === 0`) и 6-го слова Spelling (`(index + 1) % 6 === 0`).
8. `session.completed` ➔ завершение дуэли/режима.
9. `reward.new` / `reward.levelup` ➔ получении новой карточки/повышении уровня.

### 3.2. Динамический вычисление страниц:
```js
const panelsPerPage = realm === "math" ? 4 : 6;
const totalPages = Math.ceil(totalItems / panelsPerPage);
const page = Math.floor(itemIndex / panelsPerPage) + 1;
const panel = (itemIndex % panelsPerPage) + 1;
```
Нарративный слой не завязан на статическое число 12 вопросов.

---

## 🔒 4. Сохранение `lastRescuedCharacterId` и Фаза 0

- В `AppController` фиксируется строковый ID `this.lastRescuedCharacterId` (например, `"embercub"`).
- Метод `refreshThemePresentation()`:
  - Обновляет текущую графику аватаров, оппонентов и открытых модалок.
  - Повторно запрашивает `NarrativeViewModel` по сохранённому `this.lastNarrativeEvent`.
  - **НЕ вызывает** `renderSpellingGame()` (сохраняя набор букв `selectedLetterTiles`).
  - **НЕ пересчитывает** таймеры и TTS-звуки.

---

## ⚙️ 5. Безопасность Service Worker (`sw.js`) и версионирование v19

- **Имя кеша**: `CACHE_NAME = "lucky-world-v2.0.0-v19"` (сохранён префикс `lucky-world-*`).
- **Очистка при активации**: SW удаляет **только старые кеши собственного приложения** с префиксом `lucky-world-`, не затрагивая соседние PWA/игры на этом же домене.
- **Синхронизация версий**: `APP_VERSION = "v2.0.0-v19"` в `app.js`, `index.html`, `sw.js` и `manifest.json`.

---

## 📋 Полный список изменяемых файлов

<table>
  <thead>
    <tr>
      <th>Тип</th>
      <th>Файл</th>
      <th>Назначение</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/content/themes.js">content/themes.js</a></td>
      <td>Прямые ES-импорты каталогов персонажей</td>
    </tr>
    <tr>
      <td><span style="color: #22c55e; font-weight: bold;">[NEW]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/content/narrative-themes.js">content/narrative-themes.js</a></td>
      <td>Каталог реплик с поддержкой <code>correction.*</code> и <code>milestone.reached</code></td>
    </tr>
    <tr>
      <td><span style="color: #22c55e; font-weight: bold;">[NEW]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/engine/narrative-engine.js">engine/narrative-engine.js</a></td>
      <td>Динамический вычисление страниц и snapshot ViewModel</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/index.html">index.html</a></td>
      <td>Разметка Toast-баннера "Try..." и версионирование v19</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/app.js">app.js</a></td>
      <td>События, <code>lastRescuedCharacterId</code>, <code>lastNarrativeEvent</code> и логика баннера v19</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/sw.js">sw.js</a></td>
      <td>Кеш <code>lucky-world-v2.0.0-v19</code> и безопасная очистка ключей <code>lucky-world-*</code></td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/styles.css">styles.css</a></td>
      <td>Стилизация анонсирующего баннера и нарративных баблов</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/themes.css">themes.css</a></td>
      <td>Тематические CSS-стили баблов и индикаторов</td>
    </tr>
    <tr>
      <td><span style="color: #22c55e; font-weight: bold;">[NEW]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/tests/narrative-engine.test.mjs">tests/narrative-engine.test.mjs</a></td>
      <td>Юнит-тесты NarrativeEngine и динамических страниц</td>
    </tr>
    <tr>
      <td><span style="color: #22c55e; font-weight: bold;">[NEW]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/tests/narrative-integration.test.mjs">tests/narrative-integration.test.mjs</a></td>
      <td>Интеграционные тесты campaign-ключа Toast и презентации</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/tests/ui-smoke.test.mjs">tests/ui-smoke.test.mjs</a></td>
      <td>Обновление DOM UI тестов с учётом v19 и Toast-баннера</td>
    </tr>
    <tr>
      <td><span style="color: #eab308; font-weight: bold;">[MODIFY]</span></td>
      <td><a href="file:///d:/SD/personal/projects/lucky-learning-world/tests/integration-imports.test.mjs">tests/integration-imports.test.mjs</a></td>
      <td>Проверка экспорта <code>NarrativeEngine</code> и <code>NARRATIVE_THEMES</code></td>
    </tr>
  </tbody>
</table>

---

## 🧪 План проверки

### Автоматические тесты
- Выполнение `node --test tests/*.test.mjs` (прохождение всех 62+ тестов).
- Тестирование `narrative-engine.test.mjs` на динамический расчёт страниц.
- Интеграционный тест кампании `comic-quest-v19` и безопасной очистки SW кешей `lucky-world-*`.
- Проверка отсутствия кириллицы в UI коде: `rg -n "[А-Яа-яЁё]" index.html app.js content/ engine/`
