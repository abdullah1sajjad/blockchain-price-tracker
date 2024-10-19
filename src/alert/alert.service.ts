import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from '../price/price.entity';
import { EmailService } from './email.service';
import { CreateAlertDto } from './dto/create-alert.dto';

// Define an interface for the alert object
interface Alert {
  chain: string;
  targetPrice: number;
  email: string;
}

@Injectable()
export class AlertService {
  private alerts: Alert[] = []; // Use the Alert interface to type the array

  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    private readonly emailService: EmailService,
  ) {}

  // Set a new price alert
  async setPriceAlert(createAlertDto: CreateAlertDto) {
    const { chain, targetPrice, email } = createAlertDto;
    this.alerts.push({ chain, targetPrice, email });

    return { message: 'Alert set successfully!' };
  }

  // Check if any alert conditions are met and send an email
  async checkPriceAlerts() {
    for (const alert of this.alerts) {
      const latestPrice = await this.priceRepository.findOne({
        where: { chain: alert.chain },
        order: { timestamp: 'DESC' },
      });

      if (latestPrice && latestPrice.price >= alert.targetPrice) {
        await this.emailService.sendAlertEmail(
          alert.email,
          `${alert.chain.toUpperCase()} Price Alert`,
          `The price of ${alert.chain} has reached your target of $${alert.targetPrice}. Current price: $${latestPrice.price}`,
        );
      }
    }
  }
}
