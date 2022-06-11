#!/usr/bin/env bash

set -e
set -x

CURRENT_BRANCH="master"

function split()
{
    SHA1=`git subtree split --prefix=$1`
    git push $2 "$SHA1:refs/heads/$CURRENT_BRANCH" -f
}

function remote()
{
    git remote add $1 $2 || true
}

# git pull origin $CURRENT_BRANCH

remote feeder-manager git@gitlab.com:labtek/telunjuk/feeder-manager.git
remote feeder-worker git@gitlab.com:labtek/telunjuk/feeder-worker.git
remote fetcher-manager git@gitlab.com:labtek/telunjuk/fetcher-manager.git
remote fetcher-worker git@gitlab.com:labtek/telunjuk/fetcher-worker.git
remote extractor-manager git@gitlab.com:labtek/telunjuk/extractor-manager.git
remote extractor-worker git@gitlab.com:labtek/telunjuk/extractor-worker.git

split 'services/feeder/manager' feeder-manager
split 'services/feeder/worker' feeder-worker
split 'services/fetcher/manager' fetcher-manager
split 'services/fetcher/worker' fetcher-worker
split 'services/extractor/manager' extractor-manager
split 'services/extractor/worker' extractor-worker
