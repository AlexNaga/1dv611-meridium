function standard() {
    // document.getElementsByClassName('normal').disabled = false;
    // document.querySelectorAll('#url, #includeDomains, #excludePaths').disabled = false;

    let inputs = document.querySelectorAll('form input');
    inputs.forEach(input => { input.disabled = false; });

    document.getElementById('advancedSettings').checked = false;
    document.getElementById('rawDataInput').disabled = true;
    document.getElementById('settings').checked = true;
    document.getElementById('structure').disabled = false;
}

function advanced() {
    let form = document.querySelector('form');
    let inputs = form.querySelectorAll('input');
    inputs.forEach(input => { input.disabled = true; });
    
    document.getElementsByName('email')[0].disabled = false;    
    document.getElementById('advancedSettings').checked = true;
    document.getElementById('rawDataInput').disabled = false;
    document.getElementById('settings').checked = false;
    document.getElementById('settings').disabled = false;
    document.getElementById('structure').disabled = true;
}

standard();