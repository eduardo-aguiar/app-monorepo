import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger("App");

  log(message: string) {
    this.logger.log(message);
  }
}
