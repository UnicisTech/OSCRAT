import React, { useState } from 'react';
import classNames from 'classnames';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';

export interface MenuItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
  children?: MenuItem[];
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: MenuItem[];
}

interface NavigationItemProps {
  menu: MenuItem;
  className?: string;
}

const NavigationItems = ({ menus }: NavigationItemsProps) => {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-1">
      {menus.map((menu) => (
        <li key={menu.name}>
          {menu.name === 'line-break' ? (
            <hr className="border-line my-1 border-t" />
          ) : (
            <NavigationItem menu={menu} className={menu.className || ''} />
          )}
        </li>
      ))}
    </ul>
  );
};

const NavigationItem = ({
  menu,
  className,
  level = 0,
}: NavigationItemProps & { level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const content = (
    <div
      onClick={menu.children ? toggleSubmenu : undefined}
      className={`text-content hover:bg-surface-muted flex cursor-pointer items-center justify-between gap-2 rounded p-2 px-2 text-sm ${
        menu.active ? 'bg-surface-muted font-semibold' : ''
      } ${className}`}
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <div className="flex items-center gap-2">
        {menu.icon && (
          <menu.icon
            className={classNames({
              'h-5 w-5 shrink-0': true,
              'text-primary': menu.active,
              [className as string]: true,
            })}
            aria-hidden="true"
          />
        )}
        <span>{menu.name}</span>
      </div>
      {menu.children && (
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );

  return (
    <>
      {menu.href && !menu.children ? (
        <Link href={menu.href}>{content}</Link>
      ) : (
        content
      )}
      {menu.children && isOpen && (
        <ul className="ml-2 mt-1 flex flex-col gap-1">
          {menu.children.map((child) => (
            <li key={child.name}>
              <NavigationItem menu={child} className="pl-4" level={level + 1} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default NavigationItems;
