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

            throw resp; //new Error('Something went wrong');
        });
}

function getArchiveList(number) {
    fetchUrl('/archives/?page=' + number)
        .then(function (data) {
            let archiveList = document.getElementById('recent-list');

            while (archiveList.firstChild) {
                archiveList.removeChild(archiveList.firstChild);
            }

            archiveList.appendChild(createList(data.archives));
            addConfirmDeletion(); // Add event listener for the confirmation message
        })
        .catch(function (err) {
            console.log(err);
        });
}

function createList(arrWithFiles) {
    let list = document.createElement('ul');
    for (let i = 0; i < arrWithFiles.length; i++) {
        let archiveId = arrWithFiles[i]._id;
        let archiveName = arrWithFiles[i].fileName;
        let archiveSize = arrWithFiles[i].fileSize; // Convert to KB

        let li = document.createElement('li');
        let btnContainer = document.createElement('div');
        btnContainer.classList.add('archive');
        btnContainer.classList.add('buttons');

        btnContainer.appendChild(deleteBtn(archiveId));
        btnContainer.appendChild(downloadBtn(archiveName));
        btnContainer.appendChild(previewBtn(archiveId, archiveName));
        btnContainer.appendChild(sizeInfo(archiveSize));

        li.appendChild(btnContainer);
        list.appendChild(li);
    }
    return list;
}

function deleteBtn(archiveId) {
    let btn = document.createElement('button');
    btn.classList.add('button');
    btn.classList.add('is-inverted');
    btn.classList.add('is-rounded');
    btn.classList.add('is-danger');
    btn.classList.add('is-small');
    btn.classList.add('modal-button');
    btn.dataset.target = 'confirmDel';
    btn.title = 'Radera arkiv';

    let iconContainer = document.createElement('span');
    iconContainer.classList.add('icon');

    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-lg');
    icon.classList.add('fa-times');

    iconContainer.appendChild(icon);
    btn.appendChild(iconContainer);

    btn.addEventListener('click', () => {
        // Clone elem to remove old event listeners
        let oldElem = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
        let newElem = oldElem.cloneNode(true);
        oldElem.parentNode.replaceChild(newElem, oldElem);

        let modalRemoveBtn = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
        modalRemoveBtn.addEventListener('click', () => {

            fetchUrl('/archives/' + archiveId, {
                method: 'DELETE'
            })
                .then(() => {
                    btn.parentNode.parentNode.removeChild(btn.parentNode);
                    removeConfirmDeletion();
                })
                .catch((err) => {
                    console.log('Something went wrong when trying to delete an archive');
                    console.log(err);
                });
        });
    });
    return btn;
}

function downloadBtn(archiveName) {
    let btn = document.createElement('a');
    let btnText = document.createTextNode('Ladda ned');
    btn.appendChild(btnText);

    btn.classList.add('button');
    btn.classList.add('is-outlined');
    btn.classList.add('is-primary');
    btn.classList.add('is-rounded');
    btn.classList.add('is-small');
    btn.href = '/archives/' + archiveName;
    btn.title = 'Ladda ned arkiv';
    return btn;
}

function previewBtn(archiveId, archiveName) {
    let btn = document.createElement('button');
    let btnText = document.createTextNode(archiveName);

    btn.appendChild(btnText);
    btn.classList.add('button');
    btn.classList.add('is-inverted');
    btn.classList.add('is-link');
    btn.classList.add('is-rounded');
    btn.classList.add('is-small');
    btn.classList.add('modal-button');
    btn.dataset.target = 'previewArchive';
    btn.title = 'Förhandsgranska arkiv';

    btn.addEventListener('click', () => {
        let previewContainer = document.querySelector('#previewContainer');
        let previewTitle = document.querySelector('#previewTitle');
        previewTitle.textContent = archiveName;
        previewContainer.src = '';

        fetchUrl('/archives/preview/' + archiveId, {
            method: 'GET'
        })
            .then((data) => {
                previewContainer.src = 'data:text/html;charset=utf-8,' + escape(data.html);
            })
            .catch((err) => {
                previewContainer.src = 'data:text/html;charset=utf-8,' + escape(err.status + ' '+ err.statusText);
            });
    });
    return btn;
}

function sizeInfo(archiveSize) {
    let btn = document.createElement('button');
    let btnText = document.createTextNode(archiveSize);
    btn.appendChild(btnText);

    btn.classList.add('button');
    btn.classList.add('is-outlined');
    btn.classList.add('is-static');
    btn.classList.add('is-rounded');
    btn.classList.add('is-small');
    btn.title = 'Filstorlek ' + archiveSize;
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
    }
    else {
        return 0;
    }
}

let listNextBtn = document.getElementById('list-next');
let listPreviousBtn = document.getElementById('list-previous');

listNextBtn.addEventListener('click', function () {
    // let page = parseInt(decodeQueryString('page'));
    getArchiveList(++page);
    history.pushState({}, 'page ' + page, '/?page=' + page);
});

listPreviousBtn.addEventListener('click', function () {
    // page = parseInt(decodeQueryString('page'));
    page = --page < 1 ? 0 : page;
    getArchiveList(page);
    history.pushState({}, 'page ' + page, '/?page=' + page);
});

getArchiveList(page);


// Code for confirmation message when deleting an archive
function addConfirmDeletion() {
    let rootElem = document.documentElement;
    let modalButtons = getAll('.modal-button');
    let modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');

    if (modalButtons.length > 0) {
        modalButtons.forEach((elem) => {
            elem.addEventListener('click', () => {
                let clickedElem = elem.dataset.target;
                let target = document.getElementById(clickedElem);
                rootElem.classList.add('is-clipped');
                target.classList.add('is-active');
            });
        });
    }

    if (modalCloses.length > 0) {
        modalCloses.forEach((elem) => {
            elem.addEventListener('click', () => {
                removeConfirmDeletion();
            });
        });
    }

    // If user press ESC-button
    document.addEventListener('keydown', (event) => {
        let e = event || window.event;
        if (e.keyCode === 27) {
            removeConfirmDeletion();
        }
    });
}

function removeConfirmDeletion() {
    let rootElem = document.documentElement;
    let modals = getAll('.modal');
    function closeModals() {
        rootElem.classList.remove('is-clipped');
        modals.forEach((elem) => {
            elem.classList.remove('is-active');
        });
    }

    closeModals();
}

function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}