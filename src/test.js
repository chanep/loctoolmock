'use strict'
const jwt = require('jsonwebtoken');
let token = jwt.sign({ aud: 'xxxx' }, "secreto");
console.log("token:", token);