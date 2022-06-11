import { Express } from "express";
import { Message, Publisher, Subscriber } from "../../broker";
import { Comp } from "../../core";
import { Config } from "../../config";
import { getName } from "./helpers";
import { greet, greetEveryone } from "./services";

export class Component implements Comp {
    private config: Config;
    private router: Express;
    private publisher: Publisher;
    private subscriber: Subscriber;
    private names: string[];

    constructor(config: Config, router: Express, publisher: Publisher, subscriber: Subscriber) {
        this.names = [];
        this.config = config;
        this.router = router;
        this.publisher = publisher;
        this.subscriber = subscriber;
    }

    setup() {

        // Use the same HTTP Handler for multiple URLS
        this.router.get("/hello", this.handleHTTPHello.bind(this));
        this.router.get("/hello/:name", this.handleHTTPHello.bind(this));
        this.router.post("/hello", this.handleHTTPHello.bind(this));

        // Use HTTP Handler that take state from component
        this.router.get("/hello-all", this.handleHTTPHelloAll.bind(this));

        // Trigger Publisher
        this.router.get("/hello-pub", this.handleHTTPHelloPub.bind(this));
        this.router.get("/hello-pub/:name", this.handleHTTPHelloPub.bind(this));
        this.router.post("/hello-pub", this.handleHTTPHelloPub.bind(this));

        // Event
        this.subscriber.registerHandler("dashboard.helloEvent", this.handleEventHello.bind(this));

    }

    async handleHTTPHello(req: any, res: any) {
        const name = getName(req);
        res.send(greet(name));
    }

    async handleHTTPHelloAll(req: any, res: any) {
        res.send(greetEveryone(this.names));
    }

    async handleHTTPHelloPub(req: any, res: any) {
        const name = getName(req);
        try {
            await this.publisher.publish("dashboard.helloEvent", { name });
            res.send("Message sent");
        } catch (err) {
            res.status(500).send(err);
        }
    }

    async handleEventHello(msg: Message) {
        const { name } = msg;
        this.names.push(name);
    }

}