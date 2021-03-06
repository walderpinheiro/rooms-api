import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { v4 as uuid } from 'uuid';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/ban-types
  getHello(): number {
    return 10;
  }
}
