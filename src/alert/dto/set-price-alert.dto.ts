import { ApiProperty } from '@nestjs/swagger';

export class SetPriceAlertDto {
  @ApiProperty({
    description:
      'The blockchain to monitor for price alerts (e.g., ethereum, polygon)',
  })
  chain: string;

  @ApiProperty({ description: 'The target price to trigger the alert' })
  targetPrice: number;

  @ApiProperty({
    description: 'The email address to send the alert notification',
  })
  email: string;
}
