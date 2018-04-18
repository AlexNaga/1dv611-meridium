function getScheduledArchives() {
    fetchUrl('/')
        .then((data) => {
            let scheduledList = document.getElementById('');

            console.log(data)

            while (scheduledList.firstChild) {
                scheduledList.removeChild(scheduledList.firstChild);
            }

            scheduledList.appendChild(createList(data.archives));
            addConfirmDeletion(); // Add event listener for the confirmation message
        })
        .catch((err) => {
            console.log(err);
        });
}