import { NestFactory } from '@nestjs/core';
import { CounterModule } from './counter/counter.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CounterModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        debug: true,
      },
    },
  );
  app.listen();
  console.log('Counter microservice is listening');
}
bootstrap();
