let page = parseInt(getQueryString('page')) || 0;

function setupEventHandlers() {
    let list = document.querySelectorAll('#recent-list > ul > li > div');

    for (let i = 0; i < list.length; i++) {
        let elem = list[i];
        previewBtn(elem);
    } 
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
                console.log(data);
                
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