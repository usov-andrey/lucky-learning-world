/**
 * Zero-Friction Social Sharing Controller for LINE / Web Share API
 * Allows parents/teachers/Lucky to share custom word challenges via URL links.
 */

export class ShareController {
  static PRODUCTION_URL = 'https://usov-andrey.github.io/lucky-learning-world/';

  static createShareUrl(options = {}) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? this.PRODUCTION_URL : (window.location.origin + window.location.pathname);
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
      petImgUrl = 'pokemon/pikachu.png'
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 450);
    bgGrad.addColorStop(0, '#0f1225');
    bgGrad.addColorStop(0.5, '#191d3a');
    bgGrad.addColorStop(1, '#0a0c18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 450);

    // 2. Glassmorphism Card Frame & Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 410);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(25, 25, 750, 400);

    // 3. Header Text & Badge
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🌟 LUCKY\'S LEARNING WORLD', 50, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(`🏆 Adventurer: ${playerName}`, 50, 140);

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`⭐ Stars Earned: +${score}`, 50, 180);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(`🐾 Pet Rescued: ${petName}!`, 50, 230);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 20px system-ui, sans-serif';
    ctx.fillText('Can you beat my score in Math & Spelling?', 50, 280);

    // Call to Action Banner
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(50, 320, 320, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('📲 Play via LINE Link!', 75, 353);

    // 4. Load & Render Pet Image
    if (petImgUrl) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw Glowing Circle Backing
          ctx.beginPath();
          ctx.arc(580, 225, 120, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();

          // Draw Pet Sprite
          ctx.drawImage(img, 470, 115, 220, 220);
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

