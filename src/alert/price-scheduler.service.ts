import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertService } from './alert.service';

@Injectable()
export class PriceSchedulerService {
  constructor(private readonly alertService: AlertService) {}

  @Cron('0 * * * *')
  async handleCron() {
    await this.alertService.triggerPriceAlert('ethereum');
    await this.alertService.triggerPriceAlert('polygon');
  }
}
