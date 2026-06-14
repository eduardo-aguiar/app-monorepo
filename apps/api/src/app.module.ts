import { Module } from "@nestjs/common";
// A camada "app" compõe os módulos pela API pública de cada um.
import { HealthModule } from "./modules/health";

@Module({
  imports: [HealthModule],
})
export class AppModule {}
