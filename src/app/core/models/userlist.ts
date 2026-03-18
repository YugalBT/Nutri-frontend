export interface UserList {
	firstName?: string;
	lastName?: string;
	ghlUserId?: string;
	suffix?: string;
	email?: string;
	phone?: string;
	roleId?: string;
	roleName?: string;
	userId?: string;
	userName?: string;
	tenantId?: string;
	isActive?: boolean;
	isTenantAdmin?: boolean;
	jobTitle?: string;
	jobTitleName?: string;
	[key: string]: any;
}
