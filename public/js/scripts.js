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
let navbar = document.getElementsByTagName('navbar');
let sticky = navbar.offsetTop;
window.onscroll = function () {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add('sticky');
        navbar.firstElementChild.classList.add('is-dark');
        navbar.firstElementChild.classList.add('is-bold');
    } else {
        navbar.classList.remove('sticky');
        navbar.firstElementChild.classList.remove('is-dark');
        navbar.firstElementChild.classList.remove('is-bold');
    }
};

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

// Navbar burger menu toggle
// https://bulma.io/documentation/components/navbar/#navbar-menu
document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    let navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if (navbarBurgers.length > 0) {
        // Add a click event on each of them
        navbarBurgers.forEach((el) => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                let target = document.getElementById(el.dataset.target);
                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                target.classList.toggle('is-active');
            });
        });
    }
});

/**
 * @param {string} url The resource that you wish to fetch
 * @param {object} options An options object containing any custom settings that you want to apply to the request.
 */
function fetchUrl(url, options) {
    let defaultOptions = {
        credentials: 'same-origin' // send cookies for the current domain
    };
    Object.assign(defaultOptions, options); // sent options overrides defaultOptions
    return fetch(url, defaultOptions)
        .then(resp => {
            return resp.ok ?
                resp.json() :
                resp.json().then((err) => Promise.reject(err));
        });
}

/**
 * Displays a flash message, same as req.session.flash
 * @param {string} message The displayed message
 * @param {object} obj Bulma colors https://bulma.io/documentation/overview/colors/
 * example: { danger: true }
 */
function flashMessage(message, obj = { info: true }) {
    let color = obj.danger ? 'danger' :
        obj.success ? 'success' :
            'info';

    let container = document.createElement('div');
    let notification = document.createElement('div');
    let delButton = document.createElement('button');
    let text = document.createTextNode(message);

    container.classList.add('notification-container');
    notification.classList.add('notification', 'fade-in-out', 'has-text-centered', 'is-' + color);
    delButton.classList.add('delete');
    notification.appendChild(delButton);
    notification.appendChild(text);
    container.appendChild(notification);

    // while (container.firstChild) container.removeChild(container.firstChild);
    document.body.appendChild(container);

    closeNotification(); // Add event listener for closing notifications
}