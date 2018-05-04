function validatePass() {
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');

    let passwordsMatch = '#23d160'; // Green color for OK
    let passwordDontMatch = '';

    if (password.value === passwordConfirm.value) {
        passwordConfirm.style.backgroundColor = passwordsMatch;
        document.getElementById('submitBtn').disabled = false;
    } else {
        passwordConfirm.style.backgroundColor = passwordDontMatch;
        document.getElementById('submitBtn').disabled = true;
    }
}