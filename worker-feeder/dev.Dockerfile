# Dockerfile
FROM node:lts as build-img

# Set environment variables
ENV APPDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Set the work directory
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

ADD . ${APPDIR}

RUN npm install && npm run build

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

# Multistage build
FROM node:lts-alpine

ENV APPDIR /app

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN mkdir -p ${APPDIR}
RUN chown -R node:node ${APPDIR}
WORKDIR ${APPDIR}

# Copy source code


RUN npm install --production

# Delete unused files
RUN rm -rf package-lock.json && \
  rm -rf src && \
  rm -rf interfaces && \
  rm -rf .env-template && \
  find . -name "*.d.ts" -type f -delete

EXPOSE 8080

CMD ["node", "dist/index.js"]
