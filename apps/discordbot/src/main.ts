import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot/bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BotModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        debug: true,
      },
    },
  );
  app.listen();
  console.log('Bot microservice is listening');
}

void bootstrap();
