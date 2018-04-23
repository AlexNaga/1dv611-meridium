const modal = new Modal();

let page = parseInt(getQueryString('page')) || 0;

/**
 * @param {string} url The resource that you wish to fetch
 * @param {Object} options An options object containing any custom settings that you want to apply to the request.
 */
function fetchUrl(url, options) {
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

function setupEventHandlers() {
    let list = document.querySelectorAll('#recent-list > ul > li > div');

    for (let i = 0; i < list.length; i++) {
        let elem = list[i];
        deleteBtn(elem);
        previewBtn(elem);
    }
    modal.addEventListener();    
}

function deleteBtn(elem) {
    let btn = elem.querySelector('.action-delete');
    let archiveId = btn.getAttribute('data-id');

    btn.addEventListener('click', () => {
        // Clone elem to remove old event listeners
        let oldElem = document.querySelector('#confirmArchiveDel > div.modal-content > div > button.button.is-danger');
        let newElem = oldElem.cloneNode(true);
        oldElem.parentNode.replaceChild(newElem, oldElem);

        let modalRemoveBtn = document.querySelector('#confirmArchiveDel > div.modal-content > div > button.button.is-danger');
        modalRemoveBtn.addEventListener('click', () => {

            fetchUrl('/archives/' + archiveId, {
                method: 'DELETE'
            })
                // .then(() => {
                //     btn.parentNode.parentNode.removeChild(btn.parentNode);
                //     closeModals();
                // })
                .catch((err) => {
                    // console.log('Something went wrong when trying to delete an archive');
                    // err.status 404 = ENOENT = No such file on disk, but removed entry removed from db
                    console.log(err);
                })
                .finally(() => {
                    btn.parentNode.parentNode.removeChild(btn.parentNode);
                    modal.closeModals();
                });
        });
    });
}

function previewBtn(elem) {
    let btn = elem.querySelector('.action-preview');
    let archiveId = btn.getAttribute('data-id');
    let archiveName = btn.getAttribute('data-name');

    btn.addEventListener('click', () => {
        let previewContainer = document.querySelector('#previewContainer');
        let previewTitle = document.querySelector('#previewTitle');
        previewTitle.textContent = `Förhandsgranskning av: ${archiveName}`;
        previewContainer.src = '';

        fetchUrl('/archives/preview/' + archiveId, {
            method: 'GET'
        })
            .then((data) => {
                previewContainer.src = 'data:text/html;charset=utf-8,' + escape(data.html);
            })
            .catch((err) => {
                previewContainer.src = 'data:text/html;charset=utf-8,' + escape(err.status + ' ' + err.statusText);
            });
    });
    return btn;
}

/**
 * Gets the value of the key in the querystring
 * @param {string} key Key name
 */
function getQueryString(key) {
    if (location.search) {
        let search = location.search.substring(1);
        let obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
        return obj[key];
    } else {
        return false;
    }
}

setupEventHandlers();