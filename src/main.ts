import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './adapter/SocketIoAdapter';
import { PeerServer } from 'peer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new SocketIoAdapter(app, true));
  await app.listen(3000);
  await PeerServer({ port: 3001 });
}
bootstrap();
