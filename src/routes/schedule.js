const checkAuth = require('../auth/checkAuth');
const ScheduleController = require('../controllers/schedulejobsController');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute + '/edit/:id', ScheduleController.getSchedule);

    // Lists all schedules
    app.get(baseRoute + '/', ScheduleController.listSchedule);

    // Edit a specific schedule
    app.post(baseRoute + '/:id', ScheduleController.updateSchedule);

    // Delete a specific schedule
    app.delete(baseRoute + '/:id', ScheduleController.deleteSchedule);
};