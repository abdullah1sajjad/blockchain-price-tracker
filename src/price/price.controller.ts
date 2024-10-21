import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { Cron } from '@nestjs/schedule';
import { AlertService } from 'src/alert/alert.service';
import { CurrentPriceDto } from './dto/current-price.dto';
import { HourlyAverageDto } from './dto/hourly-averges.dto';

@ApiTags('Prices')
@Controller('prices')
export class PriceController {
  constructor(
    private readonly priceService: PriceService,
    private readonly alertService: AlertService,
  ) {}

  @Get('current')
  @ApiQuery({
    name: 'chain',
    required: true,
    description:
      'The blockchain to get the current price for (e.g., ethereum, polygon)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the current price for the specified blockchain.',
    type: CurrentPriceDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid chain parameter.',
  })
  async getCurrentPrice(
    @Query('chain') chain: string,
  ): Promise<CurrentPriceDto> {
    const price = await this.priceService.getPrice(chain);
    return { price };
  }

  @Get('hourly-averages')
  @ApiResponse({
    status: 200,
    description: 'Returns hourly average prices for Ethereum and Polygon.',
    type: [HourlyAverageDto],
  })
  async getHourlyAverages(): Promise<HourlyAverageDto[]> {
    return await this.priceService.getHourlyAverages();
  }

  @Cron('*/5 * * * *')
  async handleCron() {
    const ethPrice = await this.priceService.getPrice('ethereum');
    const polyPrice = await this.priceService.getPrice('polygon');

    await this.alertService.checkPrice('ethereum', ethPrice);
    await this.alertService.checkPrice('polygon', polyPrice);
  }
}
