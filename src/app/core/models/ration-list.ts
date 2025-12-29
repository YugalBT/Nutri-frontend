export interface RationList {
	rationId: string
	rationName: string
	createdAt: string
	totalItems: number
	isActive: boolean
	farmId: string
	farmName: string
	animalGroupId: string
	animalGroupNameEn: string
	items: Item[]
	[key: string]: any;
}


export interface Item {
	feedId: string
	feedName: string
	perKg: number
	dryMatter: number
	protein: number
}
