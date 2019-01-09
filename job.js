#!/usr/bin/env node
'use strict'

/*
 Postdeploy is run only once after the app has been created
 CREATE TABLE instancelog(activationId character varying(20) NOT NULL,name character varying(20) NOT NULL,orchestrationId character varying(20) NOT NULL,instanceKey character varying(20) NOT NULL,createdTime timestamp NOT NULL,timestamp bigint NOT NULL,log json NOT NULL, primary key(activationId, timestamp));
 */

const api_version = process.env.API_VERSION; //44.0
const username = process.env.USERNAME;
const password = process.env.ASSWORD;
const security_token = process.env.SECURITY_TOKEN;
const login_url = process.env.LOGIN_URL;
const instance_key = process.env.INSTANCE_KEY;
const orchestration_id = process.env.ORCHESTRATION_ID;


var jsforce = require('jsforce');
var conn = new jsforce.Connection({
    version : api_version,
    loginUrl : login_url
});

var moment = require('moment');
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

            for(var i = 0; i < log.length; i++) {
                var activationId = log[i].activationId;
                var name = log[i].name;
                var orchestrationId = log[i].orchestrationId;
                var timestamp = log[i].timestamp;
                var createdTime = moment(timestamp/1000000).format();
                var instanceKey = log[i].instanceKey;

                pg_client.query(
                    'INSERT into instancelog (activationId, name, orchestrationId, createdTime, instanceKey, log, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7)',
                    [activationId, name, orchestrationId, createdTime, instanceKey, log[i], timestamp],
                    function(err, result) {
                        if (err) {console.log(err);}
                    });
            }
            get_instance_log(res.nextPageUrl, callback);
        }
    });
}

conn.login(username, password + security_token, function(err, userInfo) {
    if (err) {
        console.log('Salesforce login failure');
        return console.error(err);
    }

    var now = new Date();
    var ten_mins_ago = new Date(now - (1000 * 60 * 10));
    var query_str = '?fromDate='+ now.toJSON() + '&toDate=' + ten_mins_ago.toJSON();
    var url = '/services/data/v' + api_version + '/iot/orchestrations/' + orchestration_id + '/instances/' + instance_key + '/log';

    save_instance_log(url, function () {
        console.log('done');
    });
});
