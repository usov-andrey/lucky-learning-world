# TASK-001 — уточнения к плану narrative mechanics

## Статус

Follow-up к уже выпущенному TASK-001 (`v1.0.0`). Этот документ уточняет контракт
реализации для последующих исправлений и не меняет исторические критерии релиза
задним числом.

Исходный план Comic Quest уже был реализован, а корневой `implementation_plan.md`
позже стал активным планом TASK-003. Поэтому уточнения сохранены отдельным
task-specific документом и должны передаваться агентам вместе с
`tasks/TASK-001-comic-narrative.md`.

## 1. Единый контракт повторной постановки задания

Канонический контракт:

```js
{
  type: "answer.incorrect",
  context: {
    requeued: true
  }
}
```

- `item.requeued` не является отдельным runtime-событием.
- Повторная постановка кодируется только полем `context.requeued` события
  `answer.incorrect`.
- Один неправильный ответ создаёт одно narrative-событие и одну смену ViewModel.
- Requeue в учебном движке не должна следом перезаписывать feedback отдельным
  narrative-событием.
- Каталоги, тесты и документация не должны обещать самостоятельный
  `item.requeued`.
- Если старое имя временно сохраняется для совместимости, оно должно быть явно
  помечено deprecated и не должно эмититься из `app.js`.

Проверка:

- тест подтверждает `answer.incorrect.context.requeued === true`;
- тест подтверждает отсутствие второго `item.requeued` после той же ошибки;
- удалены или явно депрекейтнуты отдельные шаблоны и тесты `item.requeued`.

## 2. Защита от повторной генерации событий

Render-методы, смена темы и повторное обновление DOM не должны создавать новые
domain/narrative events.

Для каждого перехода формируется стабильный ключ:

```text
sessionId:itemId:attempt:eventType
```

Агент должен:

1. хранить ключ последнего обработанного перехода либо bounded-набор ключей текущей
   сессии;
2. отклонять повторный emit с тем же ключом;
3. создавать `session.started` только при реальном запуске или сбросе режима;
4. создавать `question.presented` только при переходе к новому заданию;
5. создавать `milestone.reached`, награды и completion-события один раз;
6. при `lucky:themechanged` повторно разрешать ViewModel из
   `lastNarrativeEvent`, не эмитя новый event;
7. не перезапускать timeout, TTS, sound effect, reward animation или Victory Card
   при theme refresh.

Минимальные тесты:

- повторный render не увеличивает число событий;
- theme switch сохраняет score, item index, tiles и queue;
- theme switch не повторяет timer, TTS, sound, reward или completion;
- повторная доставка одного handler transition подавляется;
- новый `attempt` или новый `itemId` создаёт новое событие.

## 3. Явный охват `engine/share-controller.js`

Narrative/theme handoff обязан учитывать share presentation:

- `engine/share-controller.js` использует presentation tokens активной темы;
- generic fallback не содержит жёстко заданных Pokémon-имён или изображений;
- QR/share preview корректно работает для Pokémon Adventure и Comic Quest;
- переключение темы не меняет игровой прогресс и не создаёт повторные награды;
- offline-режим не зависит от успешной загрузки web fonts.

Исправление runtime и покрытие `share-controller.js` уже выделены в
`tasks/TASK-004-fix-and-test-share-qr.md`. Агент TASK-001 follow-up не должен
дублировать TASK-004: он либо использует его результат, либо явно фиксирует
межзадачную зависимость.

## 4. Корректное версионирование PWA

В Web App Manifest не добавляется произвольное поле `version`: это не обязательный
стандартный механизм версионирования PWA.

Версия релиза синхронно обновляется в реально используемых точках:

- `package.json`;
- `APP_VERSION` в `app.js`;
- видимый title/diagnostics в `index.html` и приложении;
- query-параметры импортируемых JS/CSS ресурсов;
- URL регистрации service worker, если он versioned;
- `CACHE_NAME` в `sw.js`;
- version assertions в автоматических тестах;
- `CHANGELOG.md` и release artifact.

`manifest.json` изменяется только при изменении его реального содержимого. Нельзя
добавлять туда нестандартное поле только для имитации синхронизации версии.

Service worker при активации удаляет только старые кеши приложения с известным
префиксом `lucky-world-` и не затрагивает кеши других приложений того же origin.

## Definition of Done

- requeue имеет один канонический narrative-контракт;
- duplicate-event tests проходят;
- `share-controller.js` учтён напрямую или через завершённый TASK-004;
- PWA version markers синхронизируются без нестандартного manifest-поля;
- все старые и новые тесты проходят;
- выполнена ручная мобильная проверка обеих тем и `reduced motion`;
- результат оформлен отдельным task/walkthrough/release artifact без перезаписи
  исторических документов.
