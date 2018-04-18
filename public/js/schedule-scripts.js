function test(number) {
    fetchUrl('/schedules/?page=' + number)
        .then((data) => {
            // let testList = document.getElementById('scheduledArchives');
            // while (testList.firstChild) {
            //     testList.removeChild(testList.firstChild);
            // }
            console.log(data);

            // testList.appendChild(createList(data.scheduledlist));
        })
        .catch((err) => {
            console.log(err);
        });
}
test();