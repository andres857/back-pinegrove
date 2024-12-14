import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const corsOptions: CorsOptions = {
    // Permite todos los orígenes
    origin: '*',
    
    // Métodos HTTP permitidos
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
      'HEAD',
    ],
    
    // Permite enviar cookies y headers de autenticación
    credentials: true,
    
    // Headers permitidos
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
    ],
    
    // Tiempo que se guarda en caché la respuesta pre-flight
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 3600,
  };

  app.enableCors(corsOptions);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
