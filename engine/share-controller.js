/**
 * Zero-Friction Social Sharing Controller for LINE / Web Share API
 * Allows parents/teachers/Lucky to share custom word challenges via URL links.
 */

export class ShareController {
  static createShareUrl(options = {}) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    if (options.deckId) {
      params.set('deck', options.deckId);
    }
    if (options.words && Array.isArray(options.words)) {
      params.set('words', options.words.join(','));
    }
    if (options.senderName) {
      params.set('from', options.senderName);
    }
    if (options.score) {
      params.set('score', options.score);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  static parseUrlChallenge() {
    const params = new URLSearchParams(window.location.search);
    const deckId = params.get('deck');
    const wordsParam = params.get('words');
    const senderName = params.get('from');
    const score = params.get('score');

    if (!deckId && !wordsParam) return null;

    let words = [];
    if (wordsParam) {
      words = wordsParam.split(',').map(w => w.trim()).filter(Boolean).map(w => ({
        word: w,
        hint: `Custom challenge word`,
        audio: ''
      }));
    }

    return {
      deckId: deckId || 'custom-challenge',
      senderName: senderName || 'A friend',
      score: score ? parseInt(score, 10) : 0,
      customWords: words.length > 0 ? words : null
    };
  }

  static async shareToLine(shareUrl, title = "Lucky's Learning Challenge!") {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`${title}\n${shareUrl}`)}`;
    
    // Try native Web Share API first if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "Can you beat my score in Lucky's Learning World?",
          url: shareUrl
        });
        return { success: true, method: 'web-share' };
      } catch (err) {
        console.warn('Web share cancelled or failed, falling back to LINE link', err);
      }
    }

    // Fallback to LINE URL redirect
    window.open(lineUrl, '_blank');
    return { success: true, method: 'line-url' };
  }
}
