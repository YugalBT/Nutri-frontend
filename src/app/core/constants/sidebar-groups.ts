import { SIDEBAR_ICONS } from "./svg-icons";


export const SIDEBAR_GROUPS = [
  {
    key: 'access',
    title: 'User & Access',
    icon: SIDEBAR_ICONS.ACCESS,
    items: ['Users', 'Roles','Companies','Module']
  },
  {
    key: 'farm',
    title: 'Farm Management',
    icon: SIDEBAR_ICONS.FARM,
    items: ['Farm', 'Animal Group', 'Day']
  },
  {
    key: 'nutrition',
    title: 'Nutrition Management',
    icon: SIDEBAR_ICONS.NUTRITION,
    items: ['Feed', 'Ration','Animal Type','Animal Lactation Stage']
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: SIDEBAR_ICONS.SETTINGS,
    items: ['Profile', 'Change Password','Setting']
  }
];
