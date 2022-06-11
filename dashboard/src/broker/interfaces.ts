export type Message = { [key: string]: any };
export type EventHandler = (input: Message) => void;


export interface Publisher {
    publish: (eventName: string, msg: Message) => Promise<void>;
}

export interface Subscriber {
    registerHandler: (eventName: string, handler: EventHandler) => Subscriber;
    subscribe: () => Promise<void>;
}