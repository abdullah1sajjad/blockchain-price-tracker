import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alert.service';
import { Price } from 'src/price/price.entity';
import { EmailService } from 'src/email/email.service';
import { AlertController } from './alert.controller';
import { PriceAlert } from './price-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price, PriceAlert])],
  providers: [AlertService, EmailService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule {}
