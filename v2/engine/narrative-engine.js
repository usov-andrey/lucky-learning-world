// Pure JS Narrative Engine
// Resolves domain events and theme state into deterministic NarrativeViewModel snapshots.

import { NARRATIVE_THEMES } from '../content/narrative-themes.js';
import { ThemeManager } from '../content/themes.js';

export class NarrativeEngine {
  static resolveViewModel(event, themeIdInput) {
    const themeId = (themeIdInput === 'comic' || themeIdInput === 'pokemon')
      ? themeIdInput
      : ThemeManager.getTheme();

    const eventType = (event && event.type) ? event.type : 'question.presented';
    const ctx = (event && event.context) ? event.context : {};
    const themeCopy = NARRATIVE_THEMES[themeId] || NARRATIVE_THEMES.pokemon;
    const template = themeCopy[eventType] || themeCopy['question.presented'];

    // Dynamic progress calculation
    const realm = ctx.realm || 'math';
    const panelsPerPage = realm === 'math' ? 4 : 6;
    const totalItems = ctx.totalItems || (realm === 'math' ? 12 : 18);
    const itemIndex = typeof ctx.itemIndex === 'number' ? ctx.itemIndex : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / panelsPerPage));
    const page = Math.min(totalPages, Math.floor(itemIndex / panelsPerPage) + 1);
    const panel = (itemIndex % panelsPerPage) + 1;

    // Template interpolation
    let caption = template.caption || '';
    let speech = template.speech || '';

    const nameVal = ctx.characterName || 'Hero';
    const levelVal = ctx.level || 1;

    caption = caption.replace('{name}', nameVal).replace('{level}', levelVal);
    speech = speech.replace('{name}', nameVal).replace('{level}', levelVal);

    const progressLabel = themeId === 'comic'
      ? `Page ${page} of ${totalPages} (Panel ${panel}/${panelsPerPage})`
      : `Stage ${page} of ${totalPages} (Question ${itemIndex + 1}/${totalItems})`;

    return {
      themeId,
      eventType,
      tone: template.tone || 'neutral',
      caption,
      speech,
      actionWord: template.actionWord || '',
      effect: template.effect || 'none',
      progress: {
        label: progressLabel,
        current: panel,
        total: panelsPerPage,
        page,
        totalPages,
        itemIndex,
        totalItems
      },
      ariaMessage: `${caption}. ${speech}`
    };
  }
}
