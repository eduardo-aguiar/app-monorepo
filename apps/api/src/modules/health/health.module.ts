import { Module } from "@nestjs/common";
// O módulo (feature) só desce para a camada "shared", pela API pública dela.
import { LoggerModule } from "../../shared/logger";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [LoggerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
