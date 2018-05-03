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
let navbar = document.getElementById('navbar');
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
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(($el) => {
            $el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                var target = $el.dataset.target;
                var $target = document.getElementById(target);
                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});

/**
 * @param {string} url The resource that you wish to fetch
 * @param {Object} options An options object containing any custom settings that you want to apply to the request.
 */
function fetchUrl(url, options) {
    let defaultOptions = {
        credentials: 'same-origin' // send cookies for the current domain
    };
    Object.assign(defaultOptions, options); // sent options overrides defaultOptions
    return fetch(url, defaultOptions)
        .then(resp => {
            if (resp.ok) return resp.json();

            throw resp; // new Error('Something went wrong');
        });
}