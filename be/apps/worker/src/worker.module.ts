import { Logger, Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

@Module({
  imports: [],
  controllers: [WorkerController],
  providers: [WorkerController, WorkerService],
})
export class WorkerModule {}
