export class DateHelper {
  static format(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.setDate(date.getDate() + days));
  }

  static isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }
}
