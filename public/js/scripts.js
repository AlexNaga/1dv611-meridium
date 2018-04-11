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

function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}