function checkPass() {
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');

    let message = document.getElementById('confirmMessage');

    //Set the colors we'll be using
    let goodColor = '#66cc66';
    let badColor = '#ff6666';

    if (password.value === passwordConfirm.value) {
        passwordConfirm.style.backgroundColor = goodColor;
        message.style.color = goodColor;
        let p = document.createTextNode('Passwords match');
        message.replaceChild(p);
        message.innerText = 'asdas';
    } else {
        passwordConfirm.style.backgroundColor = badColor;
        message.style.color = badColor;
        let p = document.createTextNode('Passwords don\'t match');
        message.replaceChild(p);
    }
}