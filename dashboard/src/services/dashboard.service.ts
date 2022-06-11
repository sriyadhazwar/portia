import { HttpRequestService } from "../shared/http/http-request.service";
import { Config } from "../config";

const config = new Config();
const baseUrl = config.managerBaseUrl;

export class DashboardService {

    constructor() {

    }

    async getWorkerStatisticAsync() {
        const url = `${baseUrl}/api/stats`;
        const httpService = new HttpRequestService(url);
        console.log(url);
        let response: any = {};
        try {
            response = await httpService
                .get(url, {})
                .then((resp: any) => {
                    return resp;
                });
            if (response.error) return this.convertResponseToData(this.errorResponse())
            return this.convertResponseToData(response);
        }
        catch (err) {
            //console.log(err);
            response = this.errorResponse();
            return this.convertResponseToData(this.errorResponse())
        }
    }

    async increaseWorkerAsync(name: string) {
        const url = `${baseUrl}/api/increase-worker`;
        const httpService = new HttpRequestService(url);
        const data = { worker: name }
        try {
            const response = await httpService
                .post(url, data, {})
                .then((resp: any) => {
                    return resp;
                });

            console.log(response);
            if (response) { return true; }

            return false;
        }
        catch{
            return false;
        }
    }

    //HELPER
    private convertResponseToData(response: any) {

        const feederObj = (response.data as any[]).filter(x => x.worker == "feeder")[0];
        const fetcherObj = (response.data as any[]).filter(x => x.worker == "fetcher")[0];
        const extractorObj = (response.data as any[]).filter(x => x.worker == "extractor")[0];

        const result = {
            workerCount: { feeder: feederObj.count, fetcher: fetcherObj.count, extractor: extractorObj.count },
            messageCount: { feeder: feederObj.message, fetcher: fetcherObj.message, extractor: extractorObj.message }
        }

        return result;
    }

    private errorResponse() {
        const data = {
            "error": true,
            "data": [
                {
                    "worker": "feeder",
                    "message": "error",
                    "count": 0
                },
                {
                    "worker": "fetcher",
                    "message": "error",
                    "count": 0
                },
                {
                    "worker": "extractor",
                    "message": "error",
                    "count": 0
                }
            ]
        };
        return data;
    }

    private exampleResultConvert() {
        const data = {
            workerCount: { feeder: 1, fetcher: 15, extractor: 14 },
            messageCount: { feeder: 1, fetcher: 15, extractor: 14 }
        }
    }

}