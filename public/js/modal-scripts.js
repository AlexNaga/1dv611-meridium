// Code for confirmation message when deleting an archive
class Modal {
    constructor() {
        this.rootElem = document.documentElement;
        this.modalButtons = Modal.getAll('.modal-button');
        this.modalCloses = Modal.getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');
    }

    addEventListener() {
        if (this.modalButtons.length > 0) {
            this.modalButtons.forEach((elem) => {
                elem.addEventListener('click', () => {
                    let clickedElem = elem.dataset.target;
                    let target = document.getElementById(clickedElem);
                    this.rootElem.classList.add('is-clipped');
                    target.classList.add('is-active');
                });
            });
        }

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