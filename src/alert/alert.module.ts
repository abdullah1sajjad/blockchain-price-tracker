import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from '../price/price.entity';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { EmailService } from './email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  providers: [AlertService, EmailService],
  controllers: [AlertController],
})
export class AlertModule {}
