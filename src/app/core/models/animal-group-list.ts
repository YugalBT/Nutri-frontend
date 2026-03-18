export interface AnimalGroupList {
    animalGroupId: string
    farmId: string
    farmName: string
    animalTypeId: string
    typeNameEn: string
    animalLactationId: string
    lactationNameEn: string
    animalGroupNameEn: string
    avgMilkPerDay: any
    numberOfAnimal: any
    isActive: boolean,
    [key: string]: any;
}
