
/**
 * Password rules validator https://github.com/mapbox/password-rules
 *
 * Translated into Swedish.
 * @param {String} pw
 * @param {String} confirm
 * @param {*} rules 
 */
module.exports = function (pw, confirmPw, rules) {
    var issues = [];
    rules = rules || {};
    // If rules is undefined, the confirm variable (might) have the rules
    // i.e did not received a password to confirm.
    if (rules === undefined) {
        rules = confirmPw;
    } else {
        if (pw !== confirmPw) {
            issues.push({
                reason: 'matchingPassword',
                message: 'Lösenorden måste stämma överens',
                part: 'stämma överens'
            });
        }
    }
    def(rules, 'minimumLength', 8);
    def(rules, 'maximumLength', Infinity);
    def(rules, 'requireCapital', true);
    def(rules, 'requireLower', true);
    def(rules, 'requireNumber', true);
    def(rules, 'requireSpecial', false);

    if (pw.length < rules.minimumLength) {
        issues.push({
            reason: 'minimumLength',
            message: 'Lösenordet måste vara minst ' + rules.minimumLength + ' tecken långt',
            part: 'vara minst ' + rules.minimumLength + ' tecken långt'
        });
    }
    if (pw.length > rules.maximumLength) {
        issues.push({
            reason: 'maximumLength',
            message: 'Lösenordet måste vara mindre än ' + rules.maximumLength + ' tecken långt',
            part: 'vara mindre än ' + rules.maximumLength + ' tecken långt'
        });
    }
    if (rules.requireCapital && !pw.match(/[A-Z]/g)) {
        issues.push({
            reason: 'requireCapital',
            message: 'Lösenordet måste innehålla en stor bokstav',
            part: 'innehålla en stor bokstav'
        });
    }
    if (rules.requireLower && !pw.match(/[a-z]/g)) {
        issues.push({
            reason: 'requireLower',
            message: 'Lösenordet måste innehålla en liten bokstav',
            part: 'innehålla en liten bokstav'
        });
    }
    if (rules.requireNumber && !pw.match(/\d/g)) {
        issues.push({
            reason: 'requireNumber',
            message: 'Lösenordet måste innehålla en siffra',
            part: 'innehålla en siffra'
        });
    }
    if (rules.requireSpecial && !pw.match(/\W+/g)) {
        issues.push({
            reason: 'requireSpecial',
            message: 'Lösenordet måste innehålla ett specialtecken',
            part: 'innehålla ett specialtecken'
        });
    }

    return issues.length ? {
        sentence: sentence(issues),
        issues: issues
    } : false;

    function sentence(reasons) {
        var start = 'Lösenordet måste ';
        if (reasons.length === 1) {
            return start + reasons[0].part + '.';
        }
        if (reasons.length === 2) {
            return start + reasons[0].part + ' och ' + reasons[1].part + '.';
        }
        if (reasons.length > 2) {
            var last = reasons[reasons.length - 1].part;
            return start + reasons.slice(0, -1).map((r) => {
                return r.part;
            }).join(', ') + ', och ' + last + '.';
        }
    }
};

function def(o, option, val) {
    if (o[option] === undefined) o[option] = val;
}
