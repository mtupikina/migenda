import { Controller, Get } from '@nestjs/common';
import type { PublicStats } from '@migenda/shared';

import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  list(): Promise<PublicStats> {
    return this.stats.publicCounts();
  }
}
