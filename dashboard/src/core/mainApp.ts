import { Express } from "express";
import { App, Comp } from "./interfaces";
import { logExpressRoutes } from "./logExpressRoutes";
import { Subscriber } from "../broker";

export class MainApp implements App {

    private _readiness: boolean;
    private _liveness: boolean;
    private _httpPort: number;
    private _router: Express;
    private _subscriber: Subscriber;
    private _logger: Console;


    constructor(logger: Console, router: Express, subscriber: Subscriber, httpPort: number) {
        this._httpPort = httpPort;
        this._readiness = false;
        this._liveness = false;
        this._logger = logger;
        this._router = router;
        this._subscriber = subscriber;
    }

    setup(components: Comp[]) {
        for (const component of components) {
            component.setup();
        }
    }

    run() {
        const pRouter = new Promise((resolve, reject) => {
            this._router.listen(this._httpPort, () => {
                this._logger.info(`Run at port ${this._httpPort}`);
                logExpressRoutes(this._router, this._logger);
                this._liveness = true;
                this._readiness = true;
                resolve();
            }).on("error", (err) => reject(err));
        });
        const promises: Promise<any>[] = [pRouter, this._subscriber.subscribe()];
        Promise.all(promises).catch((err) => {
            this._liveness = false;
            this._readiness = false;
            this._logger.error(err);
        });
    }

    liveness() {
        return this._liveness;
    }

    setLiveness(liveness: boolean) {
        this._liveness = liveness;
    }

    readiness() {
        return this._readiness;
    }

    setReadiness(readiness: boolean) {
        this._readiness = readiness;
    }

}
