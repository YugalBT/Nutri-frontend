import { SIDEBAR_ICONS } from "./svg-icons";


export const SIDEBAR_GROUPS = [
  {
    key: 'access',
    title: 'sidebarmenu.access',
    icon: SIDEBAR_ICONS.ACCESS,
    items: ['Users', 'Roles','Companies']
  },
  {
    key: 'farm',
    title: 'sidebarmenu.farm',
    icon: SIDEBAR_ICONS.FARM,
    items: ['Farm', 'Animal Group', 'Day']
  },
  {
    key: 'nutrition',
    title: 'sidebarmenu.nutrition',
    icon: SIDEBAR_ICONS.NUTRITION,
    items: ['Feed', 'Ration','Animal Type','Animal Lactation Stage']
  },
   {
    key: 'reports',
    title: 'sidebarmenu.reports',
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
    title: 'sidebarmenu.settings',
    icon: SIDEBAR_ICONS.SETTINGS,
    items: ['Profile', 'Change Password','Setting','Module']
  },
 
];
