module.exports = function(req) {
    return req.method === 'GET' ? req.query : req.body;
}