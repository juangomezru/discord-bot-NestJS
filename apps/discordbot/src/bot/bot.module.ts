import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { Client, GatewayIntentBits } from 'discord.js';
import { BaseHandler } from './handlers/base.handler';
import { MESSAGE_HANDLER_METADATA_KEY } from './bot.constant';
import { TestHandler } from './handlers/test.hanlder';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscoveryModule,
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
  providers: [TestHandler],
})
export class BotModule implements OnModuleInit {
  private instanceByMessage: { [message: string]: BaseHandler };
  private logger = new Logger();

  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit() {
    this.discoveryHandlers();
    this.setupDiscordBot();
  }

  private discoveryHandlers() {
    this.instanceByMessage = this.discoveryService.getProviders().reduce<{
      [message: string]: BaseHandler;
    }>((acc, { metatype, instance }) => {
      if (!metatype) {
        return acc;
      }

      const metadata = Reflect.getMetadata(
        MESSAGE_HANDLER_METADATA_KEY,
        metatype,
      );
      if (!metadata) {
        return acc;
      }

      acc[metadata] = instance;

      return acc;
    }, {});
  }

  private setupDiscordBot() {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    client.on('messageCreate', async (message) => {
      if (message.author.bot) {
        return;
      }

      const foundInstance = this.instanceByMessage[message.content];
      if (foundInstance) {
        await message.reply(await foundInstance.process(message));
        return;
      }

      this.logger.log(`No message handler found for "${message.content}"`);
    });
    client.on('ready', () => {
      this.logger.log('Bot is listening...');
    });
    void client.login(this.configService.get<string>('BOT_TOKEN'));
  }
}
