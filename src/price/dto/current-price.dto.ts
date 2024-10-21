// src/price/dto/current-price.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CurrentPriceDto {
  @ApiProperty({ description: 'The current price of the cryptocurrency' })
  price: number;
}
