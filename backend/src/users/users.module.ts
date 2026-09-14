import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  // imports:[AuthModule], // Circular dependency =>  AuthMoule already imports UserModule Two modules importing each other directly.
  // The standard fix is forwardRef(),tells Nest "these two depend on each other, resolve them lazily instead of trying to fully build one before the other.

  imports: [forwardRef(() => AuthModule)],

  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
