const modal = new Modal();
modal.addEventListener('schedules');

/**
 * Pause / Start scheduled archive
 */
function setupPauseListener() {
    let pausePlayButtons = document.getElementsByClassName('pause-state-buttons');
    if (pausePlayButtons.length > 0) {
        for (let button of pausePlayButtons) {
            button.addEventListener('click', (e) => {
                let icons = e.currentTarget.children[0];
                let id = e.currentTarget.getAttribute('data-id');
                toggleLoadingSpinner(icons);
                fetchUrl('/schedules/pause/' + id, { method: 'POST' })
                    .then((data) => {
                        if (data.success) {
                            for (let b of pausePlayButtons) {
                                b.classList.toggle('hidden'); // the whole button
                            }
                        } else {
                            alert(data.message);
                            toggleError(icons);
                        }
                        toggleLoadingSpinner(icons);
                    });
            });
        }
    }
}

function toggleLoadingSpinner(target) {
    if (target.children[2].classList.contains('hidden')) { // if exclamation icon is hidden
        target.children[0].classList.toggle('hidden'); // pause/play icon
    }
    target.children[1].classList.toggle('hidden'); // spinner
    target.parentNode.classList.remove('is-danger'); // whole button
    target.children[2].classList.add('hidden'); // exclamation icon
}

function toggleError(target) {
    target.children[0].classList.add('hidden'); // pause/play icon
    target.children[2].classList.remove('hidden'); // exclamation icon
    target.parentNode.classList.add('is-danger'); // whole button
}

setupPauseListener();