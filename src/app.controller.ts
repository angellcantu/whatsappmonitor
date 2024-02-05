import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IGroup } from 'src/group/group.interface'
import { WhatsappService } from './whatsapp/whatsapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly userService: UserService
    private readonly whatsappService: WhatsappService
    ) {}

  @Get()
  async getHello(): Promise<any> {
    return { message: 'Hello' } 
  }
}
