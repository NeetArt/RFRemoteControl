#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const rcSwitch = require('rcswitch-gpiomem');
const rfCodes = require('./switchConfig.json');
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();

rcSwitch.enableTransmit(17);
rcSwitch.setPulseLength(190);
rcSwitch.setRepeatTransmit(15);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Winston logger
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
}));

app.get('/', (req, res) => {
    res.render('index', {
        switches: rfCodes
    });
});

const postCallValidationCheck = [
    check('id', 'value must be between 0 and ' + (rfCodes.length - 1).toString())
        .isInt({ min: 0, max: rfCodes.length - 1 }),
    check('operation', 'Operation must be either on or off')
        .isIn(['on', 'off'])
]

app.post('/switches/:operation/:id', postCallValidationCheck, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    const switchEntry = rfCodes[req.params.id];

    console.log('Running operation "' + req.params.operation + '": ' + switchEntry[req.params.operation]);
    rcSwitch.send(switchEntry[req.params.operation], 24);
    res.send('Success!');

    // Simulate operation
    // setTimeout(() => {
    //     console.log('Running operation "' + req.params.operation + '": ' + switchEntry[req.params.operation]);
    //     res.send('Success!');
    // }, 2000);
});

app.get('*', function (req, res) {
    res.status(404).send('Endpoint not found');
});

// Express route to handle errors
// app.use(function (err, req, res, next) {
//     if (req.xhr) {
//         res.status(500).send('Oops, Something went wrong!');
//     } else {
//         next(err);
//     }
// });

app.listen(8089, () => {
    console.log("Starting server on port 8089");
});