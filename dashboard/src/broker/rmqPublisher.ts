import amqplib from "amqplib";
import { Message, Publisher } from "./interfaces";

export class RmqPublisher implements Publisher {
    connection: amqplib.Connection;
    logger: Console;

    constructor(logger: Console, connection: amqplib.Connection) {
        this.connection = connection;
        this.logger = logger;
    }

    async publish(eventName: string, msg: Message): Promise<void> {
        const jsonMsg = JSON.stringify(msg);
        this.logger.log("[INFO RmqPublisher] Publish", eventName, jsonMsg);
        const ch = await this.connection.createChannel();
        const exchangeName = eventName;
        await ch.assertExchange(exchangeName, "fanout", {});
        const queueName = eventName;
        await ch.assertQueue(queueName, { durable: true });
        await ch.bindQueue(queueName, exchangeName, "");
        await ch.publish(exchangeName, "", Buffer.from(jsonMsg), {});
        await ch.close();
    }

}