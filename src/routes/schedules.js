const checkAuth = require('../auth/checkAuth');
const ScheduleController = require('../controllers/schedulejobsController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute + '/edit/:id', isLoggedIn, ScheduleController.getSchedule);

    // Lists all schedules
    app.get(baseRoute + '/', isLoggedIn, ScheduleController.listSchedule);

    // Edit a specific schedule
    app.post(baseRoute + '/:id', isLoggedIn, ScheduleController.updateSchedule);

    // Delete a specific schedule
    app.get(baseRoute + '/delete/:id', isLoggedIn, ScheduleController.deleteSchedule);

    // Update a specific schedule 
    app.post(baseRoute + '/edit/:id', isLoggedIn, ScheduleController.updateSchedule);
    app.post(baseRoute + '/:id', isLoggedIn, ScheduleController.listSchedule);
};
