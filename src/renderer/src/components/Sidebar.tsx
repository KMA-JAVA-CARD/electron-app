import { Home, ShoppingBag, Users, History, Settings, Leaf } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}) => (
  <Link
    to={to}
    className={clsx(
      'flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 group',
      active
        ? 'bg-emerald-500/10 text-emerald-500'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
    )}
  >
    <Icon className={clsx('w-6 h-6 mb-2', active && 'stroke-[2.5px]')} />
    <span className='text-xs font-medium'>{label}</span>
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingBag, label: 'POS' },
    { to: '/members', icon: Users, label: 'Members' },
    { to: '/transactions', icon: History, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className='w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 h-screen select-none'>
      <div className='mb-8 p-3 bg-emerald-500/10 rounded-2xl'>
        <Leaf className='w-8 h-8 text-emerald-500' />
      </div>

      <nav className='flex-1 flex flex-col gap-2 w-full px-2'>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.to}
          />
        ))}
      </nav>

      <div
        className='w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
        title='Card Reader Ready'
      />
    </div>
  );
};
