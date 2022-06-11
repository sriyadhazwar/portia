import DriverEntity, { IDriverEntity } from "../entities/driver.entity";

export class DriverService {

    //Helper
    private convertAfterQuery(data: any) {
        if (!data) return null;
        const response = {
            _id: data._id,
            name: data.name,
            url: data.url,
            type: data.type,
            use_proxy: data.use_proxy,
            proxy_credential: data.proxy_credential,
            user_agent: data.user_agent,
            headers: data.headers ? JSON.parse(data.headers) : {},
            use_lazy: data.use_lazy,
            definition: data.definition ? JSON.parse(data.definition) : {}
        }

        return response;
    }

    private convertBeforeInsert(data: any) {
        if (!data) return null;
        const entity = {
            name: data.name,
            url: data.url,
            type: data.type,
            use_proxy: (data.use_proxy) ? data.use_proxy : false,
            proxy_credential: (data.proxy_credential) ? data.proxy_credential : false,
            user_agent: (data.user_agent) ? data.user_agent : false,
            headers: data.headers ? data.headers : {},
            use_lazy: (data.use_lazy) ? data.use_lazy : false,
            definition: data.definition ? JSON.stringify(data.definition) : {},
            created_at: new Date()
        }

        return entity;
    }

    async getDriverAsync(): Promise<IDriverEntity[]> {
        const result = await DriverEntity.find();
        return result;
    }

    async getDriverByIdAsync(_id: string): Promise<any> {
        const result = await DriverEntity.findById(_id);
        return this.convertAfterQuery(result);
    }

    async createDriverAsync(dto: any): Promise<IDriverEntity> {
        const driver = this.convertBeforeInsert(dto);
        const result = await DriverEntity.create(driver as IDriverEntity);
        return result;
    }

    async updateDriverAsync(_id: string, dto: any): Promise<IDriverEntity> {
        const driver = this.convertBeforeInsert(dto);
        const result = await DriverEntity.updateOne({ _id: _id }, driver as IDriverEntity);
        return result;
    }

    async deleteDriverAsync(_id: string): Promise<boolean> {
        await DriverEntity.deleteOne({ _id: _id });
        return true;
    }

}
