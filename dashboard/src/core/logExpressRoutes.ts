import { Express } from "express";

export function logExpressRoutes(router: Express, logger: Console) {
    try {
        for (const layer of router._router.stack) {
            if (layer.route && layer.route.path && layer.route.methods) {
                const path = layer.route.path;
                for (const method in layer.route.methods) {
                    const shownMethod = method.toUpperCase().padEnd(15, " ");
                    logger.log(`${shownMethod}\t ${path}`);
                }
            }
        }
    } catch (err) {
        logger.error(err);
    }
}
