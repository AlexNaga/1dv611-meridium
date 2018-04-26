const ScheduleController = require('../controllers/schedulejobsController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Lists all schedules
    app.get(baseRoute + '/', isLoggedIn, ScheduleController.listSchedule);

    // Get a specific schedule
    app.get(baseRoute + '/edit/:id', isLoggedIn, ScheduleController.getSchedule);

    // Update a specific schedule
    app.post(baseRoute + '/edit/:id', isLoggedIn, ScheduleController.updateSchedule);

    // Delete a specific schedule
    app.delete(baseRoute + '/delete/:id', isLoggedIn, ScheduleController.deleteSchedule);
};
