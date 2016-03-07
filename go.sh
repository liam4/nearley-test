#!/bin/bash

printf 'compile...'

# meh this code is bad
# it assumes you already have nearley globally installed
#nearleyc grammar.ne -o grammar.js
node_modules/nearley/bin/nearleyc.js grammar.ne -o grammar.js # 9001 TIMES BETTER!!!1!
# oops went over the 80 character limit ^D^

echo 'done'

# lol some of this is unnecessary
#printf 'run script...'
node index.js
#echo 'done'
