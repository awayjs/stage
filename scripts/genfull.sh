#!/usr/bin/env bash

body='{
"request": {
  "message": "Regen awayjs-full from module update",
  "branch": "master"
}}'

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token $TRAVIS_API_TOKEN" \
  -d "$body" \
  https://api.travis-ci.org/repo/awayjs%2Fawayjs-full/requests