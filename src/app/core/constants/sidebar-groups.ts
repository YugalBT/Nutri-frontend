import { SIDEBAR_ICONS } from "./svg-icons";


export const SIDEBAR_GROUPS = [
  {
    key: 'access',
    title: 'sidebarmenu.access',
    icon: SIDEBAR_ICONS.ACCESS,
    items: ['Users', 'Roles',]
  },
  {
    key: 'farm', title: 'sidebarmenu.feeding', icon: SIDEBAR_ICONS.FARM,
    items: ['Animal Group', 'Feed', 'CalfBarn', 'Ration', 'Animal Type',
      'Animal Lactation Stage', 'Archive Economic', 'ECO Archive', 'Daily Entry', 'Calves Entry']
  },
  {
    key: 'consultation',
    title: 'sidebarmenu.consultation',
    icon: SIDEBAR_ICONS.FARM,
    items: ['Parti', 'Sanita', 'Fertilita',]
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
    key: 'archive',
    title: 'sidebarmenu.archive',
    icon: SIDEBAR_ICONS.ARCHIVE,
    items: [
      'Archive Technical',
      'Archive Eco',
      'Milk Price'

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
  // {
  //   key: 'supplier',
  //   title: 'sidebarmenu.supplier',
  //   icon: SIDEBAR_ICONS.SUPPLIER,
  //   items: [
  //     'Suppliers',
  //     'Materials',
  //     'Product',
  //     'PricingFormula',
  //     'Product Pricing',
  //     'SupplierPrice',
  //     'Pricing Setting',
  //     'Product Build'


  //   ]
  // },
  {
    key: 'supplierMaster',
    title: 'sidebarmenu.supplierMaster',
    icon: SIDEBAR_ICONS.SUPPLIER_MASTER,
    items: [
      'Suppliers',
      'Materials',
      'Product'
    ]
  },
  {
    key: 'pricing',
    title: 'sidebarmenu.pricing',
    icon: SIDEBAR_ICONS.PRICING,
    items: [
      'SupplierPrice',
      'Product Pricing',
      'Pricing Setting'
    ]
  },
  {
    key: 'production',
    title: 'sidebarmenu.production',
    icon: SIDEBAR_ICONS.PRODUCTION,
    items: [
      'PricingFormula',
      'Product Build'
    ]
  },

  {
    key: 'settings',
    title: 'sidebarmenu.settings',
    icon: SIDEBAR_ICONS.SETTINGS,
    items: ['Profile', 'Change Password', 'Setting', 'Module', 'Email Configuration', 'Language']
  },

];
