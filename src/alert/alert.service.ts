import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Price } from 'src/price/price.entity';
import { EmailService } from 'src/email/email.service';
import { PriceAlert } from './price-alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(PriceAlert)
    private readonly priceAlertRepository: Repository<PriceAlert>,
    private readonly emailService: EmailService,
  ) {}

  async setPriceAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<PriceAlert> {
    const alert = this.priceAlertRepository.create({
      chain,
      price: targetPrice,
      currency: 'USD',
      email,
    });
    return await this.priceAlertRepository.save(alert);
  }

  async checkPrice(chain: string, currentPrice: number): Promise<void> {
    const alerts = await this.priceAlertRepository.find({
      where: { chain, is_alerted: false },
    });

    for (const alert of alerts) {
      if (currentPrice >= alert.price) {
        await this.emailService.sendSpecificPriceAlert(
          currentPrice,
          alert.price,
          alert.email,
        );

        alert.is_alerted = true;
        await this.priceAlertRepository.save(alert);

        // await this.priceAlertRepository.remove(alert); // Uncomment if you want to remove alerts after sending
      }
    }
  }

  async getPriceOneHourAgo(chain: string): Promise<number> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const priceRecord = await this.priceRepository.findOne({
      where: { chain, timestamp: LessThan(oneHourAgo) },
      order: { timestamp: 'DESC' },
    });

    return priceRecord ? priceRecord.price : 0;
  }

  async getCurrentPrice(chain: string): Promise<number> {
    const priceRecord = await this.priceRepository.findOne({
      where: { chain },
      order: { timestamp: 'DESC' },
    });

    return priceRecord ? priceRecord.price : 0;
  }

  getPercentageChange(oldPrice: number, newPrice: number): number {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  async triggerPriceAlert(chain: string): Promise<void> {
    const oldPrice = await this.getPriceOneHourAgo(chain);
    const newPrice = await this.getCurrentPrice(chain);

    if (oldPrice && newPrice) {
      const percentageChange = this.getPercentageChange(oldPrice, newPrice);

      if (percentageChange >= 3) {
        await this.emailService.sendPriceAlert(
          newPrice,
          percentageChange,
          chain,
        );
      }
    }
  }
}
