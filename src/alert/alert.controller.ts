import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { SetPriceAlertDto } from './dto/set-price-alert.dto';

@ApiTags('Alerts') // Group this controller under the "Alerts" section in Swagger UI
@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('trigger')
  @ApiResponse({
    status: 204,
    description: 'Price alert triggered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid chain parameter.',
  })
  async triggerPriceAlert(): Promise<void> {
    const chain = '';
    await this.alertService.triggerPriceAlert(chain);
  }

  @Post('set')
  @ApiBody({ type: SetPriceAlertDto })
  @ApiResponse({
    status: 201,
    description: 'Price alert set successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  setPriceAlert(@Body() setPriceAlertDto: SetPriceAlertDto) {
    const { chain, targetPrice, email } = setPriceAlertDto;
    return this.alertService.setPriceAlert(chain, targetPrice, email);
  }
}
