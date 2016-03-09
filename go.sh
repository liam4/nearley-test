#!/bin/bash

printf 'compile...'
node_modules/nearley/bin/nearleyc.js grammar.ne -o grammar.js
echo 'done'

node index.js
