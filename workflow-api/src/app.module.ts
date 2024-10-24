// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import dbConfig from './db/db.config';

@Module({
  imports: [
    // Load configuration globally and include the dbConfig
    ConfigModule.forRoot({ isGlobal: true, load: [dbConfig] }),
    DbModule,
    AuthModule,
    ItemsModule,
    UsersModule,
  ],
})
export class AppModule {}
