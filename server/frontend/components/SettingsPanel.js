import { createThemeSelector } from '../theme.js';
import { SettingsManager } from '../settings.js';

export class SettingsPanel {
    constructor() {
        this.isVisible = false;
        this.settings = SettingsManager.load();
        this.panel = null;
        this.initialize();
    }

    initialize() {
        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'settings-panel';
        this.panel.style.display = 'none';

        // Header
        const header = document.createElement('div');
        header.className = 'settings-header';
        header.innerHTML = '<h3>Settings</h3>';
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.toggle(false));
        header.appendChild(closeBtn);
        
        // Theme selector
        const themeSection = document.createElement('div');
        themeSection.className = 'settings-section';
        themeSection.innerHTML = '<h4>Appearance</h4>';
        themeSection.appendChild(createThemeSelector());
        
        // Preferences
        const prefsSection = document.createElement('div');
        prefsSection.className = 'settings-section';
        prefsSection.innerHTML = '<h4>Preferences</h4>';
        
        // Save responses toggle
        const saveResponses = this.createToggle(
            'saveResponses', 
            'Save my quiz responses',
            'Save your responses to continue later',
            this.settings.saveResponses
        );
        
        // Auto-play preview toggle
        const autoPlay = this.createToggle(
            'autoPlayPreview',
            'Auto-play song previews',
            'Automatically play song previews when available',
            this.settings.autoPlayPreview
        );
        
        prefsSection.appendChild(saveResponses);
        prefsSection.appendChild(autoPlay);
        
        // Assemble panel
        this.panel.appendChild(header);
        this.panel.appendChild(themeSection);
        this.panel.appendChild(prefsSection);
        
        // Add to body
        document.body.appendChild(this.panel);
        
        // Add settings button to page if it doesn't exist
        if (!document.getElementById('settingsBtn')) {
            const btn = document.createElement('button');
            btn.id = 'settingsBtn';
            btn.className = 'settings-btn';
            btn.innerHTML = '⚙️';
            btn.title = 'Settings';
            btn.addEventListener('click', () => this.toggle());
            document.body.appendChild(btn);
        }
    }
    
    createToggle(name, label, description, checked) {
        const container = document.createElement('div');
        container.className = 'setting-toggle';
        
        const labelEl = document.createElement('label');
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = name;
        input.checked = checked;
        input.addEventListener('change', (e) => {
            SettingsManager.update({ [name]: e.target.checked });
        });
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        const text = document.createElement('div');
        text.className = 'toggle-text';
        text.innerHTML = `<strong>${label}</strong><small>${description}</small>`;
        
        labelEl.appendChild(input);
        labelEl.appendChild(slider);
        container.appendChild(labelEl);
        container.appendChild(text);
        
        return container;
    }
    
    toggle(show = !this.isVisible) {
        this.isVisible = show;
        this.panel.style.display = show ? 'block' : 'none';
        
        // Close when clicking outside
        if (show) {
            const clickHandler = (e) => {
                if (!this.panel.contains(e.target) && e.target.id !== 'settingsBtn') {
                    this.toggle(false);
                    document.removeEventListener('click', clickHandler);
                }
            };
            setTimeout(() => document.addEventListener('click', clickHandler), 0);
        }
    }
}
