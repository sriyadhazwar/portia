import ConfigEntity, { IConfigEntity } from "../entities/config.entity";
import { Schema } from "mongoose";


export class ConfigService {

    constructor() { }

    async getConfigAsync(): Promise<IConfigEntity> {
        let result = await ConfigEntity.findOne();
        if (!result) {
            result = await this.createConfigAsync(new ConfigEntity({
                feeder: 1,
                fetcher: 1,
                extractor: 1,
            }));
        }
        return result;
    }

    async createConfigAsync(dto: IConfigEntity): Promise<IConfigEntity> {
        dto.created_at = new Date;
        dto.updated_at = new Date;
        const Config = dto;
        const result = await ConfigEntity.create(Config);
        return result;
    }

    async updateConfigAsync(_id: string, dto: IConfigEntity): Promise<IConfigEntity> {
        dto.updated_at = new Date;
        const Config = dto;
        const result = await ConfigEntity.updateOne({ _id: _id }, Config);
        return result;
    }

    async deleteConfigAsync(_id: string): Promise<boolean> {
        await ConfigEntity.deleteOne({ _id: _id });
        return true;
    }

}