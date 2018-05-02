const modal = new Modal();
modal.addEventListener('schedules');

/**
 * Pause / Start scheduled archive
 */
function setupListeners() {
    let pause = document.getElementsByClassName('pause-state');
    if (pause.length > 0) {
        for (let button of pause) {
            button.addEventListener('click', (e) => {
                let icons = e.target.children[0];
                let id = e.target.getAttribute('data-id');
                toggleSpinner(icons);
                fetchUrl('/schedules/pause/' + id, { method: 'POST' })
                    .then((data) => {
                        if (data.success) {
                            for (let b of pause) {
                                b.classList.toggle('hidden'); // the whole button
                            }
                        } else {
                            alert(data.message);
                            toggleError(icons);
                        }
                        toggleSpinner(icons);
                    });
            });
        }
    }
}

function toggleSpinner(target) {
    if (target.children[2].classList.contains('hidden')) { // exclamation icon
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

setupListeners();