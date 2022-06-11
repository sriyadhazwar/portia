import * as amqp from "amqplib";
import os from "os";
import Crawler from "../../handler/crawler";
import {
  ICrawlerHandler,
  IMessage,
  ILogger,
  IConfig,
  IResultData,
  IProduct
} from "../../interfaces";
import { IMessageBroker } from "../../interfaces/message-broker";
import Logger from "../logger";
import * as bootstrap from "../../bootstrap";
import process from "process";

// import Redis from "ioredis";

class MessageBroker implements IMessageBroker {
  private osHostname = os.hostname();
  private protocol = "amqp";
  private host = process.env.TELUNJUK_RABBITMQ_HOST || "localhost";
  private port = +(process.env.TELUNJUK_RABBITMQ_PORT || 5672);
  private username = process.env.TELUNJUK_RABBITMQ_USERNAME || "rabbitmq";
  private password = process.env.TELUNJUK_RABBITMQ_PASSWORD || "rabbitmq";
  private heartbeat = +(process.env.TELUNJUK_RABBITMQ_PORT || 60);
  private vhost = process.env.TELUNJUK_RABBITMQ_VHOST || "/";
  private connection: amqp.Connection | null | undefined = null;
  private consumerChannel: amqp.Channel | null | undefined = null;
  private logger: ILogger;
  private crawler: ICrawlerHandler;
  private config: IConfig;
  private connecting = false;
  private isShuttingDown = false;
  private retryCount = 0;
  // private redis: Redis;
  private counter: number;

  constructor(config: IConfig) {
    this.logger = new Logger("MessageBroker");
    this.crawler = new Crawler();
    // const redisHost = process.env.TELUNJUK_REDIS_HOST || "localhost";
    // const redisPort = +(process.env.TELUNJUK_REDIS_PORT || 6379);
    // this.redis = new Redis(redisPort, redisHost);
    this.config = config;
    this.counter = 0;
  }

  /**
   * Starting the message queue consumer and publisher.
   */
  async start(): Promise<void> {
    if (this.connecting) return;
    if (this.isShuttingDown) return;

    try {
      this.connecting = true;

      this.connection = await amqp
        .connect({
          protocol: this.protocol,
          hostname: this.host,
          port: this.port,
          username: this.username,
          password: this.password,
          heartbeat: this.heartbeat,
          vhost: this.vhost
        })
        .then((connection: amqp.Connection) => {
          console.log("[RABBITMQ] Connected to RabbitMQ server");

          return connection;
        });

      const onErrorHandler = async (err: any) => {
        console.error("[RABBITMQ] Error occurred");
        console.error(err.toString());
        console.error("[RABBITMQ] Reconnecting after error occurred");
        setTimeout(() => {
          this.retryCount += 1;
          this.start();
        }, 1000);
      };

      const reconnectHandler = async () => {
        console.log("[RABBITMQ] Reconnecting to RabbitMQ server...");
        setTimeout(() => {
          this.retryCount += 1;
          this.start();
        }, 1000);
      };

      this.connection.on("close", reconnectHandler.bind(this));
      this.connection.on("error", onErrorHandler.bind(this));

      await this.initFetcherConsumer();

      this.connecting = false;
    } catch (e) {
      this.connecting = false;
      console.log("[RABBITMQ] Reconnecting to RabbitMQ server...");
      setTimeout(() => {
        this.retryCount += 1;
        this.start();
      }, 1000);

      if (this.retryCount > 3) {
        console.error(
          "[RABBITMQ] Giving up reconnecting to RabbitMQ server after 3 times"
        );
        throw e;
      }
    }
  }

  // private getRediskey(driverId: string): string {
  //   const date = new Date();
  //   const y = date.getFullYear();
  //   const m = date.getMonth();
  //   const d = date.getDate();
  //   const h = date.getHours();
  //   const mi = date.getMinutes();
  //   return `${driverId}.${y}${m}${d}${h}${mi}`;
  // }

  // private async getRedisValue(
  //   redisKey: string,
  //   defaultValue: number
  // ): Promise<number> {
  //   if (!(await this.redis.exists(redisKey))) {
  //     await this.redis.set(redisKey, defaultValue);
  //   }
  //   return await this.redis.get(redisKey);
  // }

  private async sleep(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Start the fetcher worker consumer for job.
   */
  private async initFetcherConsumer() {
    try {
      this.consumerChannel = await this.connection?.createConfirmChannel();
      this.consumerChannel?.prefetch(1);

      const queue = await this.consumerChannel?.assertQueue(
        this.config.queue.consume,
        {
          durable: true,
          autoDelete: false,
          arguments: {}
        }
      );

      this.processTimeout();

      await this.consumerChannel?.consume(
        queue?.queue as string,
        async (msg: amqp.ConsumeMessage | null) => {
          if (!msg) {
            console.warn("Consume empty message");
          } else {
            try {
              // Reset timeout after consuming message
              this.counter = 0;
              const message: IMessage = JSON.parse(msg.content.toString());
              const resultData: IResultData = await this.crawler.handle(
                message
              );

              // at the moment we only accept content from 200 http_status_code
              if (
                resultData.code === 200 &&
                resultData.product.contents != undefined &&
                resultData.product.contents.length > 0
              ) {
                await this.publishMessage(msg, message, resultData.product);
              } else if (resultData.code === 404) {
                //console.debug("Ack message and response from server is ", resultData.code);
              } else {
                //console.debug("Requeue and response from server is ", resultData.code);
              }

              // TODO: selalu ack karena belum punya mekanisme retry
              this.consumerChannel?.ack(msg);
            } catch (e) {
              console.error(e.message);
              // TODO selalu ack karena belum punya mekanisme retry
              this.consumerChannel?.ack(msg);
            }
          }
        },
        {
          consumerTag: this.osHostname
        }
      );
    } catch (e) {
      console.error(e.message);
    }
  }

  /**
   * Publish message to queueu.
   * @param message {IFetcher} config from fetcher
   * @param sitesData {IProduct} product url need by extractor
   */
  async publishMessage(
    msg: amqp.ConsumeMessage,
    message: IMessage,
    product: IProduct
  ): Promise<void> {
    //Check for throttling
    if (message.driver.definition.product.throttle > 0) {
      //console.log("Throttling %s ms", message.driver.definition.product.throttle)
      await this.sleep(message.driver.definition.product.throttle);
    }

    //Setup product url
    const nextMessage: IMessage = JSON.parse(JSON.stringify(message));
    //TODO: make type based on crawler type
    nextMessage.product = product;

    this.consumerChannel?.sendToQueue(
      this.config.queue.produce,
      Buffer.from(JSON.stringify(nextMessage)),
      { persistent: true }
    );

    this.logger.debug("Message published");
  }

  async stop(): Promise<void> {
    try {
      this.isShuttingDown = true;
      console.log("[RABBITMQ] Shutting down RabbitMQ connection...");

      this.connection?.close();
    } catch (e) {
      console.error(
        "[RABBITMQ] Error shutting down RabbitMQ connection gracefully",
        e
      );
    }
  }

  check(): boolean {
    console.log("[RABBITMQ] Checking connection...");
    const isConnectionAlive =
      this.connection !== undefined || this.connection !== null;

    console.log("[RABBITMQ] Connection status is alive:", isConnectionAlive);
    return isConnectionAlive;
  }

  async processTimeout() {
    if (process.argv.includes("--keep-alive")) return;

    while (this.counter < this.config.timeout) {
      this.counter++;
      await this.sleep(1000);
    }
    console.log("Max idle timeout reached(s): ", this.config.timeout);
    await bootstrap.stop();
    process.exit(0);
  }
}

export default MessageBroker;
