export interface TemplatePlaceholderMappingList {
    id: string;
    categoryId: string;
    categoryName?: string;
    placeholders?: Placeholder[];
    isActive: boolean;
}
export interface Placeholder {
  placeholderId: string;
  placeholderValue: string;
  isActive: boolean;
}

