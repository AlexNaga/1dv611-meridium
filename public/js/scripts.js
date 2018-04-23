// Code for notifications
function closeNotification() {
    let $notifications = getAll('.notification');

    if ($notifications.length > 0) {
        $notifications.forEach(($elem) => {
            let deleteBtn = $elem.querySelector('button');
            deleteBtn.addEventListener('click', (e) => {
                let notification = e.target.parentNode;
                notification.parentNode.removeChild(notification);
            });
        });
    }
}

function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}
closeNotification(); // Add event listener for closing notifications


// Code for sticky header https://www.w3schools.com/howto/howto_js_sticky_header.asp
window.onscroll = function () { stickyNavBar(); };
let navbar = document.getElementById('navbar');
let sticky = navbar.offsetTop;
function stickyNavBar() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add('sticky');
        navbar.firstElementChild.classList.add('is-dark');
        navbar.firstElementChild.classList.add('is-bold');
    } else {
        navbar.classList.remove('sticky');
        navbar.firstElementChild.classList.remove('is-dark');
        navbar.firstElementChild.classList.remove('is-bold');
    }
}

// Table row clickable
let tableRows = document.querySelectorAll('.table-row-hover tr');
for (let i = 0; i < tableRows.length; i++) {
    tableRows[i].addEventListener('click', function () {
        let links = this.getElementsByTagName('a');
        if (links.length) {
            window.location = links[0].href;
        }
    });
}