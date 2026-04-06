import { IsIn, IsNotEmpty } from 'class-validator';

export class TrafficStatsQueryDto {
  @IsNotEmpty({ message: 'mode est requis (day, month ou year)' })
  @IsIn(['day', 'month', 'year'], {
    message: 'mode doit être day, month ou year',
  })
  mode: 'day' | 'month' | 'year';
}
