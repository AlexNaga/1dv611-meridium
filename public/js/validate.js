function checkPass() {
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');

    let message = document.getElementById('confirmMessage');

    //Set the colors we'll be using
    let passwordsMatch = '#66cc66';
    let passwordDontMatch = '#ff6666';

    if (password.value === passwordConfirm.value) {
        passwordConfirm.style.backgroundColor = passwordsMatch;
        message.style.color = passwordsMatch;
        document.getElementById('registerBtn').disabled = false;
    } else {
        passwordConfirm.style.backgroundColor = passwordDontMatch;
        message.style.color = passwordDontMatch;
        document.getElementById('registerBtn').disabled = true;        
    }
}