// Theme management system
export const themes = {
    light: {
        name: 'Light',
        background: '#ffffff',
        text: '#2d3436',
        primary: '#6c5ce7',
        secondary: '#a29bfe',
    },
    dark: {
        name: 'Dark',
        background: '#2d3436',
        text: '#dfe6e9',
        primary: '#a29bfe',
        secondary: '#6c5ce7',
    },
    sunset: {
        name: 'Sunset',
        background: '#ff9a8b',
        background2: '#ff6b6b',
        text: '#2d3436',
        primary: '#ff4757',
        secondary: '#ff6b81',
    },
    ocean: {
        name: 'Ocean',
        background: '#00cec9',
        background2: '#0984e3',
        text: '#f1f2f6',
        primary: '#00b894',
        secondary: '#81ecec',
    }
};

// Load saved theme or default to light
export function loadTheme() {
    const savedTheme = localStorage.getItem('emotitunes_theme') || 'light';
    applyTheme(themes[savedTheme] || themes.light);
    return savedTheme;
}

// Apply theme to the document
export function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', theme.background);
    root.style.setProperty('--bg-color2', theme.background2 || theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    
    // Update theme-specific classes
    document.body.className = `theme-${theme.name.toLowerCase()}`;
    
    // Save to localStorage
    localStorage.setItem('emotitunes_theme', theme.name.toLowerCase());
}

// Theme selector component
export function createThemeSelector() {
    const container = document.createElement('div');
    container.className = 'theme-selector';
    
    const label = document.createElement('label');
    label.textContent = 'Theme:';
    label.htmlFor = 'theme-select';
    
    const select = document.createElement('select');
    select.id = 'theme-select';
    select.className = 'theme-select';
    
    // Add theme options
    Object.entries(themes).forEach(([key, theme]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = theme.name;
        select.appendChild(option);
    });
    
    // Load saved theme
    select.value = localStorage.getItem('emotitunes_theme') || 'light';
    
    // Add change event
    select.addEventListener('change', (e) => {
        const theme = themes[e.target.value];
        if (theme) {
            applyTheme(theme);
        }
    });
    
    container.appendChild(label);
    container.appendChild(select);
    
    return container;
}
