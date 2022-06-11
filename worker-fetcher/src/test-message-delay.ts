import * as amqp from "amqplib";

async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const queueName = "fetcher";
  const connectionString = "amqp://rabbitmq:rabbitmq@localhost:5672";
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createConfirmChannel();
  channel.prefetch(10);
  await channel.assertQueue(queueName, {
    durable: true,
    autoDelete: false,
    arguments: {}
  });
  for (let index = 0; index < 20; index++) {
    channel.sendToQueue(
      queueName,
      Buffer.from(
        JSON.stringify({
          config: {
            job: {
              _id: index,
              url: "http://google.com"
            },
            driver: {
              _id: "driver-gojek",
              name: "driver-gojek",
              definition: {
                product: {
                  throttle: 5,
                  rendering: "false"
                }
              },
              use_proxy: "true"
            }
          },
          product: {
            url: "http://google.com"
          },
          meta: {
            attempt: 0
          }
        })
      ),
      { persistent: true }
    );
    await sleep(1000);
  }
}

main()
  .then(() => console.log("ok, jalan"))
  .catch((error) => console.log("Ada error", error));
