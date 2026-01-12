import { SIDEBAR_ICONS } from "./svg-icons";


export const SIDEBAR_GROUPS = [
  {
    key: 'access',
    title: 'sidebarmenu.access',
    icon: SIDEBAR_ICONS.ACCESS,
    items: ['Users', 'Roles', 'Companies']
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
    items: ['Feed', 'Ration', 'Animal Type', 'Animal Lactation Stage']
  },
  {
    key: 'templateBuilder',
    title: 'sidebarmenu.templateBuilder',
    icon: SIDEBAR_ICONS.TEMPLATE_BUILDER,
    items: [
      // 'Email Template Builder',
      'template',
    ]
  },
  {
    key: 'formulas',
    title: 'sidebarmenu.formulas',
    icon: SIDEBAR_ICONS.FORMULAS,
    items: [
      // 'Formula Builder',
      'operators',
      'formulas',
      'Kpi'
    ]
  },


  {
    key: 'reports',
    title: 'sidebarmenu.reports',
    icon: SIDEBAR_ICONS.REPORTS,
    items: [
      'Reports',
      'TechnicalReport',
      'EconomicReport'
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
    items: ['Profile', 'Change Password', 'Setting', 'Module', 'EmailConfiguration', 'Language']
  },

];
