import { Pipe, PipeTransform } from '@angular/core';
import { Level, SessionType } from '../../core/models/study-offer.models';

@Pipe({ name: 'levelLabel', standalone: true })
export class LevelLabelPipe implements PipeTransform {
  transform(value: Level | string): string {
    const map: Record<string, string> = {
      Beginner: 'Începător',
      Intermediate: 'Intermediar',
      Advanced: 'Avansat'
    };
    return map[value] ?? value;
  }
}

@Pipe({ name: 'sessionTypeLabel', standalone: true })
export class SessionTypeLabelPipe implements PipeTransform {
  transform(value: SessionType | string): string {
    const map: Record<string, string> = {
      Online: 'Online',
      OnSite: 'Față în față',
      Hybrid: 'Hibrid'
    };
    return map[value] ?? value;
  }
}
