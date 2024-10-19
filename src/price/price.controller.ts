import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('current')
  async getCurrentPrice(
    @Query('chain') chain: string,
  ): Promise<{ price: number }> {
    const price = await this.priceService.getPrice(chain);
    return { price };
  }
}
