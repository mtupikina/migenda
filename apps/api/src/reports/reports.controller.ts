import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { sessionId } from '../auth/session-id';
import { ReportQueryDto } from './report-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  report(@Req() req: Request, @Query() query: ReportQueryDto) {
    return this.reports.report(sessionId(req), query);
  }
}
