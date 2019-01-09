#!/usr/bin/env node
'use strict'


const pg = require('pg');
const connectionString = process.env.DATABASE_URL;

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
    'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
query.on('end', () => { client.end(); });

/*
const { Client } = require('pg');
const pg_client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});
pg_client.connect();

pg_client.query('CREATE TABLE instancelog(activationId character varying(20) NOT NULL,name character varying(20) NOT NULL,orchestrationId character varying(20) NOT NULL,instanceKey character varying(20) NOT NULL,createdTime timestamp NOT NULL,timestamp bigint NOT NULL,log json NOT NULL, primary key(activationId, timestamp))', (err, res) => {
    if (err) {
        pg_client.end();
        return console.error('error with PostgreSQL database', err);
    }
});

pg_client.end();
    */