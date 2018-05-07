new Modal();

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
                                b.classList.toggle('hidden'); // switch buttons
                            }
                            toggleLoadingSpinner(icons);
                        } else {
                            toggleError(icons);
                        }
                    });
            });
        }
    }
}

function toggleLoadingSpinner(target) {
    if (!target.parentElement.classList.contains('is-danger')) {
        target.children[0].classList.toggle('hidden');      // toggle pause/play icon
    }
    target.children[2].classList.add('hidden');             // hide exclamation icon
    target.parentElement.classList.remove('is-danger');     // remove red button color
    target.children[1].classList.toggle('hidden');          // toggle spinner
}

function toggleError(target) {
    target.parentElement.classList.add('is-danger');    // show red button color
    target.children[2].classList.remove('hidden');      // show exclamation icon
    target.children[0].classList.add('hidden');         // hide pause/play icon
    target.children[1].classList.add('hidden');         // hide spinner

}

setupPauseListener();