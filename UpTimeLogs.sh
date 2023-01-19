#!/bin/bash
node "$(dirname -- "$(readlink -f "${BASH_SOURCE}")")/"index.js $@