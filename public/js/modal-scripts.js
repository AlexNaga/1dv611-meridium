// Code for confirmation message when deleting an archive
class Modal {
    constructor() {
        this.rootElem = document.documentElement;
        this.modalButtons = Modal.getAll('.modal-button');
        this.modalCloses = Modal.getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');
        this.addEventListener();
    }

    addEventListener() {
        if (this.modalButtons.length > 0) {
            this.modalButtons.forEach((elem) => {
                elem.addEventListener('click', (event) => {
                    event.stopPropagation();
                    let modal = document.querySelector('div.modal');
                    let typeToDeleteSpan = document.querySelector('div.modal > div.modal-content > div > p > span');

                    modal.classList.add('is-active');
                    typeToDeleteSpan.innerHTML = this.route === 'archives' ? 'arkivet' : 'schemaläggningen';
                    deleteBtn(elem);
                });
            });
        }

        let deleteBtn = (elem) => {
            // Clone elem to remove old event listeners, to prevent multiple deletes
            let oldElem = document.querySelector('div.modal > div.modal-content > div > button.button.is-danger');
            oldElem.parentNode.replaceChild(oldElem.cloneNode(true), oldElem);

            let id = elem.getAttribute('data-id');
            this.route = elem.getAttribute('data-route');
            this.redirectRoute = elem.getAttribute('data-redirect-route');
            let elemRow = this.findParentRow(elem, 'scheduleRow');
            let modalRemoveBtn = document.querySelector('div.modal > div.modal-content > div > button.button.is-danger');
            let isScheduleDeleted = elemRow.constructor.name === 'HTMLDivElement'; // When editing a schedule

            modalRemoveBtn.addEventListener('click', () => {
                fetchUrl(`/${this.route}/delete/` + id, {
                    method: 'DELETE'
                })
                    .then((data) => {
                        flashMessage(data.message, data);
                        elemRow.parentNode.removeChild(elemRow);
                    })
                    .catch((err) => {
                        // err.status 404 = ENOENT = No such file on disk, but entry removed from db
                        flashMessage(err.message, err);
                    })
                    .finally(() => {
                        // Redirect if a schedule was deleted from the edit page, else remove row
                        if (isScheduleDeleted) {
                            // This will also show the flash message upon reload
                            window.location = window.location.origin + '/' + this.redirectRoute;
                        } else {
                            this.closeModals();
                        }
                    });
            });
            modalRemoveBtn.focus(); // So you can just press Enter
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

    /**
     * 
     * @param {*} elem        // The start elem
     * @param {*} classToFind // The elem class to find and match with
     */
    findParentRow(elem, classToFind) {
        while (elem.parentNode) {
            elem = elem.parentNode;
            let elemClass = elem.classList[0];
            if (elemClass === classToFind) {
                return elem;
            }
        }
        return null;
    }

    static getAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }
}