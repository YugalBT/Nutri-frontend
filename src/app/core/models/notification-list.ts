export interface NotificationList {
  id: string;
  body: string;
  subject: string;
  isReaded: boolean;
  createdDate: string;
  type: string;
  typeId: string;
  userId?: any;
}
