'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const expressQSParser = require('express-qs-parser');
const routes = require('./routes');

const app = express();


// parse body params and attache them to req.body
app.use(expressQSParser({}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// mount all routes on /api path
app.use('/', routes);


const port = 5123;
app.listen(port, () => {
    console.log(`${new Date()} server started on port ${port}`);
});



process.on('uncaughtException', function (err) {
    console.log('uncaughtException');
    console.log(err);
})

module.exports = app;