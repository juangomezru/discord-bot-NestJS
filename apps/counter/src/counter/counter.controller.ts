import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class CounterController {
  private counter = 0;

  constructor(@Inject('COUNTER_SERVICE') private client: ClientProxy) {}

  @MessagePattern('men')
  async handleMessage(): Promise<number> {
    this.counter += 1;
    console.log(`Message received. Current count: ${this.counter}`);
    this.client.emit('message_received', this.counter);
    return this.counter;
  }

  async onModuleInit() {
    await this.client.connect();
    console.log('Nats connected!');
  }
}
