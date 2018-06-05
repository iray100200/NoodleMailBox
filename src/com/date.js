export const since = function () {
    let r = 3600 * 1000 * 24;
    let now = Date.now();
    return function (d) {
        let dt = new Date();
        dt.setTime(now - d * r);
        return dt;
    }
}