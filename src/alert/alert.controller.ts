import { Controller, Post, Body } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('set')
  async setAlert(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.setPriceAlert(createAlertDto);
  }
}
