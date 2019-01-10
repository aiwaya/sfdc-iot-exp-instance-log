#!/usr/bin/env node
'use strict'

var pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);

db.tx(t => {
    return t.batch([
        t.none('CREATE TABLE instancelog(activationId character varying(20) NOT NULL,name character varying(20) NOT NULL,orchestrationId character varying(20) NOT NULL,instanceKey character varying(20) NOT NULL,createdTime_utc timestamp NOT NULL,timestamp bigint NOT NULL,log json NOT NULL, primary key(activationId, timestamp))')
    ]);
})
    .then(data => {
        // success;
    })
    .catch(error => {
        console.log(error);
    });

