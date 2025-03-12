import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { CotModule } from './cot/cot.module';

@Module({
  imports: [FinanceModule, CotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
