new Modal('archives');

function setupEventHandlers() {
    let archiveList = document.querySelectorAll('#archiveList > tr');

    for (let i = 0; i < archiveList.length; i++) {
        let elem = archiveList[i];
        previewAction(elem);
    }
}

function previewAction(elem) {
    let btn = elem.querySelector('.action-preview');
    let archiveId = btn.getAttribute('data-id');
    let archiveName = btn.getAttribute('data-name');
    let archiveDate = btn.getAttribute('data-date');

    btn.addEventListener('click', () => {
        let previewContainer = document.querySelector('#previewContainer');
        let modalBody = document.querySelector('.modal-card-body');
        let previewTitle = document.querySelector('#previewTitle');

        previewTitle.textContent = `Förhandsgranskning av: ${archiveName} (${archiveDate})`;

        async function loadPreview(url) {
            previewContainer.src = url;
            return await new Promise(resolve => {
                previewContainer.onload = e => {
                    resolve(e);
                };

                modalBody.appendChild(previewContainer);
            });
        }

        loadPreview('/archives/preview/' + archiveId);
    });
}

setupEventHandlers();