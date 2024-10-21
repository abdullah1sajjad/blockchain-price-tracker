import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Method to send the price alert email
  async sendPriceAlert(
    newPrice: number,
    percentageChange: number,
    chain: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: 'wahaj.buggcy@gmail.com',
      subject: `Price alert of ${chain}`,
      text: `The price of ${chain} has increased by ${percentageChange.toFixed(2)}%. The new price is ${newPrice}.`,
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  async sendSpecificPriceAlert(
    newPrice: number,
    targetPrice: number,
    email: string,
  ): Promise<void> {
    const mailOptions = {
      from: 'your-ethereal-email@example.com',
      to: email,
      subject: 'Price Alert: Chain Price Reached',
      text: `The price has reached ${targetPrice}. Current price: ${newPrice}.`,
    };
    const info = await this.transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  }
}
