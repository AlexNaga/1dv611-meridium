function test() {
    fetchUrl('/schedule/?page=' + 0)
        .then((data) => {
            let testList = document.getElementById('scheduledArchives');
            while (testList.firstChild) {
                testList.removeChild(testList.firstChild);
            }
            testList.appendChild(createList(data.scheduledlist));
        })
        .catch((err) => {
            console.log(err);
        });
}
test();