// Code for confirmation message when deleting an archive
class Modal {
    constructor(path) {
        this.path = path;
        this.rootElem = document.documentElement;
        this.modalButtons = Modal.getAll('.modal-button');
        this.modalCloses = Modal.getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');
        this.addEventListener()
    }

    addEventListener() {
        if (this.modalButtons.length > 0) {
            this.modalButtons.forEach((elem) => {
                elem.addEventListener('click', (event) => {
                    event.stopPropagation();
                    let clickedElem = elem.dataset.target;
                    let target = document.getElementById(clickedElem);
                    this.rootElem.classList.add('is-clipped');
                    target.classList.add('is-active');
                    deleteBtn(elem);
                });
            });
        }

        let deleteBtn = (elem) => {
            // Clone elem to remove old event listeners, to prevent multiple deletes
            let oldElem = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
            let newElem = oldElem.cloneNode(true);
            oldElem.parentNode.replaceChild(newElem, oldElem);

            let id = elem.getAttribute('data-id');
            let elemRow = elem.parentNode.parentNode.parentNode;

            let modalRemoveBtn = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
            modalRemoveBtn.addEventListener('click', () => {
                fetchUrl(`/${this.path}/delete/` + id, {
                    method: 'DELETE'
                })
                    .then((data) => {
                        flashMessage(data.message, data);
                    })
                    .catch((err) => {
                        // err.status 404 = ENOENT = No such file on disk, but entry removed from db
                        flashMessage(err.message, err);
                    })
                    .finally(() => {
                        let isScheduleDeleted = elemRow.constructor.name === 'HTMLDivElement';

                        // Redirect if a schedule was deleted from the edit page, else remove row
                        if (isScheduleDeleted) {
                            // This will also show the flash message upon reload
                            window.location = window.location.origin + '/' + this.path;
                        } else {
                            elemRow.parentNode.removeChild(elemRow);
                            this.closeModals();
                        }
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