const httrackWrapper = require('./src/models/httrackWrapper');
const EmailModel = require('./src/models/emailModel');
const Schedules = require('./src/models/schedules');
const Archive = require('./src/models/archive');
const nodeSchedule = require('node-schedule');
const Schedule = require('./src/models/enums').schedule;

exports.nodeSchedule = nodeSchedule.scheduleJob('00 00 03 * * *', () => {
    Schedules.find({ isPaused: false }).exec()
        .then((schedules) => {
            let everyDay = schedules.filter(s => s.typeOfSchedule === Schedule.DAILY);
            let everyWeek = schedules.filter(s => s.typeOfSchedule === Schedule.WEEKLY);
            let everyMonth = schedules.filter(s => s.typeOfSchedule === Schedule.MONTHLY);

            let shouldBeArchived = everyDay;

            let today = new Date().getDay();
            // Run weekly schedules on mondays
            if (today === 1) {
                shouldBeArchived.push(...everyWeek);

                let d = new Date();
                let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                // Run monthly schedules on the last week of the months
                if (weekNo % 4 === 0) {
                    shouldBeArchived.push(...everyMonth);
                }
            }

            for (let i = 0; i < shouldBeArchived.length; i++) {
                httrackWrapper.archive(shouldBeArchived[i], (err, response) => {
                    if (err) {
                        let emailSettings = {
                            email: response.email,
                            subject: 'Din schemalagda arkivering kunde inte slutföras!',
                            message: `<p><b>Din schemalagda arkivering av
                          <a href="${response.url}">${response.url}</a> kunde inte slutföras.</b></p>`
                        };

                        EmailModel.sendMail(emailSettings);
                        return console.log(err);
                    }

                    console.log(`Archive ${response.zipFile} was successful!`);

                    let archive = new Archive({
                        fileName: response.zipFile,
                        ownerId: response.ownerId,
                        fileSize: response.fileSize,
                        fromSchedule: shouldBeArchived[i]._id
                    });
                    archive.save();

                    let downloadUrl = process.env.SERVER_DOMAIN + `/${process.env.ARCHIVES_FOLDER}/` + response.zipFile;
                    let emailSettings = {
                        email: response.email,
                        subject: 'Din schemalagda arkivering är klar ✔',
                        message: `<p><b>Din schemalagda arkivering av
                      <a href="${response.url}">${response.url}</a> är klar!</b></p>
                      <p><a href="${downloadUrl}">Ladda ned som .zip</a></p>`
                    };

                    if (shouldBeArchived[i].shouldNotify) {
                        EmailModel.sendMail(emailSettings);
                    }
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});