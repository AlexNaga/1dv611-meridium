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
            var myNode = document.getElementById('recent-list');
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
        list.appendChild(li);
    }
    return list;
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
    var search = location.search.substring(1);
    let obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    return obj[key];
}

let listNextButton = document.getElementById('list-next');
let listPreviousButton = document.getElementById('list-previous');

listNextButton.addEventListener('click', function () {
    // let page = parseInt(decodeQueryString('page'));
    getArchiveList(++page);
    history.pushState({}, 'page 1', '/?page=' + page);
});

listPreviousButton.addEventListener('click', function () {
    // page = parseInt(decodeQueryString('page'));
    getArchiveList(--page < 1 ? 0 : page);
    history.back();
});

getArchiveList(page);