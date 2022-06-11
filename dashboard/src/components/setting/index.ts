import express from "express";
import { Express } from "express";
import { Comp } from "../../core";
import { Config } from "../../config";
import { ConfigService } from "../../services/config.service";

type AlertConfig = { showAlert: boolean, alertClass: string, alertMessage: string };

export class Component implements Comp {
    private configService: ConfigService;
    constructor(private config: Config, private router: Express) {
        this.configService = new ConfigService();
    }

    setup() {

        const showForm = async (req: express.Request, res: express.Response<any>, alertConfig: AlertConfig) => {
            const configEntity = await this.configService.getConfigAsync();
            res.render("setting", {
                settingActive: "active",
                feeder: configEntity.feeder,
                fetcher: configEntity.fetcher,
                extractor: configEntity.extractor,
                showAlert: alertConfig.showAlert,
                alertClass: alertConfig.alertClass,
                alertMessage: alertConfig.alertMessage,
            });
        }

        const saveSetting = async (feeder: number, fetcher: number, extractor: number) => {
            if (feeder < 0) {
                throw (new Error(`Invalid feeder's max job per worker value: "${feeder}"`));
            }
            if (fetcher < 0) {
                throw (new Error(`Invalid fetcher's max job per worker value: "${fetcher}"`));
            }
            if (extractor < 0) {
                throw (new Error(`Invalid extractor's max job per worker value: "${extractor}"`));
            }
            const configEntity = await this.configService.getConfigAsync();
            configEntity.feeder = feeder;
            configEntity.fetcher = fetcher;
            configEntity.extractor = extractor;
            await this.configService.updateConfigAsync(configEntity._id, configEntity)
        }

        this.router.get("/setting", async (req, res) => {
            await showForm(req, res, { showAlert: false, alertClass: "", alertMessage: "" });
        });

        this.router.post("/setting", async (req, res) => {
            const { feeder, fetcher, extractor } = req.body;
            try {
                await saveSetting(feeder, fetcher, extractor);
                await showForm(req, res, { showAlert: true, alertClass: "alert-success", alertMessage: "Setting has been updated" });
            } catch (error) {
                await showForm(req, res, { showAlert: true, alertClass: "alert-danger", alertMessage: `Failed to update the setting, ${error}` });
                console.error(error);
            }
        });


    }

}
