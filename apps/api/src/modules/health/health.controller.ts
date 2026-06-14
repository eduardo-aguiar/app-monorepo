import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  getRoot() {
    return { message: "API do app-monorepo no ar 🚀" };
  }

  @Get("health")
  getHealth() {
    return this.health.check();
  }
}
