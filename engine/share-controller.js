import { QRGenerator } from './qr-generator.js';

/**
 * Zero-Friction Social Sharing Controller for LINE / Web Share API
 * Allows parents/teachers/Lucky to share custom word challenges via URL links.
 */

export function getThemeCanvasTokens(themeId) {
  if (themeId === 'comic') {
    return {
      bgColor: '#FFF8E8',
      cardBg: '#FFFFFF',
      textColor: '#202020',
      accentColor: '#FF9F1C',
      subTextColor: '#4b5563',
      borderColor: '#202020',
      bannerBg: '#E71D36',
      fontFamily: '"Fredoka", "Outfit", sans-serif'
    };
  }
  return {
    bgColor: '#0f1225',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    textColor: '#ffffff',
    accentColor: '#00f2fe',
    subTextColor: '#94a3b8',
    borderColor: '#6366f1',
    bannerBg: '#22c55e',
    fontFamily: '"Fredoka", "Outfit", sans-serif'
  };
}

export class ShareController {
  static PRODUCTION_URL = 'https://usov-andrey.github.io/lucky-learning-world/';

  static createShareUrl(options = {}) {
    const hasWindow = typeof window !== 'undefined' && window.location;
    const isLocal = hasWindow && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const baseUrl = (hasWindow && !isLocal) ? (window.location.origin + window.location.pathname) : this.PRODUCTION_URL;
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

  static async generateVictoryCardBlob(options = {}) {
    const {
      playerName = 'Lucky',
      score = 3,
      petName = 'Pikachu',
      petImgUrl = 'pokemon/pikachu.png',
      themeId = (typeof localStorage !== 'undefined' ? localStorage.getItem('lucky_learning_theme') : 'pokemon')
    } = options;

    const tokens = getThemeCanvasTokens(themeId);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background Fill
    ctx.fillStyle = tokens.bgColor;
    ctx.fillRect(0, 0, 800, 450);

    // 2. Card Frame & Border
    ctx.strokeStyle = tokens.borderColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 410);

    ctx.fillStyle = tokens.cardBg;
    ctx.fillRect(25, 25, 750, 400);

    // 3. Header Text & Badge
    ctx.fillStyle = tokens.accentColor;
    ctx.font = `bold 36px ${tokens.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText('🌟 LUCKY\'S LEARNING WORLD', 50, 85);

    ctx.fillStyle = tokens.textColor;
    ctx.font = `bold 26px ${tokens.fontFamily}`;
    ctx.fillText(`🏆 Adventurer: ${playerName}`, 50, 140);

    ctx.fillStyle = tokens.accentColor;
    ctx.font = `bold 22px ${tokens.fontFamily}`;
    ctx.fillText(`⭐ Stars Earned: +${score}`, 50, 180);

    ctx.fillStyle = tokens.textColor;
    ctx.font = `bold 28px ${tokens.fontFamily}`;
    ctx.fillText(`🐾 Pet Rescued: ${petName}!`, 50, 230);

    ctx.fillStyle = tokens.subTextColor;
    ctx.font = `italic 20px ${tokens.fontFamily}`;
    ctx.fillText('Can you beat my score in Math & Spelling?', 50, 280);

    // Call to Action Banner & QR Code
    const shareUrl = this.createShareUrl(options);
    const qrCanvas = document.createElement('canvas');
    QRGenerator.renderToCanvas(qrCanvas, shareUrl, { size: 100, margin: 4, logoText: '🌟' });
    ctx.drawImage(qrCanvas, 650, 310, 100, 100);

    ctx.fillStyle = tokens.bannerBg;
    ctx.fillRect(50, 335, 300, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 18px ${tokens.fontFamily}`;
    ctx.fillText('📲 Play via LINE / Scan QR ➔', 65, 363);

    // 4. Load & Render Pet Image
    if (petImgUrl) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw Circle Backing
          ctx.beginPath();
          ctx.arc(520, 225, 110, 0, Math.PI * 2);
          ctx.fillStyle = tokens.themeId === 'comic' ? '#FFF8E8' : 'rgba(99, 102, 241, 0.2)';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = tokens.borderColor;
          ctx.stroke();

          // Draw Pet Sprite
          ctx.drawImage(img, 420, 125, 200, 200);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = petImgUrl;
      });
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  static renderQrModal(canvasEl, urlInputEl, options = {}) {
    const url = this.createShareUrl(options);
    if (canvasEl) {
      QRGenerator.renderToCanvas(canvasEl, url, { size: 260, margin: 12, logoText: '🌟' });
    }
    if (urlInputEl) {
      urlInputEl.value = url;
    }
    return url;
  }

  static async shareVictoryCard(options = {}) {
    const title = `${options.playerName || 'Lucky'} rescued ${options.petName || 'a pet'} in Lucky's Learning World!`;
    const shareUrl = this.createShareUrl(options);
    
    try {
      const blob = await this.generateVictoryCardBlob(options);
      if (blob) {
        const file = new File([blob], `victory-${options.petName || 'pet'}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: `Can you beat ${options.playerName || 'Lucky'}'s score?`,
            url: shareUrl,
            files: [file]
          });
          return { success: true, method: 'web-share-file' };
        }
      }
    } catch (err) {
      console.warn('File share omitted or unsupported, falling back to text URL share:', err);
    }

    // Fallback to text LINE link
    return this.shareToLine(shareUrl, title);
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

