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
            addConfirmDeletion();
        })
        .catch(function (err) {
            err.json().then(errorMessage => {
                console.log(errorMessage);
            });
        });
}

function createList(arrWithFiles) {
    let list = document.createElement('ul');
    for (let i = 0; i < arrWithFiles.length; i++) {
        let li = document.createElement('li');
        li.appendChild(createLink(arrWithFiles[i].path));
        li.appendChild(deleteBtn(arrWithFiles[i].path));
        list.appendChild(li);
    }
    return list;
}

function deleteBtn(archiveName) {
    let btn = document.createElement('button');
    btn.classList.add('modal-button');
    btn.classList.add('delete');
    btn.dataset.target = 'confirmDel';
    btn.title = 'Radera arkiv';

    btn.addEventListener('click', function () {
        let modalRemoveBtn = document.querySelector('#confirmDel > div.modal-content > div > button.button.is-danger');
        modalRemoveBtn.addEventListener('click', function () {
            fetch('/archives/' + archiveName, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        btn.parentNode.parentNode.removeChild(btn.parentNode);
                    } else {
                        console.log('Something went wrong when trying to delete an archive');
                    }
                });
        });
    });
    return btn;
}

function createLink(name) {
    let a = document.createElement('a');
    let linkText = document.createTextNode(name + ' ');
    a.appendChild(linkText);
    a.title = name;
    a.href = '/archives/' + name;
    return a;
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

let listNextButton = document.getElementById('list-next');
let listPreviousButton = document.getElementById('list-previous');

listNextButton.addEventListener('click', function () {
    // let page = parseInt(decodeQueryString('page'));
    getArchiveList(++page);
    history.pushState({}, 'page ' + page, '/?page=' + page);
});

listPreviousButton.addEventListener('click', function () {
    // page = parseInt(decodeQueryString('page'));
    page = --page < 1 ? 0 : page;
    getArchiveList(page);
    history.pushState({}, 'page ' + page, '/?page=' + page);
});

getArchiveList(page);


// Code for confirmation message when deleting an archive
function addConfirmDeletion() {
    let rootElem = document.documentElement;
    let $modals = getAll('.modal');
    let $modalButtons = getAll('.modal-button');
    let $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button, .hideModal');

    if ($modalButtons.length > 0) {
        $modalButtons.forEach(($elem) => {
            $elem.addEventListener('click', () => {
                let target = $elem.dataset.target;
                let $target = document.getElementById(target);
                rootElem.classList.add('is-clipped');
                $target.classList.add('is-active');
            });
        });
    }

    if ($modalCloses.length > 0) {
        $modalCloses.forEach(($elem) => {
            $elem.addEventListener('click', () => {
                closeModals();
            });
        });
    }

    // If user press ESC-button
    document.addEventListener('keydown', (event) => {
        let e = event || window.event;
        if (e.keyCode === 27) {
            closeModals();
        }
    });

    function closeModals() {
        rootElem.classList.remove('is-clipped');
        $modals.forEach(($elem) => {
            $elem.classList.remove('is-active');
        });
    }

    function getAll(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }
}