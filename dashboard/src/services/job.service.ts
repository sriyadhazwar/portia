import JobEntity, { IJobEntity } from "../entities/job.entity";
import DriverEntity, { IDriverEntity } from "../entities/driver.entity";
import { Schema } from "mongoose";

export interface IJobResult {
    pageCount: number,
    pageIndex: number,
    jobs: IJobEntity[],
}

export type DriverMapping = { name: { [id: string]: string }, type: { [id: string]: string }, url: { [id: string]: string } };

export class JobService {

    constructor() { }

    async getDriverMapping(): Promise<DriverMapping> {
        const drivers = await DriverEntity.find();
        const driverMapping: DriverMapping = { name: {}, type: {}, url: {} };
        for (const driver of drivers) {
            driverMapping.name[driver._id] = driver.name;
            driverMapping.type[driver._id] = driver.type;
            driverMapping.url[driver._id] = driver.url;
        }
        return driverMapping;
    }

    async getJobByIdAsync(_id: string): Promise<any> {
        const result = await JobEntity.findById(_id);
        return result;
    }


    async getJobsAsync(page: number, statusList: string[]): Promise<IJobResult> {
        const limit = 10;
        const skip = limit * page;
        const sort = { "created_at": -1 }
        const statusListCondition = [];
        for (const status of statusList) {
            statusListCondition.push({ status: status });
        }
        const filter = { $or: statusListCondition };
        const jobCount = await JobEntity.countDocuments(filter);
        const jobs = await JobEntity.find(filter).sort(sort).skip(skip).limit(limit);
        const pageCount = Math.ceil(jobCount / limit);
        return { pageIndex: page, pageCount, jobs };
    }


    async createJobAsync(dto: IJobEntity): Promise<IJobEntity> {
        dto.created_at = new Date;
        dto.status = "waiting";
        const job = dto;
        const result = await JobEntity.create(job);
        return result;
    }

    async updateJobAsync(_id: string, dto: IJobEntity): Promise<IJobEntity> {
        dto.updated_at = new Date;
        const job = dto;
        const result = await JobEntity.updateOne({ _id: _id }, job);
        return result;
    }


}