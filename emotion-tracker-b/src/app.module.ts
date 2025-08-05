import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { EmotionModule } from './emotion/emotion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Emotion } from './emotion/entities/emotion.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: String(process.env.DATABASE_TYPE) as "mysql",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Emotion],
      synchronize: true,
      logger: process.env.NODE_ENV == "product" ? "advanced-console" : "debug"
    }),
    UsersModule, EmotionModule, AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
