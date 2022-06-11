import express from "express";
import { Express } from "express";
import { Comp } from "../../core";
import { Config } from "../../config";
import { Publisher, Subscriber } from "../../broker"
import { JobService } from "../../services/job.service";
import { DriverService } from "../../services/driver.service";
import JobEntity from "../../entities/job.entity";

type AlertConfig = { showAlert: boolean, alertClass: string, alertMessage: string };

type ProductAddedPayload = {
    config: {
        job: {
            _id: string,
        },
        driver: {
            _id: string,
        }
    },
    product: {
        url: string
    }
}

type JobAddedPayload = {
    job: {
        _id: string,
    },
    product: {
        _id: string,
        hash_url: string,
        url: string
    }
}

export class Component implements Comp {

    private jobService: JobService;
    private driverService: DriverService;

    constructor(private config: Config, private router: Express, private publisher: Publisher, private subscriber: Subscriber) {
        this.jobService = new JobService();
        this.driverService = new DriverService();
    }

    setup() {

        const getStatusQuery = (req: express.Request): string => {
            const statusQuery = req.query.status || "all";
            if (statusQuery == "all" || statusQuery == "waiting" || statusQuery == "running") {
                return statusQuery;
            }
            return "all";
        }

        const getStatus = (statusQuery: string): string[] => {
            switch (statusQuery) {
                case "waiting": return ["waiting"];
                case "running": return ["running"];
                case "done": return ["done"];
                default:
                    return ["waiting", "running", "done"];
            }
        }

        const showList = async (req: express.Request, res: express.Response<any>, alertConfig: AlertConfig) => {
            const statusQuery = getStatusQuery(req);
            const status = getStatus(statusQuery);
            const page = parseInt(req.query.page || "0");
            const driverMapping = await this.jobService.getDriverMapping();
            const result = await this.jobService.getJobsAsync(page, status);
            const pageArray: { index: number, caption: number, active: string }[] = [];
            for (let index = 0; index < result.pageCount; index++) {
                const caption = index + 1;
                const active = index == page ? "active" : "";
                pageArray.push({ index, caption, active });
            }
            res.render("jobs/list", {
                jobActive: "active",
                showAlert: alertConfig.showAlert,
                alertClass: alertConfig.alertClass,
                alertMessage: alertConfig.alertMessage,
                pageCount: result.pageCount,
                jobs: JSON.parse(JSON.stringify(result.jobs)),
                status: statusQuery,
                driverMapping: JSON.parse(JSON.stringify(driverMapping)),
                allFilterClass: statusQuery == "all" ? "btn-primary" : "btn-outline-primary",
                waitingFilterClass: statusQuery == "waiting" ? "btn-primary" : "btn-outline-primary",
                runningFilterClass: statusQuery == "running" ? "btn-primary" : "btn-outline-primary",
                page, pageArray,
            });
        }

        const showForm = async (req: Express.Request, res: express.Response<any>) => {
            const driverMapping = await this.jobService.getDriverMapping();
            const jsonURLMapping = JSON.stringify(driverMapping.url);
            res.render("jobs/create", {
                jsonURLMapping,
                jobActive: "active",
                driverMapping: JSON.parse(JSON.stringify(driverMapping)),
            });
        }

        const createNewJob = async (name: string, driverId: string, url: string) => {
            if (!name) {
                throw (new Error(`Invalid job's name: "${name}"`))
            }
            const driverMapping = await this.jobService.getDriverMapping();
            if (!(driverId in driverMapping.name)) {
                throw (new Error(`Invalid job's driver id: "${driverId}"`))
            }
            const job = await this.jobService.createJobAsync(new JobEntity({ name, url, driver_id: driverId }));
            const driver = await this.driverService.getDriverByIdAsync(driverId);
            await this.publisher.publish(this.config.rmqJobStartQueue, {
                config: {
                    job,
                    driver,
                }
            });
        }

        this.subscriber.registerHandler("productAdded", async (msg) => {
            try {
                const payload: ProductAddedPayload = msg as ProductAddedPayload;
                const jobId = payload.config.job._id;
                const job = await this.jobService.getJobByIdAsync(jobId);
                job.total_product++;
                await this.jobService.updateJobAsync(jobId, job);
            } catch (error) {
                console.error(error);
            }
        });

        this.subscriber.registerHandler("jobAdded", async (msg) => {
            try {
                const payload: JobAddedPayload = msg as JobAddedPayload;
                const jobId = payload.job._id;
                const job = await this.jobService.getJobByIdAsync(jobId);
                job.total_processed++;
                await this.jobService.updateJobAsync(jobId, job);
            } catch (error) {
                console.error(error);
            }
        });

        this.router.get("/job", async (req, res) => {
            await showList(req, res, { showAlert: false, alertClass: "", alertMessage: "" });
        });

        this.router.post("/job", async (req, res) => {
            const { name, driver_id, url } = req.body;
            try {
                await createNewJob(name, driver_id, url);
                await showList(req, res, { showAlert: true, alertClass: "alert-success", alertMessage: "Job added" });
            } catch (error) {
                await showList(req, res, { showAlert: true, alertClass: "alert-danger", alertMessage: `Failed to add job, ${error}` });
                console.error(error);
            }
        });

        this.router.get("/new-job", async (req, res) => {
            await showForm(req, res);
        });


    }

}