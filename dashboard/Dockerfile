# Build
FROM node:lts as build-img

# Set environment variables
ENV APPDIR /app

# Set the work directory
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

ADD . ${APPDIR}

RUN npm install && npm run build

# Multistage build
FROM node:lts-alpine

ENV APPDIR /app

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN mkdir -p ${APPDIR}
RUN chown -R node:node ${APPDIR}
WORKDIR ${APPDIR}

# Copy source code
COPY --chown=node:node --from=build-img /app /${APPDIR}

RUN npm ci --only=production

RUN rm -rf package-lock.json && \
    rm -rf src

EXPOSE 3000
CMD npm start
