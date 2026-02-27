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
    items: ['Farm', 'Feed', 'Animal Type', 'Animal Lactation Stage']
  },
  // {
  //   key: 'nutrition',
  //   title: 'sidebarmenu.nutrition',
  //   icon: SIDEBAR_ICONS.NUTRITION,
  //   items: []
  // },
  {
    key: 'templateBuilder',
    title: 'sidebarmenu.templateBuilder',
    icon: SIDEBAR_ICONS.TEMPLATE_BUILDER,
    items: [
      // 'Email Template Builder',
      'Template',
    ]
  },
  {
    key: 'formulas',
    title: 'sidebarmenu.formulas',
    icon: SIDEBAR_ICONS.FORMULAS,
    items: [
      // 'Formula Builder',
      'Operators',
      'Formulas',
      'Kpi'
    ]
  },


  {
    key: 'reports',
    title: 'sidebarmenu.reports',
    icon: SIDEBAR_ICONS.REPORTS,
    items: [
      'Reports',
      'Technical Report',
      'Economic Report'
      // 'Monthly Report',
      // 'Cost vs Income',
      // 'Margin Analysis',
      // 'Production Trends'
    ]
  },
  {
  key: 'supplier',
  title: 'sidebarmenu.supplier',
  icon: SIDEBAR_ICONS.SUPPLIER,
  items: [
    'Suppliers',
    'Materials',
    'SupplierPrice',
    'PricingFormula',
    // 'Supplier Contracts'
  ]
},

  {
    key: 'settings',
    title: 'sidebarmenu.settings',
    icon: SIDEBAR_ICONS.SETTINGS,
    items: ['Profile', 'Change Password', 'Setting', 'Module', 'Email Configuration', 'Language']
  },

];
