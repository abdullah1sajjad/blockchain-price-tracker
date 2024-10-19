import { Controller, Post, Body } from '@nestjs/common';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post('rate')
  async getSwapRate(@Body('ethAmount') ethAmount: number) {
    return this.swapService.calculateSwapRate(ethAmount);
  }
}
