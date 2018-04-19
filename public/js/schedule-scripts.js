function listArchivedList() {
    fetchUrl('/schedules/?page=' + 0)
        .then((data) => {
            let archivedList = document.getElementById('scheduledArchives');
            while (archivedList.firstChild) {
                archivedList.removeChild(archivedList.firstChild);
            }
            archivedList.appendChild(createList(data.scheduledlist));
        })
        .catch((err) => {
            console.log(err);
        });
}
listArchivedList();