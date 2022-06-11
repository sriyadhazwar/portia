import { Express } from "express";
import { Comp } from "../../core";
import { Config } from "../../config";
import { DriverService } from "../../services/driver.service";

export class Component implements Comp {

    private config: Config;
    private router: Express;
    private _service: DriverService;

    constructor(config: Config, router: Express
    ) {
        this.config = config;
        this.router = router;
        this._service = new DriverService();
    }

    setup() {

        //REGION RENDER
        this.router.get("/driver", async (_, res) => {
            res.render("drivers/list", {
                driverActive: "active"
            });
        });

        this.router.get("/driver/update", async (_, res) => {
            res.render("drivers/update", {
                driverActive: "active"
            });
        });

        this.router.get("/driver/create", async (_, res) => {
            res.render("drivers/create", {
                driverActive: "active"
            });
        });

        //REGION API
        this.router.get("/api/driver", async (req, res) => {
            const _id = req.params._id;

            res.send(await this._service.getDriverAsync());

        });

        this.router.get("/api/driver/:_id", async (req, res) => {
            const _id = req.params._id;
            const data = await this._service.getDriverByIdAsync(_id);
            res.send(data);

        });

        this.router.post("/api/driver", async (req, res) => {
            const body = req.body;
            console.log(body);
            res.send(await this._service.createDriverAsync(body));
        });

        this.router.put("/api/driver/:_id", async (req, res) => {
            const _id = req.params._id;
            const body = req.body;
            res.send(await this._service.updateDriverAsync(_id, body));
        });

        this.router.delete("/api/driver/:_id", async (req, res) => {
            const _id = req.params._id;
            res.send(await this._service.deleteDriverAsync(_id));
        });

        this.router.post("/api/driver/check-json", async (req, res) => {
            const body = req.body;
            try{
                console.log(body);
                const data = JSON.parse(body.definition.product.definition);
                res.send(true);
            }
            catch{
                res.send(false);
            }

        });
    }

}
