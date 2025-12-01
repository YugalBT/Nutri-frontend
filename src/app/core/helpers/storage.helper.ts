export class StorageHelper {
  static set(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  static get(key: string): any {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  }

  static remove(key: string): void {
    sessionStorage.removeItem(key);
  }
}
