import { SIDEBAR_ICONS } from "./svg-icons";


export const SIDEBAR_GROUPS = [
  {
    key: 'access',
    title: 'User & Access',
    icon: SIDEBAR_ICONS.ACCESS,
    items: ['Users', 'Roles','Companies']
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
    key: 'reports',
    title: 'Reports & Analytics',
    icon: SIDEBAR_ICONS.REPORTS,
    items: [
      'Reports',
      // 'Monthly Report',
      // 'Cost vs Income',
      // 'Margin Analysis',
      // 'Production Trends'
    ]
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: SIDEBAR_ICONS.SETTINGS,
    items: ['Profile', 'Change Password','Setting','Module']
  },
 
];
