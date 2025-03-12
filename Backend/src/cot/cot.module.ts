import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CotController } from './cot.controller';
import { CotService } from './cot.service';

@Module({
  imports: [HttpModule],
  controllers: [CotController],
  providers: [CotService],
  exports: [CotService],
})
export class CotModule {}
