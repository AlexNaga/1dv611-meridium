/**
 * 
 * @param {number} status HTTP Status code
 * @param {string} message Message to be displayed on the website
 */
module.exports = (status, message) => {
    let error = new Error(message);
    error.status = status;
    throw error;
};