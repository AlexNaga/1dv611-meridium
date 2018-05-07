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
                button.classList.toggle('is-loading');
                fetchUrl('/schedules/pause/' + id, { method: 'POST' })
                    .then((data) => {
                        if (data.success) {
                            for (let b of pausePlayButtons) {
                                b.classList.toggle('hidden'); // switch buttons
                            }
                        } else {
                            toggleError(icons);
                            flashMessage(data.message);
                        }
                        button.classList.toggle('is-loading');
                    });
            });
        }
    }
}
function toggleError(target) {
    target.parentElement.classList.add('is-danger');    // show red button color
    target.children[2].classList.remove('hidden');      // show exclamation icon
    target.children[0].classList.add('hidden');         // hide pause/play icon
    target.children[1].classList.add('hidden');         // hide spinner

}

setupPauseListener();