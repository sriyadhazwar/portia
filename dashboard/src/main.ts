require('dotenv').config();
import mongoose from "mongoose";
import amqplib from "amqplib";
import express from "express";
import exphbs from 'express-handlebars';
import { Config } from "./config";
import { MainApp, createRouter } from "./core";
import { RmqPublisher, RmqSubscriber } from "./broker";

import * as dashboard from "./components/dashboard";
import * as driver from "./components/driver";
import * as setting from "./components/setting";
import * as job from "./components/job";
import * as monitoring from "./components/monitoring";
import * as example from "./components/example";
import { DriverService } from "./services/driver.service";

async function main() {

    // app component definitions
    const logger = console;

    const config = new Config();
    logger.log("CONFIG:", JSON.stringify(config));

    const router = createRouter(logger);
    router.use(express.static(__dirname + "/../public"));
    router.engine("handlebars", exphbs());
    router.set("view engine", "handlebars");
    router.set("views", __dirname + "/../views");

    const defaultRmqConnection = await amqplib.connect(config.rmqConnectionString);
    const subscriber = new RmqSubscriber(logger, defaultRmqConnection, {
        "productAdded": {
            queue: config.rmqProductAddedQueue,
            exchange: config.rmqProductAddedExchange,
        },
        "jobAdded": {
            queue: config.rmqProcessedAddedQueue,
            exchange: config.rmqProcessedAddedExchange,
        },
    });
    const publisher = new RmqPublisher(logger, defaultRmqConnection);

    await mongoose.connect(config.mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    // app creation
    const app = new MainApp(
        logger,
        router,
        subscriber,
        config.httpPort,
    );

    // app setup
    app.setup([
        new dashboard.Component(config, router), // setup dashboard
        new driver.Component(config, router), // setup driver
        new setting.Component(config, router), // setup setting
        new job.Component(config, router, publisher, subscriber), // setup job
        new monitoring.Component(config, app, router), // setup monitoring
        // new example.Component(config, router, publisher, subscriber), // setup example
    ]);

    // app execution
    app.run();

}

if (require.main === module) {
    main().catch((err) => {
        console.error(err);
    });
}