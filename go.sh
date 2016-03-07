#!/bin/bash

printf 'compile...'
nearleyc grammar.ne -o grammar.js
echo 'done'
printf 'run script...'
node index.js
echo 'done'
