# Отдельное задание агентам: тематические narrative mechanics

Статус: **готово к передаче в разработку**.

Это отдельный следующий этап после реализации мультитемной архитектуры. Он не
заменяет:

- `COMIC_THEME_SPEC_REVISED.md`;
- `COMIC_THEME_AGENT_BRIEF.md`;
- проектные `AGENTS.md` и `DEVELOPMENT_RULES.md`.

При конфликте с правилами проекта приоритет имеют `AGENTS.md` и
`DEVELOPMENT_RULES.md`.

## 1. Исходная точка

Проект:

`D:\SD\personal\projects\lucky-learning-world`

Проверенная исходная версия на 27 июля 2026 года:

- commit `8f29e66`;
- приложение `v2.0.0-v18`;
- реализованы темы `pokemon` и `comic`;
- выбор темы находится в PIN-защищённых Parent Controls;
- выбор хранится в `localStorage["lucky_learning_theme"]`;
- работает событие `lucky:themechanged`;
- существует Pokémon catalog из 20 characters;
- существует Comic Quest catalog для тех же 20 стабильных ids;
- на исходной точке проходят 62 из 62 тестов командой
  `node --test tests/*.test.mjs`;
- рабочее дерево на момент аудита чистое.

Перед работой каждый агент обязан прочитать корневой и проектный `AGENTS.md`,
`DEVELOPMENT_RULES.md`, а также актуальный `COMIC_THEME_SPEC_REVISED.md`.

## 2. Продуктовая цель

Сделать так, чтобы Pokémon Adventure и Comic Quest ощущались не просто двумя
наборами цветов и картинок, а двумя разными способами переживать одну и ту же
учебную игру.

### Pokémon Adventure

Игровая метафора:

`meet → battle → reveal/capture → evolve`

### Comic Quest

Игровая метафора:

`open panel → complete scene → finish page → recruit Comic Crew hero`

Учебное ядро при этом остаётся единым.

## 3. Главный архитектурный принцип

Реализовать **разные narrative mechanics, но не две разные учебные игры**.

Тема может менять:

- framing события;
- короткую реплику;
- progress metaphor;
- декоративную реакцию;
- подпись награды;
- название коллекции;
- способ визуально показать завершение шага.

Тема не может менять:

- список и порядок вопросов;
- число заданий;
- правильный ответ;
- Math/Spelling difficulty;
- requeue и correction rules;
- scoring;
- star thresholds;
- unlock conditions;
- reward eligibility;
- collection ids и levels;
- текущий session state;
- localStorage progress schema.

Одно событие учебного движка получает две presentation:

| Core event | Pokémon Adventure | Comic Quest |
|---|---|---|
| `answer.correct` | successful move / reveal energy | panel stamped complete |
| `answer.incorrect` | trainer coaching hint | helper speech bubble |
| `correction.confirmed` | training move learned | panel repaired |
| `milestone.reached` | opponent reveal/capture progress | comic page completed |
| `session.completed` | battle complete | issue complete |
| `reward.new` | Pokémon rescued/captured | hero joins Comic Crew |
| `reward.levelup` | evolution/new form | hero receives new comic form |

## 4. Зафиксированные продуктовые решения

1. Core Math и Spelling engines не получают theme branches.
2. Theme-specific narrative state не сохраняется отдельно.
3. Narrative progress вычисляется из существующего session state.
4. При переключении темы в середине вопроса меняется presentation, но не core
   state.
5. Pokémon Adventure сохраняет текущие battle/reveal/HP/capture metaphors.
6. Comic Quest получает panel/page/issue/crew metaphors.
7. Ни одна narrative animation не добавляет задержку к текущим игровым timeout.
8. Narrative copy полностью на английском.
9. В новом copy запрещены `failed`, `you lost`, `game over`, `bad`, `stupid`.
10. Decorative narrative audio не перебивает word audio, definition audio или
    Math fact TTS.
11. Test mode остаётся спокойным и не раскрывает ответ раньше core logic.
12. Theme change не вызывает reload, новый вопрос, reward или analytics event.
13. Новые persistent keys не создаются.
14. Production deployment не входит в задачу без отдельного указания владельца.

## 5. Phase 0: обязательная стабилизация текущей темы

До добавления narrative mechanics закрыть существующие пробелы мультитемной
интеграции отдельным подготовительным commit.

На baseline `8f29e66` подтверждены следующие риски:

1. `ThemeManager.getCharacterPresentation()` ищет
   `window.COMIC_CHARACTERS`, но `app.js` импортирует `COMIC_CHARACTERS` как ES
   module и не регистрирует этот объект в `window`.
2. Обработчик `lucky:themechanged` обновляет Header и Pokédex, но не текущий
   Math/Spelling opponent, onboarding starter, открытый victory modal и share
   preview.
3. Math Mix использует прямой `pokemon/pikachu.png`.
4. Victory/QR/Share fallbacks местами используют `Pikachu` и Pokémon path
   напрямую.
5. `renderSpellingGame()` очищает `selectedLetterTiles`; его нельзя вызывать
   целиком только ради обновления темы во время незавершённого слова.

Требуемый результат Phase 0:

- theme resolver использует явные ES module imports, а не скрытые `window`
  globals;
- generic UI не содержит безусловных Pokémon fallback;
- существует отдельный безопасный метод обновления только presentation,
  например `refreshThemePresentation()`;
- этот метод не вызывает `start*`, не пересоздаёт engines, не очищает letters,
  не меняет score и не запускает reward;
- переключение темы корректно обновляет активный экран и открытые theme-aware
  модалки;
- все 62 исходных теста остаются зелёными.

Не смешивать Phase 0 с новой narrative state machine: сначала исправить theme
presentation contract, затем строить следующий слой.

## 6. Domain events

Ввести небольшой стабильный словарь presentation events:

```text
session.started
question.presented
answer.correct
answer.incorrect
correction.shown
correction.confirmed
item.requeued
milestone.reached
session.completed
reward.new
reward.levelup
```

Допустимы realm-specific details в context, но не новые альтернативные названия
одного и того же события.

Пример входа:

```js
{
  type: "answer.correct",
  context: {
    realm: "math",
    mode: "game",
    itemIndex: 3,
    totalItems: 12,
    score: 2,
    residentId: "res_x6",
    assisted: false
  }
}
```

Context является read-only snapshot. Narrative layer не получает право менять
оригинальный engine/session object.

## 7. Narrative ViewModel

Для каждого event narrative resolver возвращает чистую модель:

```js
{
  themeId: "comic",
  eventType: "answer.correct",
  tone: "success",
  caption: "Panel 3 complete!",
  speech: "BAM! You got it!",
  actionWord: "BAM!",
  effect: "panel-stamp",
  progress: {
    label: "Page 1",
    current: 3,
    total: 4
  },
  ariaMessage: "Correct. Comic panel 3 complete."
}
```

Ограничения:

- только plain data;
- без HTML;
- без DOM nodes;
- без callback;
- без localStorage access;
- без случайного изменения core state;
- `caption`, `speech`, `ariaMessage` всегда English;
- любой неизвестный event возвращает безопасный neutral ViewModel.

Рекомендуемые `tone`:

```text
neutral
success
coach
milestone
celebrate
```

Рекомендуемые `effect`:

```text
none
reveal-pulse
move-impact
capture-flash
evolution-glow
panel-stamp
helper-bubble
page-turn
issue-complete
crew-join
```

Effect — инструкция presentation layer, а не сама анимация.

## 8. Derived narrative progress

Narrative progress вычисляется детерминированно из существующих индексов.

### Comic Quest Math

- один вопрос = один comic panel;
- четыре panels = одна page;
- 12 вопросов = три pages;
- `page = floor(itemIndex / 4) + 1`;
- `panel = (itemIndex % 4) + 1`;
- неправильный ответ не закрывает panel;
- correction подтверждает repaired panel только тогда, когда core flow считает
  correction завершённой;
- завершение каждого четвёртого вопроса даёт `milestone.reached`;
- session completion даёт `issue-complete`.

### Comic Quest Spelling Game

- одно слово = один panel;
- шесть panels = одна page;
- 18 слов = три pages;
- неправильная сборка не закрывает panel;
- requeued word не создаёт дополнительную награду;
- completion всех слов даёт `issue-complete`.

### Comic Quest Learn

- одно слово = один читаемый panel;
- progress показывает `Panel N of 18`;
- Back/Next остаются обычной navigation;
- чтение слова не создаёт score или reward;
- декоративный page turn не блокирует следующую кнопку.

### Comic Quest Test

- одно слово = один quiet test panel;
- progress можно назвать `Check N of 18`;
- до reveal нельзя показывать target word в narrative copy;
- неправильный ответ создаёт coach bubble, но не комический взрыв;
- Paper/Digital core behaviour не меняется.

### Pokémon Adventure

Не вводить новую альтернативную шкалу, конкурирующую с существующей:

- Math использует current reveal/battle progress;
- Spelling Game использует current opponent HP;
- Learn/Test используют нейтральные trainer captions;
- reward продолжает capture/evolution presentation;
- narrative ViewModel только стандартизирует уже существующий смысл.

## 9. Theme-specific copy contract

Хранить copy в data catalog, а не в условных строках по всему `app.js`.

Пример:

```js
export const NARRATIVE_THEMES = {
  pokemon: {
    answerCorrect: {
      caption: "Great move!",
      speech: "The mystery Pokémon is getting clearer."
    },
    answerIncorrect: {
      caption: "Trainer tip",
      speech: "Let’s learn this fact together."
    },
    rewardNew: {
      caption: "New teammate!",
      speech: "{name} joined your Pokédex."
    }
  },
  comic: {
    answerCorrect: {
      caption: "Panel complete!",
      speech: "BAM! You solved it."
    },
    answerIncorrect: {
      caption: "Let’s fix this panel",
      speech: "Your helper has a clue."
    },
    rewardNew: {
      caption: "New hero!",
      speech: "{name} joined the Comic Crew."
    }
  }
};
```

Template interpolation:

- разрешены только известные fields из typed/validated context;
- пользовательский текст выводится через `textContent`;
- URL/localStorage values не вставляются через `innerHTML`;
- имя персонажа разрешается через активный theme presentation;
- Math correction всегда содержит реальный fact из core question;
- Spelling Test narrative не содержит target word до разрешённого reveal.

## 10. UI components

Добавить минимальный общий набор компонентов:

```text
narrative-caption
narrative-speech
narrative-action-word
narrative-progress
narrative-live-region
```

Обе темы используют одинаковый semantic DOM, но разное оформление.

### Pokémon styling

- trainer/status card;
- reveal or energy accent;
- compact move-impact reaction;
- capture/evolution celebration;
- сохранить тёмный high-contrast visual language.

### Comic styling

- caption box;
- speech bubble;
- panel border;
- completed-panel stamp;
- page progress;
- action word;
- issue-complete celebration;
- сохранить светлый paper/ink high-contrast visual language.

Компоненты не должны:

- перекрывать вопрос или answer buttons;
- менять layout во время ввода;
- захватывать focus;
- быть интерактивными без необходимости;
- создавать horizontal scroll;
- снижать touch targets;
- дублировать основной feedback противоречащим текстом.

## 11. Event integration

Не добавлять глобальную event bus framework.

Допустимый минимальный flow:

```text
core handler
  → создаёт immutable narrative event
  → narrative resolver возвращает ViewModel
  → presenter обновляет narrative DOM
```

AppController может хранить только последний presentation event:

```js
this.lastNarrativeEvent = {
  type: "answer.correct",
  context: { ...snapshot }
};
```

При `lucky:themechanged`:

1. core session остаётся тем же объектом;
2. последний event повторно разрешается под новой темой;
3. обновляются только themed character presentation и narrative DOM;
4. timers не запускаются повторно;
5. reward не применяется повторно;
6. audio не проигрывается повторно;
7. selected spelling letters не очищаются;
8. focus остаётся на логичном элементе.

Если последнего event нет, показывается neutral presentation текущего экрана.

## 12. Audio, timing и motion

- не увеличивать существующие `800 ms` и `1400 ms` flow timeouts;
- narrative animations идут внутри текущего времени или не блокируют flow;
- word/definition audio и Math fact TTS имеют приоритет;
- decorative sounds по умолчанию выключены в Learn/Test;
- не накладывать две speech synthesis utterances;
- `prefers-reduced-motion: reduce` отключает page turn, impact и burst;
- reduced motion не скрывает текстовый feedback;
- `aria-live="polite"` используется для narrative feedback;
- core correctness feedback может оставаться assertive только там, где это уже
  оправдано accessibility contract.

## 13. No-lose educational contract

Narrative layer обязана поддерживать существующую философию:

- ошибка — это coaching moment;
- правильный факт или слово показывается по core rules;
- progress не откатывается;
- character не унижает игрока;
- нельзя изображать травму, смерть или наказание героя;
- нельзя сообщать, что Лаки «провалила» урок;
- повтор вопроса объясняется как тренировка или ремонт panel;
- assisted correction визуально отличается от first-try success, но остаётся
  позитивной.

## 14. Авторские ограничения

Pokémon Adventure сохраняет существующие локальные Pokémon assets в пределах
текущего семейного проекта. Новые Pokémon assets в эту задачу не добавлять.

Comic Quest:

- только оригинальные персонажи и сцены;
- не копировать Dog Man, Cat Kid, логотипы, страницы или реплики книги;
- не имитировать точный стиль конкретного автора;
- action words и speech bubbles должны быть оригинальными;
- фотографии книги не добавлять в репозиторий.

## 15. Предпочтительная структура

```text
content/
└── narrative-themes.js
engine/
└── narrative-engine.js
assets/
└── themes/
    └── comic/
        └── narrative/
tests/
├── narrative-engine.test.mjs
└── narrative-integration.test.mjs
```

Допустимы другие имена файлов, если сохраняются границы:

- `narrative-engine.js` — pure, без DOM/storage;
- `narrative-themes.js` — copy/config;
- `app.js` — orchestration;
- CSS — presentation;
- learning engines не зависят от темы.

## 16. Разделение работы между агентами

Все агенты работают в отдельных branches/worktrees. Два агента не должны
одновременно изменять один файл.

### Агент 0 — интегратор

Владеет:

- `app.js`;
- `index.html`;
- `content/themes.js`;
- `engine/share-controller.js`;
- `sw.js`;
- version/cache markers.

Задачи:

- выполнить Phase 0;
- встроить narrative events в текущие handlers;
- добавить semantic narrative slots;
- реализовать `refreshThemePresentation()`;
- не допустить core state mutation;
- интегрировать остальные ветки;
- синхронизировать версию;
- не deploy.

### Агент 1 — narrative domain

Владеет:

- `engine/narrative-engine.js`;
- `content/narrative-themes.js`;
- `tests/narrative-engine.test.mjs`.

Задачи:

- реализовать event vocabulary;
- реализовать pure resolver;
- реализовать Math/Spelling derived progress;
- реализовать safe template interpolation;
- проверить no-lose copy;
- передать интегратору документированный API.

Не изменять learning engines и `app.js`.

### Агент 2 — presentation и motion

Владеет:

- `themes.css`;
- `styles.css`;
- `assets/themes/comic/narrative/**`.

Задачи:

- оформить общие narrative components;
- реализовать обе presentation;
- добавить panel/page states для Comic Quest;
- сохранить Pokémon baseline;
- реализовать reduced motion и contrast;
- не добавлять интерактивность через CSS.

Не изменять `app.js` и HTML.

### Агент 3 — integration tests и QA

Владеет:

- `tests/narrative-integration.test.mjs`;
- `tests/ui-smoke.test.mjs`;
- QA handoff.

Задачи:

- проверить отсутствие core mutation;
- проверить theme switch mid-question/mid-word;
- проверить события и ViewModel;
- проверить DOM slots;
- проверить Test-mode secrecy;
- проверить отсутствие duplicate reward/audio/timer;
- прогнать полную регрессию;
- подготовить visual/touch/offline matrix.

Browser skill использовать только после отдельного явного подтверждения
владельца согласно корневому `AGENTS.md`.

## 17. Порядок реализации

1. Latest main, clean `git status`, baseline tests.
2. Phase 0 theme stabilization отдельным commit.
3. Согласовать event vocabulary и ViewModel schema.
4. Агент 1 реализует pure narrative domain.
5. Агент 2 реализует CSS/assets параллельно.
6. Агент 3 готовит integration contracts параллельно.
7. Интегратор добавляет DOM slots и event calls.
8. Интегратор подключает theme refresh без core rerender.
9. Влить и запустить все тесты.
10. После отдельного разрешения провести browser visual QA.
11. Подготовить handoff.
12. Production не изменять.

## 18. Автоматические тесты

Перед каждым commit:

```powershell
node --test tests/*.test.mjs
```

Новые обязательные тесты:

1. Один core event даёт разные ViewModel для `pokemon` и `comic`.
2. Resolver не мутирует frozen context.
3. Unknown event даёт neutral fallback.
4. Comic Math корректно вычисляет page/panel для 12 вопросов.
5. Comic Spelling Game корректно вычисляет page/panel для 18 слов.
6. Incorrect answer не продвигает narrative progress.
7. Correction/requeue не создают duplicate reward.
8. Test narrative не содержит target word до reveal.
9. Все narrative strings English.
10. Запрещённые punitive phrases отсутствуют.
11. Theme switch переиспользует последний event и не меняет session snapshot.
12. Theme switch не очищает selectedLetterTiles.
13. Theme switch не вызывает audio повторно.
14. Theme switch не запускает timer повторно.
15. Comic/Pokémon character presentation разрешается без `window` globals.
16. Math Mix, victory, QR и share не используют generic Pokémon hardcode.
17. Все прежние 62 теста продолжают проходить.

Audit:

```powershell
rg -n "pokemon/pikachu.png|name: 'Pikachu'|name: \"Pikachu\"" app.js engine index.html
rg -n -i "dog man|cat kid|dav pilkey" app.js index.html content engine assets themes.css
rg -n "[А-Яа-яЁё]" app.js index.html content engine
git diff --check
git status --short
```

Terms книги могут встречаться в технических Markdown briefs, но не в runtime.

## 19. Functional QA

### Pokémon Adventure

1. Math correct → move/reveal presentation.
2. Math incorrect → trainer coaching.
3. Correction → positive training feedback.
4. Milestone → reveal/capture progress.
5. Reward → capture/evolution.
6. Spelling Game → opponent HP.
7. Learn/Test → нейтральный trainer framing.

### Comic Quest

1. Math correct → completed panel stamp.
2. Math incorrect → helper bubble без продвижения panel.
3. Каждый четвёртый Math item → page milestone.
4. Math completion → issue complete.
5. Spelling Game correct → completed panel.
6. Каждое шестое word → page milestone.
7. Learn Back/Next → nonblocking panel transition.
8. Test не раскрывает слово.
9. Reward → Comic Crew join/new form.

### Mid-session theme switch

1. Начать Math question в Pokémon Adventure.
2. Зафиксировать session snapshot.
3. Переключить на Comic Quest через Parent Controls.
4. Подтвердить тот же question, index, score, reveal и pending correction.
5. Начать Spelling Game и выбрать несколько letters.
6. Переключить тему.
7. Подтвердить сохранение letters, current word, mode и score.
8. Переключить тему при открытом victory modal.
9. Подтвердить смену presentation без duplicate reward.
10. Проверить Share/Victory Card под активной темой.

## 20. Visual и accessibility QA

Проверить обе темы на:

- 390 × 844 portrait;
- 768 × 1024 portrait;
- 1024 × 768 landscape;
- 1440 × 900 desktop.

Проверить:

- narrative не перекрывает учебный контент;
- нет horizontal scroll;
- touch targets остаются ≥64 px;
- active tabs/nav остаются high contrast;
- speech bubbles не обрезаются;
- action words не читаются как кнопки;
- focus не прыгает при narrative update;
- `aria-live` не повторяет одно сообщение дважды;
- reduced motion работает;
- modal constraints соблюдены;
- Comic text соответствует WCAG AA;
- Pokémon text остаётся читаемым на dark background;
- theme switch не вызывает layout flash.

## 21. Definition of Done

Релиз принимается, если:

- Pokémon и Comic Quest имеют различимые narrative loops;
- core learning engines не содержат theme branches;
- Math/Spelling questions, score, rewards и progress одинаковы в обеих темах;
- Comic Math работает по схеме 4 panels × 3 pages;
- Comic Spelling Game работает по схеме 6 panels × 3 pages;
- Pokémon сохраняет reveal/HP/capture/evolution metaphors;
- theme switch mid-session не меняет core state;
- все copy English и no-lose;
- Test mode не раскрывает target word;
- audio/timers/rewards не дублируются;
- Phase 0 hardcodes и resolver gap закрыты;
- все automated tests проходят;
- functional/visual QA выполнен после разрешения;
- Git history содержит небольшие понятные commits;
- production не изменён.

## 22. Не входит в задачу

- новые Math/Spelling questions;
- новая difficulty;
- изменение stars/unlock/reward rules;
- отдельное сохранение comic pages;
- новый backend;
- accounts/sync;
- третья тема;
- новые Pokémon assets;
- длинные cutscenes;
- обязательная озвучка декоративных реплик;
- публикация production;
- изменение weekly lesson workflow.

## 23. Handoff владельцу

Передать:

1. итоговый commit SHA;
2. список commits по агентам;
3. event vocabulary;
4. Narrative ViewModel schema;
5. таблицу mapping core event → обе темы;
6. доказательство отсутствия core state mutation;
7. результаты всех тестов;
8. functional/visual QA matrix;
9. подтверждение Test-mode secrecy;
10. подтверждение отсутствия duplicate reward/audio/timer;
11. список известных ограничений;
12. после разрешённого browser QA — screenshots/video короткого theme switch в
    Math и Spelling.
