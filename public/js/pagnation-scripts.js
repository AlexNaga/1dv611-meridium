let page = parseInt(getQueryString('page')) || 0;

function getArchiveList(number) {
    fetch('/archives/?page=' + number)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw response; //new Error('Something went wrong');
            }
        })
        .then(function (data) {
            let myNode = document.getElementById('recent-list');

            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }

            myNode.appendChild(createList(data.archives));
            addConfirmDeletion(); // Add event listener for the confirmation message
            previewArchive(); // Add event listener for previewing a .zip
        })
        .catch(function (err) {
            console.log(err);

            err.json().then(errorMessage => {
                console.log(errorMessage);
            });
        });
}

function createList(arrWithFiles) {
    let list = document.createElement('ul');
    for (let i = 0; i < arrWithFiles.length; i++) {
        let archiveName = arrWithFiles[i].path;
        let li = document.createElement('li');
        let btnContainer = document.createElement('div');
        btnContainer.classList.add('buttons');

        btnContainer.appendChild(deleteBtn(archiveName));
        btnContainer.appendChild(downloadBtn(archiveName));
        btnContainer.appendChild(previewBtn(archiveName));

        li.appendChild(btnContainer);
        list.appendChild(li);
    }
    return list;
}

function previewBtn(archiveName) {
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
        fetch('/archives/preview/' + archiveName, {
            method: 'GET'
        })
            .then((resp) => resp.json())
            .then((data) => {
                let previewContainer = document.querySelector('#previewContainer');
                previewContainer.src = 'data:text/html;charset=utf-8,' + escape(data.html);
            })
            .catch((err) => {
                console.log(err);
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

function deleteBtn(archiveName) {
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
            fetch('/archives/' + archiveName, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        btn.parentNode.parentNode.removeChild(btn.parentNode);
                        removeConfirmDeletion();
                    } else {
                        console.log('Something went wrong when trying to delete an archive');
                    }
                });
        });
    });
    return btn;
}

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


function previewArchive() {
    let archives = getAll('.archive');

    if (archives.length > 0) {
        archives.forEach((archive) => {
            archive.addEventListener('click', () => {
                console.log(archive.title);
            });
        });
    }
}

function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}