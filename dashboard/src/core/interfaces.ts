export interface App {
    liveness: () => boolean;
    readiness: () => boolean;
    setLiveness: (liveness: boolean) => void;
    setReadiness: (readiness: boolean) => void;
    setup: (Components: Comp[]) => void;
    run: () => void;
}

export interface Comp {
    setup: () => void | Promise<void>;
}