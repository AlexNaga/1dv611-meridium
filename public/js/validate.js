function validatePass() {
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');

    let message = document.getElementById('confirmMessage');

    // Set the colors we'll be using
    let passwordsMatch = '#23d160';
    let passwordDontMatch = '#ff3860';

    if (password.value === passwordConfirm.value) {
        passwordConfirm.style.backgroundColor = passwordsMatch;
        message.style.color = passwordsMatch;
        document.getElementById('submitBtn').disabled = false;
    } else {
        passwordConfirm.style.backgroundColor = passwordDontMatch;
        message.style.color = passwordDontMatch;
        document.getElementById('submitBtn').disabled = true;
    }
    console.log('validatePass');
}