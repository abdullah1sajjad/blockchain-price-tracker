// src/price/dto/hourly-averages.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class HourlyAverageDto {
  @ApiProperty({ description: 'The hour of the average price' })
  hour: string;

  @ApiProperty({ description: 'The average price in Ethereum' })
  ethereum: number;

  @ApiProperty({ description: 'The average price in Polygon' })
  polygon: number;
}
