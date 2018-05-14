const ScheduleController = require('../controllers/scheduleController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
  
    // Toggle pause on a specific schedule
    app.post(baseRoute + '/pause/:id', isLoggedIn, ScheduleController.pauseSchedule);

    // Archive now
    app.post(baseRoute + '/run/:id', isLoggedIn, ScheduleController.runSchedule);
    
    // Delete a specific schedule
    app.delete(baseRoute + '/delete/:id', isLoggedIn, ScheduleController.deleteSchedule);
};