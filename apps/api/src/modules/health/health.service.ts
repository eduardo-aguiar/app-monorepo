import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../shared/logger";

@Injectable()
export class HealthService {
  constructor(private readonly logger: LoggerService) {}

  check() {
    this.logger.log("Health check solicitado");
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    };
  }
}
