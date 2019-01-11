#!/usr/bin/env node
'use strict'

const api_version = process.env.API_VERSION;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const security_token = process.env.SECURITY_TOKEN;
const login_url = process.env.LOGIN_URL;
const instance_key = process.env.INSTANCE_KEY;
const orchestration_id = process.env.ORCHESTRATION_ID;
const timezone = process.env.TIMEZONE;

const jsforce = require('jsforce');
const conn = new jsforce.Connection({
    version : api_version,
    loginUrl : login_url
});

//const moment = require('moment');
const moment = require('moment-timezone');
moment().format();

const { Client } = require('pg');
const pg_client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
pg_client.connect();


function save_instance_log(url, callback) {
    conn.requestGet(url, function (err, res) {
        if(err) { return console.log(err); }

        if(res.log.length == 0) {
            callback();
        } else {
            let log = res.log;
            console.log(log.length + ' logs retreived');

            for(let i = 0; i < log.length; i++) {
                let activationId = log[i].activationId;
                let name = log[i].name;
                let orchestrationId = log[i].orchestrationId;
                let timestamp = log[i].timestamp;
                let createdTimeLocal = moment(timestamp / 1000000).tz(timezone).format();
                let createdTimeUTC = moment(timestamp / 1000000).format();

                let instanceKey = log[i].instanceKey;

                pg_client.query(
                    'INSERT into instancelog (activationId, name, orchestrationId, createdTimeLocal, createdTimeUTC, instanceKey, log, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7)',
                    [activationId, name, orchestrationId, createdTimeLocal, createdTimeUTC, instanceKey, log[i], timestamp],
                    function(err, result) {
                        if (err) {
                            if(err.constraint != 'instancelog_pkey')
                                console.log(err);
                        }
                    });
            }
            save_instance_log(res.nextPageUrl, callback);
        }
    });
}

console.log('... job start');
conn.login(username, password + security_token, function(err, userInfo) {
    if (err) {
        console.log('Salesforce login failure');
        return console.error(err);
    }

    let today     = moment(new Date());
    let yesterday = moment(new Date()).add(-1, 'days');

    let url = '/services/data/v' + api_version + '/iot/orchestrations/' + orchestration_id + '/instances/' + instance_key + '/log?toDate=' + today.toDate().toJSON() + '&fromDate=' + yesterday.toDate().toJSON();

    console.log('request url: ' + url);

    save_instance_log(url, function () {
        console.log('... job done');
    });
});
