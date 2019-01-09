#!/usr/bin/env node
'use strict'
const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);

client.connect();
client.query('CREATE TABLE instancelog(activationId character varying(20) NOT NULL,name character varying(20) NOT NULL,orchestrationId character varying(20) NOT NULL,instanceKey character varying(20) NOT NULL,createdTime timestamp NOT NULL,timestamp bigint NOT NULL,log json NOT NULL, primary key(activationId, timestamp))', (err, res) => {
    if (err) {
        client.end();
        return console.error('error with PostgreSQL database', err);
    }
});

client.end();