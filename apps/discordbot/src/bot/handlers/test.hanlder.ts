import { BaseHandler } from './base.handler';
import { MessageHandler } from '../bot.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';

@MessageHandler('test')
export class TestHandler extends BaseHandler {
  constructor(@Inject('COUNTER_SERVICE') private client: ClientProxy) {
    super();
  }

  async process(message): Promise<string> {
    const counter = await firstValueFrom(
      this.client.send<number>('men', message),
    );
    console.log('Counter value:', counter);
    return counter.toString();
  }
}
