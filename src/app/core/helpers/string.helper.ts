export class StringHelper {

  static toTitleCase(text: string): string {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }
  
}
