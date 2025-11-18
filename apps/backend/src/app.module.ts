import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MenuService } from './menu/menu.service';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, MenuModule],
  providers: [MenuService],
})
export class AppModule {}
