import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './price.entity';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), AlertModule],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
