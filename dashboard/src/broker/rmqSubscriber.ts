import amqplib from "amqplib";
import { EventHandler, Subscriber, Message } from "./interfaces";

export class RmqSubscriber implements Subscriber {
    connection: amqplib.Connection;
    logger: Console;
    handlers: { [functionName: string]: EventHandler };
    eventMap: { [event: string]: { queue: string, exchange: string } };

    constructor(logger: Console, connection: amqplib.Connection, eventMap: { [event: string]: { queue: string, exchange: string } } = {}) {
        this.connection = connection;
        this.logger = console;
        this.handlers = {};
        this.eventMap = eventMap;
    }

    registerHandler(eventName: string, handler: EventHandler): Subscriber {
        this.handlers[eventName] = handler;
        return this;
    }

    async subscribe(): Promise<void> {
        const self = this;
        return new Promise(async (_, reject) => {
            try {
                const ch = await self.connection.createChannel();
                self.connection.on("error", (err) => {
                    reject(err);
                });
                self.connection.on("close", (err) => {
                    reject(err);
                });
                this.pSubscribe(ch);
            } catch (err) {
                reject(err);
            }
        });
    }

    async pSubscribe(ch: amqplib.Channel) {
        const self = this;
        for (const key in this.handlers) {
            console.log({key})
            const eventName = key;
            const handler = this.handlers[eventName];
            const exchangeName = eventName in this.eventMap ? this.eventMap[eventName].exchange : eventName;
            await ch.assertExchange(exchangeName, "fanout", {});
            const queueName = eventName in this.eventMap ? this.eventMap[eventName].queue : eventName;
            await ch.assertQueue(queueName, { durable: true });
            await ch.bindQueue(queueName, exchangeName, "");
            this.logger.log(`[INFO RmqSubscriber] Subscribe ${queueName}`);
            const rmqHandler = async (rmqMsgOrNull: amqplib.ConsumeMessage | null) => {
                try {
                    const rmqMsg = rmqMsgOrNull as amqplib.ConsumeMessage;
                    const jsonMsg = rmqMsg.content.toString();
                    this.logger.log(`[INFO RmqSubscriber] Get Event ${queueName}: `, jsonMsg);
                    const msg: Message = JSON.parse(jsonMsg);
                    await handler(msg);
                } catch (err) {
                    this.logger.log(`[ERROR RmqSubscriber] Get Event ${queueName}: `, err);
                    self.logger.error(err);
                }
            }

            ch.prefetch(20)
            await ch.consume(queueName, rmqHandler, { noAck: true });
        }
    }

}
