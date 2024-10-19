import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class PriceSchedulerService {
  constructor(private readonly alertService: AlertService) {}

  @Cron('*/5 * * * *')
  async handleCron() {
    await this.alertService.checkPriceAlerts();
  }
}
