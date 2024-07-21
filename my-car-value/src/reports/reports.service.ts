import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepo: Repository<Report>,
  ) {}

  async createEstimate(estimateDto: GetEstimateDto) {
    const { make, model, lat, lng, mileage, year } = estimateDto;

    return this.reportsRepo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 4', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .getRawOne();
  }

  async create(reportDto: CreateReportDto, user: User) {
    const report = this.reportsRepo.create(reportDto);
    console.log('user', user);
    report.user = user;

    return this.reportsRepo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.reportsRepo.findOne({
      where: {
        id: Number(id),
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.approved = approved;

    return this.reportsRepo.save(report);
  }
}
