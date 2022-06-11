#!/bin/sh

set -e

NOW=$(date +"%Y%m%d")

cd $SERVICE_NAME

echo "Building services"
echo "================================================================"
# We also track build from hash commit, if we have something when wrong
# from latest build we can rollback immediately using previous build.
docker build \
  -t ${CI_REGISTRY_IMAGE}/${SERVICE_NAME}:${NOW}.${CI_COMMIT_SHA:0:8} \
  -t ${CI_REGISTRY_IMAGE}/${SERVICE_NAME}:${TAG} .

echo "Push into registry"
echo "================================================================"
docker login -u $CI_REGISTRY_USER -p $CI_JOB_TOKEN $CI_REGISTRY
docker push ${CI_REGISTRY_IMAGE}/${SERVICE_NAME}

docker logout $CI_REGISTRY
