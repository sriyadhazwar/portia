import * as winston from "winston";
import { ILogger } from "../../interfaces/logger";

const defaultFormat = (componentName: string) =>
  winston.format.combine(
    winston.format.label({ label: componentName }),
    winston.format.json()
  );

class Logger implements ILogger {
  private logger: winston.Logger;

  constructor(componentName: string) {
    winston.loggers.add("development", {
      level: "silly",
      format: defaultFormat(componentName),
      transports: [new winston.transports.Console()]
    });

    winston.loggers.add("production", {
      level: "info",
      format: defaultFormat(componentName),
      transports: [new winston.transports.Console()]
    });

    if (
      !process.env.NODE_ENV ||
      process.env.NODE_ENV === "" ||
      process.env.NODE_ENV === "development"
    ) {
      this.logger = winston.loggers.get("development");
    } else {
      this.logger = winston.loggers.get("production");
    }
  }
  warn(message: string): void {
    this.logger.warn(message);
  }
  error(message: string): void {
    this.logger.error(message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}

export default Logger;
