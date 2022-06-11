import MessageBroker from "./infra/message-broker";
import Config from "./config";

const config = new Config();
const broker = new MessageBroker(config);

const connectBrokerPromise = async () =>
  broker
    .start()
    .then(() => {
      console.log("CONNECTED TO MESSAGE BROKER");
    })
    .catch((e) => {
      console.error(e);
    });

const checkBrokerPromise = async () => broker.check();
const stopBrokerPromise = async () => broker.stop();

let connect, check, stop;

if (process.env.TELUNJUK_DATA_STORE === 'DB') {
  connect = async () => Promise.all([connectBrokerPromise()]);
  check = async () => Promise.all([checkBrokerPromise()]);
  stop = async () => Promise.all([stopBrokerPromise()]);
} else {
  connect = async () => Promise.all([connectBrokerPromise()]);
  check = async () => Promise.all([checkBrokerPromise()]);
  stop = async () => Promise.all([stopBrokerPromise()]);
}

export { connect, check, stop };
