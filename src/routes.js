'use strict'
const P = require('bluebird');
const request = require('request');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();


router.post('/', function(req, res, next){
    try{
        console.log("Job received: ", req.body);
        let languages = req.body.targetLanguages;
        let jwtAudience = req.body.jwtAudience;
        let jobId = req.body.jobName;
        let pushURL = req.body.pushURL;
        let strings = req.body.strings;

        for(let language of languages){
            let translation = translate(jobId, language, strings);
            sendTranslation(translation, pushURL, jwtAudience);
        }
        console.log(`Job ${jobId} accepted\n`);
        res.status(200).send({
                id: jobId,
                responseMessage: "Request received and accepted."
            });
    } catch(error){
        console.log("Error processing job:", error.stack.toString());
        res.status(400).send({
                    responseMessage: "Invalid arguments",
                    error: error
                });
    }
});


function translate(jobId, language, strings){
    let translation = {
        id: jobId,
        language: language,
        translations : []
    };

    for(let str of strings){
        let tr = {
            key: str.key,
            translation: 'X' + str.value.substring(1)
        };

        translation.translations.push(tr);
    }

    return translation;
}


function sendTranslation(translation, pushUrl, audience) {
    P.delay(10000).then(() => {
        let reqDefaults = {
            baseUrl: pushUrl,
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if(audience){
            let token = jwt.sign({ aud: audience }, "secreto");
            reqDefaults.headers['Authorization'] = 'Bearer ' + token;
        }

        let req = request.defaults(reqDefaults);

        console.log("Sending translation...", translation);
        console.log("");
        req.post('/', {body: translation}, 
            function (err, res, body) {
                console.log("Response: ", body);
                if(err){
                    console.log(`Error sending translation ${translation.id}`,err);
                } else {
                    console.log(`Translation ${translation.id} sent to push URL!`);
                }
                console.log("");
            });
    });
    
}

module.exports = router;