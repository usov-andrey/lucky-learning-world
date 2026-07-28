# 📋 Feature Spec: Player Onboarding, Sound Synthesis & PWA Offline Support

Техническая спецификация для реализации агентами дополнительного функционала **Lucky's Learning World**.

---

## 🎯 1. Player Onboarding Modal (Приветствие и ввод имени)

### Зачем это нужно:
Для детей 6-10 лет имя и собственный аватар создают высокий уровень вовлеченности («Lucky challenged you!» $\rightarrow$ «Mia challenged you!»).

### Логика работы:
1. **Проверка первого визита**:
   При запуске `app.js` проверяется флаг `state.player.hasCompletedOnboarding` в `localStorage`.
   Если флага нет (`false`/`undefined`), открывается приветственный оверлей `#onboarding-modal`.

2. **Интерфейс `#onboarding-modal`**:
   - Поле ввода имени (placeholder: *"Enter your name..."*, значение по умолчанию: *"Lucky"*).
   - Выбор стартового питомца (Pikachu ⚡, Charmander 🔥, Bulbasaur 🍃, Squirtle 💧, Eevee 🦊).
   - Кнопка **"Start My Adventure! 🚀"**.

3. **Обновление состояния**:
   - Имя игрока сохраняется в `state.player.name`.
   - Выбранный стартовый питомец добавляется в `state.player.petsUnlocked`.
   - Плашка в шапке меняется на `🐾 <Имя>`.
   - LINE-ссылка вызова теперь содержит реальное имя отправителя: `?from=<Имя>`.

---

## 🔊 2. Zero-Asset Web Audio Synthesizer (Звуковые эффекты)

### Зачем это нужно:
Мгновенная звуковая обратная связь без необходимости скачивать внешние MP3-файлы.

### Логика работы (`engine/sound-fx.js`):
Использование встроенного `AudioContext`:
- **Correct Answer Chime**: Восходящее трезвучие (C5 $\rightarrow$ E5 $\rightarrow$ G5, 150мс).
- **Wrong Answer Buzz**: Низкий пилообразный тон (150Гц, 200мс).
- **Victory Fanfare**: Праздничная мелодия победы при спасении питомца.
- **Button Click**: Короткий глухой клик (800Гц, 30мс).

---

## 📱 3. Offline PWA Manifest & Service Worker

### Зачем это нужно:
Игра должна мгновенно открываться на iPad в школе или поезде без интернета.

### Компоненты:
1. `manifest.json`: Web App Manifest с иконками, `display: "standalone"`, `theme_color: "#0f1225"`.
2. `sw.js`: Service Worker с кэшированием всех статических ассетов (HTML, CSS, JS, PNG картинки питомцев).

---

## 🛠️ Инструкции для Агентов по реализации

### Файлы для создания/изменения:
- [NEW] `engine/sound-fx.js` — модуль Web Audio API.
- [NEW] `manifest.json` — манифест PWA.
- [NEW] `sw.js` — Service Worker.
- [MODIFY] [index.html](file:///d:/SD/personal/projects/lucky-learning-world/index.html) — добавить HTML модального окна onboarding.
- [MODIFY] [styles.css](file:///d:/SD/personal/projects/lucky-learning-world/styles.css) — стили модального окна onboarding.
- [MODIFY] [app.js](file:///d:/SD/personal/projects/lucky-learning-world/app.js) — логика сохранения имени и воспроизведения звуков.
