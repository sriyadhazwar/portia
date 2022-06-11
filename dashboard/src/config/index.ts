export class Config {
    httpPort: number;
    serviceName: string;
    rmqConnectionString: string;
    rmqJobStartQueue: string;
    rmqProductAddedQueue: string;
    rmqProductAddedExchange: string;
    rmqProcessedAddedQueue: string;
    rmqProcessedAddedExchange: string;
    mongoConnectionString: string;
    managerBaseUrl: string;

    constructor() {
        this.httpPort = (process.env.DASHBOARD_HTTP_PORT || 3001) as number;
        this.serviceName = "dashboard";
        this.rmqConnectionString = process.env.DASHBOARD_RMQ_CONNECTION_STRING || "amqp://rabbitmq:rabbitmq@localhost:5672/";
        this.rmqJobStartQueue = process.env.DASHBOARD_RMQ_JOB_START_QUEUE || "feeder";
        this.rmqProductAddedQueue = process.env.DASHBOARD_RMQ_PRODUCT_ADDED_QUEUE || "product-added";
        this.rmqProductAddedExchange = process.env.DASHBOARD_RMQ_PRODUCT_ADDED_EXCHANGE || "fetcher";
        this.rmqProcessedAddedQueue = process.env.DASHBOARD_RMQ_PROCESSED_ADDED_QUEUE || "job-done";
        this.rmqProcessedAddedExchange = process.env.DASHBOARD_RMQ_PROCESSED_ADDED_EXCHANGE || "extractor";
        this.mongoConnectionString = process.env.DASHBOARD_MONGO_CONNECTION_STRING || "mongodb://root:psswd@localhost:27017/telunjuk";
        this.managerBaseUrl = process.env.DASHBOARD_MANAGER_BASE_URL || "http://localhost:3001";
    }

}