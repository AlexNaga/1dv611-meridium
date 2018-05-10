let settingsTab = document.getElementById('settings-tab');
let settingsDiv = document.getElementById('settings');
let advSettingsTab = document.getElementById('advancedSettings-tab');
let advSettingsDiv = document.getElementById('advancedSettings');

// standard settings for archiving
settingsTab.addEventListener('click', () => {
    if (settingsDiv.classList.contains('hidden')) {
        settingsTab.classList.add('is-active');
        advSettingsTab.classList.remove('is-active');

        settingsDiv.classList.remove('hidden');
        advSettingsDiv.classList.add('hidden');
    } else {
        if (settingsTab.classList.contains('is-active')) {
            // clicking on the active tab
            return;
        }
        settingsDiv.classList.remove('hidden');
    }
});

// advanced settings for archiving
advSettingsTab.addEventListener('click', () => {
    if (advSettingsDiv.classList.contains('hidden')) {
        settingsTab.classList.remove('is-active');
        advSettingsTab.classList.add('is-active');

        settingsDiv.classList.add('hidden');
        advSettingsDiv.classList.remove('hidden');
    } else {
        if (advSettingsTab.classList.contains('is-active')) {
            // clicking on the active tab
            return;
        }
        advSettingsDiv.classList.remove('hidden');
    }
});
