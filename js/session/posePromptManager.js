
export class PosePromptManager {
  constructor() {
    this.mode = 'on'; 
    this.prompts = [
      { id: 'smile', text: 'Big smile! ✨', category: 'simple' },
      { id: 'camera', text: 'Look at the camera 👀', category: 'simple' },
      { id: 'peace', text: 'Peace sign ✌️', category: 'simple' },
      { id: 'serious', text: 'Best serious face 🤨', category: 'simple' },
      { id: 'heart', text: 'Heart with hands 🫶', category: 'fun' },
      { id: 'dramatic', text: 'Look away dramatically 🎭', category: 'fun' },
      { id: 'silly', text: 'Do something silly 😜', category: 'fun' },
      { id: 'model', text: 'Strike your model pose 😎', category: 'fun' },
      { id: 'kiss', text: 'Blow a kiss 😘', category: 'fun' },
      { id: 'cute', text: 'Your cutest pose 🌸', category: 'fun' },
      { id: 'freeze', text: 'Freeze! 🧊', category: 'fun' },
      { id: 'surprise', text: 'Look surprised! 😮', category: 'fun' },
    ];
    this.usedIds = new Set();
  }

  setMode(mode) {
    this.mode = mode || 'on';
  }

  resetSession() {
    this.usedIds.clear();
  }

  getNextPrompt(photoIndex = 0, targetCount = 4) {
    if (this.mode === 'off') return null;

    let pool = this.prompts;
    if (this.mode === 'simple') {
      pool = this.prompts.filter(p => p.category === 'simple');
    } else if (this.mode === 'fun') {
      pool = this.prompts.filter(p => p.category === 'fun');
    }

    let available = pool.filter(p => !this.usedIds.has(p.id));
    if (available.length === 0) {
      this.usedIds.clear();
      available = pool;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];
    this.usedIds.add(selected.id);
    return selected.text;
  }
}

export const posePromptManager = new PosePromptManager();
