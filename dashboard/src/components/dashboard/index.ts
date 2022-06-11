import { Express } from "express";
import { Comp } from "../../core";
import { Config } from "../../config";
import { DashboardService } from "../../services/dashboard.service";

const feederCount = 1;
export class Component implements Comp {

    private _service: DashboardService;
    constructor(private config: Config, private router: Express) {
        this._service = new DashboardService();
    }

    setup() {

        this.router.get("/", async (_, res) => {

            const data = await this._service.getWorkerStatisticAsync();
            res.render("dashboard", data);
        });

        this.router.post("/api/dashboard/increase-worker", async (req, res) => {
            const workerName = req.body.name;
            try {
                const result = await this._service.increaseWorkerAsync(workerName);
                res.send({ success: result });
            }
            catch{
                res.send({ success: false });
            }
        });
    }

}