#!/usr/bin/env node
'use strict'


var jsforce = require('jsforce');
var conn = new jsforce.Connection({
    version : '43.0'
    //loginUrl : sfdc_login_url
});

console.log('......... Start job .........');

function get_instance_log(url, callback) {
    conn.requestGet(url, function (err, res) {
        if(err) { return console.log(err); }


        console.log('called ');
        var count = res.log.length;

        if(count == 0) {
            callback();
        } else {
            var log = res.log;

            for(var i = 0; i < log.length; i++) {
                //console.log(log[i]);
                var activationId = log[i].activationId;
                var name = log[i].name;
                var orchestrationId = log[i].orchestrationId;
                var timestamp = log[i].timestamp;
                var instanceKey = log[i].instanceKey;


            }
            get_instance_log(res.nextPageUrl, callback);
        }





    });
}

conn.login('20121210@demo.com', 'abcd1234', function(err, userInfo) {
    if (err) {
        console.log('Salesforce login failure');
        return console.error(err);
    }

     get_instance_log('/services/data/v44.0/iot/orchestrations/0FF10000000k9jHGAQ/instances/1/log', function () {
    //get_instance_log('/services/data/v44.0/iot/orchestrations/0FF10000000k9jHGAQ/instances/1/log?page=eyJmcm9tRGF0ZSI6bnVsbCwidG9EYXRlIjpudWxsLCJhcGV4TG9nSWQiOiIwN0wxMDAwMDAzUE9wS0hFQTEiLCJhcGV4TG9nU3RhcnRUaW1lIjoxNTQ2ODIzNTgxMDAwLCJhcGV4TG9nTGluZU51bWJlciI6MCwicGFnZVNpemUiOjIwMCwic29ydERpcmVjdGlvbiI6IkRlc2NlbmRpbmciLCJsYXN0IjpmYWxzZSwiaW5jbHVzaXZlIjpmYWxzZX0%3D', function () {
        console.log('done');
    });
});
