import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService] // the assignments module will need to inject FilesService too.

})
export class FilesModule {}
