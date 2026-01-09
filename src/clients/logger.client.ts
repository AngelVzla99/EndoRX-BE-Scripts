import winston from "winston";
import { ConfigService } from "../config/config.service";

export class LoggerClient {
  private logger: winston.Logger;
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
    const config = this.configService.getConfig();

    this.logger = winston.createLogger({
      level: config.logger.level,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ],
    });

    let format = winston.format.combine(
      // winston.format.colorize(),
      winston.format.printf((info) => {
        const { timestamp, level, message, stack, splat, ...meta } = info;
        const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${metaString}`;
      })
    );

    if (config.logger.activateLogColor) {
      format = winston.format.combine(winston.format.colorize(), format);
    }

    this.logger.add(
      new winston.transports.Console({
        format: format,
      })
    );
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta); 
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: Record<string, unknown>): void {
    this.logger.verbose(message, meta);
  }

  public silly(message: string, meta?: Record<string, unknown>): void {
    this.logger.silly(message, meta);
  }

  public log(
    level: string,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    this.logger.log(level, message, meta);
  }
}
