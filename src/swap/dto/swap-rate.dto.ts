import { ApiProperty } from '@nestjs/swagger';

export class SwapRateDto {
  @ApiProperty({ description: 'Amount of ETH to be swapped' })
  ethAmount: number;
}
