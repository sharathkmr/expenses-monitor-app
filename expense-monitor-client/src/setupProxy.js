const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api/getExpenses', createProxyMiddleware({ target: 'http://localhost:3001/' }));
    app.use('/api/saveExpenseWithSort', createProxyMiddleware({ target: 'http://localhost:3001/' }));
};