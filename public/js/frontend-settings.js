function standard() {
    // document.getElementsByClassName('normal').disabled = false;
    // document.querySelectorAll('#url, #includeDomains, #excludePaths').disabled = false;

    let form = document.querySelector('form');
    let inputs = form.querySelectorAll('input');
    inputs.forEach(input => { input.disabled = false; });

    document.getElementById('advancedSettings').checked = false;
    document.getElementById('rawDataInput').disabled = true;
    document.getElementById('settings').checked = true;
}

function advanced() {
    let form = document.querySelector('form');
    let inputs = form.querySelectorAll('input');
    inputs.forEach(input => { input.disabled = true; });

    document.getElementById('advancedSettings').checked = true;
    document.getElementById('rawDataInput').disabled = false;
    document.getElementById('settings').checked = false;
}

standard();