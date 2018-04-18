const checkAuth = require('../auth/checkAuth');
const ScheduleController = require('../controllers/schedulejobsController');

module.exports = (app, baseRoute) => {

    // Lists all schedules
    app.get(baseRoute + '/', ScheduleController.listSchedule);

    // Edit a specific schedule
    app.post(baseRoute + '/:id', ScheduleController.updateSchedule);

    // Delete a specific schedule
    app.get(baseRoute + '/:id', ScheduleController.deleteSchedule);

};