import {
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { MenuItem, NavigationProps } from './NavigationItems';

const UserNavigation = ({ activePathname }: NavigationProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-teams'),
      href: '/organization',
      icon: RectangleStackIcon,
      active: activePathname === '/organization',
    },
    {
      name: t('account'),
      href: '/settings/account',
      icon: UserCircleIcon,
      active: activePathname === '/settings/account',
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default UserNavigation;
