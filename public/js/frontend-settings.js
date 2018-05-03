function showSettings() {
    let settingsDiv = document.getElementById('settings');

    if (settingsDiv.style.display === 'none') {
        document.querySelector('#settings-li').classList.add('is-active');
        document.querySelector('#advancedSettings-li').classList.remove('is-active');
        
        document.getElementById('advancedSettings').style.display = 'none';

        settingsDiv.style.display = 'block';
    } else {
        if (document.querySelector('#settings-li').classList.contains('is-active')) {
            return;
        }
        settingsDiv.style.display = 'none';
    }
}

function showAdvancedSettings() {
    let advancedSettingsDiv = document.getElementById('advancedSettings');

    if (advancedSettingsDiv.style.display === 'none') {
        document.querySelector('#advancedSettings-li').classList.add('is-active');
        document.querySelector('#settings-li').classList.remove('is-active');
        
        document.getElementById('settings').style.display = 'none';

        advancedSettingsDiv.style.display = 'block';
    } else {
        if (document.querySelector('#advancedSettings-li').classList.contains('is-active')) {
            return;
        }
        advancedSettingsDiv.style.display = 'none';
    }
}

showSettings();