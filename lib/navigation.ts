import type { NavigationItem } from '../types/navigation';

export const navigationItems: NavigationItem[] = [
  { title: 'Home', href: '/', description: 'Overview of the ATLAZ platform.' },
  { title: 'New Investigation', href: '/new', description: 'Start a new investigation workflow.' },
  { title: 'Context Building', href: '/context', description: 'Collect and organize context.' },
  { title: 'Workspace', href: '/workspace', description: 'View your investigation workspace.' },
];
