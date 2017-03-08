'use strict'
const P = require('bluebird');
const request = require('request');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const DELAY = 10000;

const langMappings = {
    en_gb: "en-GB",
    es_ar: "es-AR",
    de_de: "de",
    fr_fr: "fr",
    nl_nl: "nl",
    pt_br: "pt-BR",
    it_it: "it",
    es_la: "es-419",
    zh_cn: "zh-Hans",
    cs_cz: "cs",
    da_dk: "da",
    ca_es: "ca",
    es_es: "es-ES",
    el_gr: "el",
    el_el: "el",
    hu_hu: "hu",
    ja_jp: "ja",
    ko_kr: "ko",
    es_mx: "es-MX",
    no_no: "no",
    pl_pl: "pl",
    pt_pt: "pt-PT",
    en_ro: "en-GB",
    ru_ru: "ru",
    en_sa: "en-GB",
    sv_se: "sv",
    en_sk: "en-GB",
    th_th: "th",
    tr_tr: "tr",
    zh_tw: "zh-Hans",
    en_us: "en",
    en_xa: "en_XA"
};

router.post('/', function(req, res, next){
    try{
        console.log("Job received: ", req.body);
        let languages = req.body.targetLanguages;
        let jwtAudience = req.body.jwtAudience;
        let jobId = req.body.jobName;
        let pushURL = req.body.pushURL;
        let strings = req.body.strings;

        for(let language of languages){
            let respLanguage = langMappings[language];
            if(!respLanguage){
                respLanguage = language;
            }
            let translation = translate(jobId, respLanguage, strings);
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
            key: str.key
        };
        
        if(str.value.length > 0){
            if(str.value[0] != '<'){
                tr.translation = 'X' + str.value.substring(1);
            } else{
                let i = str.value.indexOf('>');
                if(i < (str.value.length - 1)){
                    tr.translation = str.value.substr(0, i + 1) + 'X' + str.value.substr(i + 2);
                } else{
                    tr.translation = str.value;
                }
            }
        }
        else{
            tr.translation = str.value;
        }
            

        translation.translations.push(tr);
    }

    return translation;
}


function sendTranslation(translation, pushUrl, audience) {
    P.delay(DELAY).then(() => {
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