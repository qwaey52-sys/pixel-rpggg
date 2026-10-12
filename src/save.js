const KEY = 'pixel-rpg-save-v1';

const DEFAULT_STATE = {
  x: 60,
  y: 90,
  hp: 20,
  maxHp: 20,
  flags: {},
  ending: null
};

export const save = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
    } catch (e) {
      return { ...DEFAULT_STATE };
    }
  },
  write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Не удалось сохранить прогресс', e);
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }
};
