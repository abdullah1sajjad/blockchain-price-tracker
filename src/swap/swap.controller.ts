import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SwapService } from './swap.service';
import { SwapRateDto } from './dto/swap-rate.dto';

@ApiTags('Swap')
@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post('rate')
  @ApiBody({ type: SwapRateDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully calculated swap rate.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input.',
  })
  getSwapRate(@Body() swapRateDto: SwapRateDto) {
    return this.swapService.calculateBtc(swapRateDto.ethAmount);
  }
}
