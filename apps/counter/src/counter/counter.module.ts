import { Logger, Module } from '@nestjs/common';
import { CounterController } from './counter.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COUNTER_SERVICE',
        transport: Transport.NATS,
        options: {
          debug: true,
        },
      },
    ]),
  ],
  controllers: [CounterController],
})
export class CounterModule {
  private logger = new Logger('CounterModule');
  constructor() {
    this.logger.log('Counter module initialized');
  }
}
