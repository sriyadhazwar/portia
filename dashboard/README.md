# dashboard

One Paragraph of project description goes here [test]

# Start

```sh
npm install
export RMQ_CONNECTION_STRING=<your-rmq-connection-string>
export HTTP_PORT=3000
# ... other-env-setting
npm start
```

# Test

```sh
npm install
export RMQ_CONNECTION_STRING=<your-rmq-connection-string>
export HTTP_PORT=3000
# ... other-env-setting
npm test
```

# Assumptions

This application was built with the following assumptions:

* Explicit is better than implicit. We try to make everything as accessible, as readable, and as replace-able as possible. 
* We don't try to hide anything using any magic. No reflection, automatic dependency resolver, etc.
* We use `rabbit-mq` as inter-service communication protocol.

>__NOTE__ You can implement your own communication protocol (e.g: nats, kafka, etc)

# Project Structure 

```
.
├── components
│   ├── defaultcomponent
│   │   └── index.ts
│   ├── example
│   │   ├── helpers.spec.ts
│   │   ├── helpers.ts
│   │   ├── index.ts
│   │   ├── services.spec.ts
│   │   └── services.ts
│   └── monitoring
│       └── index.ts
├── config
│   └── index.ts
├── core
│   ├── createRouter.ts
│   ├── createSetup.ts
│   ├── expressMiddlewares.ts
│   ├── index.ts
│   ├── interfaces.ts
│   ├── logExpressRoutes.ts
│   └── mainApp.ts
├── main.ts
└── transport
    ├── index.ts
    ├── interfaces.ts
    ├── rmqPublisher.ts
    └── rmqSubscriber.ts
```

# Bootstrap

App initialization contains of 4 steps:

* __App component definitions:__ In this step we define all components that will be used by our app or other components (e.g: logger, config, router, publisher, subscriber, rpc-server, and rpc-client). The definition should be explicit so that other developers can easily understand which components depend on which component.
* __App creation:__ In this step, we initiate our app.
* __App setup:__ In this step, we setup our app, by registering your components. To register your component, you need to provide a function with no parameter and return nothing. You can surely wrap the function into object method or wrapper-function. If you need to inject dependencies, you can use [closure](https://en.wikipedia.org/wiki/Closure_(computer_programming)) (more about this latter).
* __App Execution:__ Finally, we run our app.

Below is how everything looks like in `main.ts`:

```typescript
async function main() {

    // app component definitions
    const logger = console;
    const config = new Config();
    logger.log("CONFIG:", JSON.stringify(config));
    const router = createRouter(logger);
    const defaultRmqConnection = await amqplib.connect(config.rmqConnectionString);
    const subscriber = new RmqSubscriber(logger, defaultRmqConnection);
    const publisher = new RmqPublisher(logger, defaultRmqConnection);

    // app creation
    const app = new MainApp(
        logger,
        router,
        [subscriber],
        config.httpPort,
    );

    // app setup
    app.setup([
        defaultComponent.createSetup(config, router), // setup default
        monitoring.createSetup(config, app, router), // setup monitoring
        example.createSetup(config, router, publisher, subscriber), // setup example
    ]);

    // app execution
    app.run();

}
```

> __NOTE:__ Treat our app bootstrap as your own. You are free to define new components, replace one component with another ones, or wire the components differently.

# Components

All components should be location on `component` directory. To expose a component and put them on `app setup`, you should provide a function with no parameter and return nothing. However, there is no limitation to produce the function. You can use wrapper-function and utilize closure, expose object's method, etc.

For example, our `monitoring` component need `config`, `app`, and `router`. Thus we utilize closure to inject those components:

```typescript
export function createSetup(config: Config, app: App, router: Express): () => void {
    return () => {
        const serviceName = config.serviceName;

        router.get("/liveness", (_, res) => {
            const liveness = app.liveness();
            const httpCode = liveness ? 200 : 500;
            res.status(httpCode).send({
                service_name: serviceName,
                is_alive: liveness,
            });
        });

        router.get("/readiness", (_, res) => {
            const readiness = app.readiness();
            const httpCode = readiness ? 200 : 500;
            res.status(httpCode).send({
                service_name: serviceName,
                is_ready: readiness,
            });
        });

    }
}
```

The returned function is then used on `app setup`:

```typescript
app.setup([
	// ...
	monitoring.createSetup(config, app, router), // setup monitoring
	// ...
]);
```

We has already provide an `example` component that utilize OOP with some possible use-cases (including RPC and pub/sub communication). Feel free to explore.

# Component Convention

Typically a component should contains at least one file named `index.ts`. Although you can write anything inside `index.ts`, it is better to just put `router`, `rpc-server`, and `subscriber` handler in it.

Make your components as loosly coupled as possible, as it is going to help you in case of you want to split the app into several smaller apps.

If you need some business logic, please put them inside `service` directory or `service.ts`.

If your components are depending on each other, please put the dependency in our `main.ts` bootstrap, don't import the component directly as it will make your components tightly coupled to each other.

If you need database connection or cache mechanism, please also define them in our `main.ts`.

# Catatan buat run docker

```
docker build -t telunjuk-dashboard:latest . && docker run --name telunjuk-dashboard -e DASHBOARD_HTTP_PORT=3001 -e DASHBOARD_RMQ_CONNECTION_STRING="amqp://rabbitmq:rabbitmq@host.docker.internal:5672/" -e DASHBOARD_MONGO_CONNECTION_STRING="mongodb://root:psswd@host.docker.internal:27017" -d telunjuk-dashboard:latest
```
