export class StorageHelper {
  static set(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static get(key: string): any {
    return JSON.parse(localStorage.getItem(key) || 'null');
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
