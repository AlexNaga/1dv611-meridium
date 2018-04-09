let page = parseInt(getQueryString('page')) || 0;

function getArchiveList(number) {
    fetch('/archives/?page=' + number)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw response;//new Error('Something went wrong');
            }
        })
        .then(function (data) {
            console.log(data);
            let myNode = document.getElementById('recent-list');
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            document.getElementById('recent-list').appendChild(createList(data.archives));
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
        li.appendChild(deleteLink(arrWithFiles[i].path));
        list.appendChild(li);
    }
    return list;
}

function deleteLink(name) {
    let a = document.createElement('a');
    a.title = 'Delete ' + name;
    a.classList.add('delete');
    a.addEventListener('click', function () {
        fetch('/archives/' + name, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                } else {
                    console.log('something went wrong');
                }
            });
    });
    return a;
}

function createLink(name) {
    let a = document.createElement('a');
    let linkText = document.createTextNode(name);
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