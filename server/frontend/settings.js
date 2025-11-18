// Settings management system
export class SettingsManager {
    static DEFAULTS = {
        theme: 'light',
        saveResponses: true,
        autoPlayPreview: true,
        defaultPlaylistVisibility: 'public',
        lastQuizResponses: []
    };

    static load() {
        try {
            const saved = localStorage.getItem('emotitunes_settings');
            return saved ? JSON.parse(saved) : { ...this.DEFAULTS };
        } catch (e) {
            console.error('Error loading settings:', e);
            return { ...this.DEFAULTS };
        }
    }

    static save(settings) {
        try {
            localStorage.setItem('emotitunes_settings', JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    }

    static update(updates) {
        const current = this.load();
        const updated = { ...current, ...updates };
        return this.save(updated);
    }

    static get(key) {
        const settings = this.load();
        return key ? settings[key] : settings;
    }

    static saveQuizResponses(responses) {
        const settings = this.load();
        settings.lastQuizResponses = responses;
        return this.save(settings);
    }

    static getLastQuizResponses() {
        return this.get('lastQuizResponses');
    }
}
