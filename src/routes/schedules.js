const checkAuth = require('../auth/checkAuth');
const ScheduleController = require('../controllers/schedulejobsController');

module.exports = (app, baseRoute) => {

    // Lists all schedules
    app.get(baseRoute + '/', ScheduleController.listSchedule);

    // Edit a specific schedule
    app.post(baseRoute + '/:id', ScheduleController.editSchedule);

    // Delete a specific schedule
    app.delete(baseRoute + '/:id', ScheduleController.deleteSchedule);

};