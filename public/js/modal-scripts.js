// Code for confirmation message when deleting an archive
class Modal {
    constructor() {
        this.rootElem = document.documentElement;
        this.modalButtons = Modal.getAll('.modal-button');
        this.modalCloses = Modal.getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');
    }

    /**
    * @param {string} url The resource that you wish to fetch
    * @param {Object} options An options object containing any custom settings that you want to apply to the request.
    */
    fetchUrl(url, options) {
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

    addEventListener(path) {
        if (this.modalButtons.length > 0) {
            this.modalButtons.forEach((elem) => {
                elem.addEventListener('click', (event) => {
                    event.stopPropagation();
                    let clickedElem = elem.dataset.target;
                    let target = document.getElementById(clickedElem);
                    this.rootElem.classList.add('is-clipped');
                    target.classList.add('is-active');
                    deleteBtn(path, elem);
                });
            });
        }

        let deleteBtn = (path, elem) => {
            // Clone elem to remove old event listeners, to prevent multiple deletes
            let oldElem = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
            let newElem = oldElem.cloneNode(true);
            oldElem.parentNode.replaceChild(newElem, oldElem);

            let id = elem.getAttribute('data-id');
            let elemRow = elem.parentNode.parentNode.parentNode;

            let modalRemoveBtn = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
            modalRemoveBtn.addEventListener('click', () => {
                this.fetchUrl(`/${path}/delete/` + id, {
                    method: 'DELETE'
                })
                    .catch((err) => {
                        // console.log('Something went wrong when trying to delete an archive');
                        // err.status 404 = ENOENT = No such file on disk, but removed entry removed from db
                        console.log(err);
                    })
                    .finally(() => {
                        let isScheduleDeleted = elemRow.constructor.name === 'HTMLDivElement';

                        // Redirect if a schedule was deleted else remove row
                        if (isScheduleDeleted) {
                            window.location.href = '/schedules';
                        }

                        elemRow.parentNode.removeChild(elemRow);
                        this.closeModals();
                    });
            });
        };

        if (this.modalCloses.length > 0) {
            this.modalCloses.forEach((elem) => {
                elem.addEventListener('click', () => {
                    this.closeModals();
                });
            });
        }

        // If user press ESC-button
        document.addEventListener('keydown', (event) => {
            let e = event || window.event;
            if (e.keyCode === 27) {
                this.closeModals();
            }
        });
    }

    closeModals() {
        let modals = Modal.getAll('.modal');
        let rootElem = document.documentElement;

        rootElem.classList.remove('is-clipped');
        modals.forEach((elem) => {
            elem.classList.remove('is-active');
        });
    }

    static getAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }
}