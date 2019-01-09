#!/usr/bin/env node
'use strict'
/*
const api_version = process.env.API_VERSION;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const security_token = process.env.SECURITY_TOKEN;
const login_url = process.env.LOGIN_URL;
const instance_key = process.env.INSTANCE_KEY;
const orchestration_id = process.env.ORCHESTRATION_ID;
*/

const api_version = '44.0'; //44.0
const username = '20121210@demo.com';
const password = 'abcd1234';
const security_token = '';
const login_url = 'https://login.salesforce.com/'
const instance_key = '1';
const orchestration_id = '0FF10000000k9jHGAQ';

const jsforce = require('jsforce');
const conn = new jsforce.Connection({
    version : api_version,
    loginUrl : login_url
});

const moment = require('moment');
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
            var log = res.log;
            console.log(log.length + ' logs retreived');

            for(var i = 0; i < log.length; i++) {
                var activationId = log[i].activationId;
                var name = log[i].name;
                var orchestrationId = log[i].orchestrationId;
                var timestamp = log[i].timestamp;
                var createdTime = moment(timestamp / 1000000).format();
                var instanceKey = log[i].instanceKey;

                pg_client.query(
                    'INSERT into instancelog (activationId, name, orchestrationId, createdTime, instanceKey, log, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7)',
                    [activationId, name, orchestrationId, createdTime, instanceKey, log[i], timestamp],
                    function(err, result) {
                        if (err) {console.log(err);}
                    });
            }
            save_instance_log(res.nextPageUrl, callback);
        }
    });
}

conn.login(username, password + security_token, function(err, userInfo) {
    if (err) {
        console.log('Salesforce login failure');
        return console.error(err);
    }

    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    var url = '/services/data/v' + api_version + '/iot/orchestrations/' + orchestration_id + '/instances/' + instance_key + '/log';
    //var query_str = '?toDate=' + today.toJSON() + '&fromDate=' + yesterday.toJSON();
    var query_str = '';

    save_instance_log(url + query_str, function () {
        console.log('done');
    });
});
