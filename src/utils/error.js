/**
 * 
 * @param {Number} status HTTP Status code
 * @param {String} message Message to be displayed on the website
 */
module.exports = (status, message) => {
    let error = new Error(message);
    error.status = status;
    throw error;
};