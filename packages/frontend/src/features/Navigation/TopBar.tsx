import React, { ReactElement } from 'react';
import { Icon } from '@iconify/react';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import LoginButton from '../../components/Login/LoginButton';
import LoginAccountButton from '../../components/Login/LoginAccountButton';
import { extractClassName } from './utils';


export interface NameAndIcon {
  readonly name: string;
  readonly rightIcon?: string;
  readonly leftIcon?: string;
  readonly classNames: Record<string, string>;
  readonly drawBorder?: boolean;
}

export interface TopIconButtonProps extends NameAndIcon {
  readonly href: string;
  readonly tooltip?: string;
}

const TopIconButton = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
  classNames = {},
  drawBorder = true,
}: NameAndIcon) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 ${drawBorder && 'border-r-2 border-base-max'} my-2`,
    button: 'flex flex-nowrap items-center align-middle border-b-2 hover:border-base-max border-transparent',
    leftIcon: 'text-primary-contrast pr-1',
    label: 'font-content text-primary-contrast block',
    rightIcon: 'text-secondary-contrast-lighter pl-1',
  };
  const mergedClassnames = mergeDefaultTailwindClassnames(classNamesDefaults, classNames);

  return (
    <div className={extractClassName('root', mergedClassnames)}>
    <div className={extractClassName('button', mergedClassnames)} role="button">
      {leftIcon ? (
        <Icon
          icon={leftIcon}
          className={extractClassName('leftIcon', mergedClassnames)}
        />
      ) : null}
      <p className={extractClassName('label', mergedClassnames)}> {name} </p>
      {rightIcon ? (
        <Icon
          icon={rightIcon}
          className={extractClassName('rightIcon', mergedClassnames)}
        />
      ) : null}
    </div>
    </div>
  );
};

const processTopBarItems = (
  items: TopIconButtonProps[],
  showLogin: boolean,
): ReactElement[] => {
  return items.reduce(
    (acc: ReactElement[], item: TopIconButtonProps, index: number) => {
      const needsBorder = !(index === items.length - 1 && !showLogin);
      acc.push(
        <a className="flex" href={item.href} key={`${item.href}_${item.name}`}>
          {' '}
          <TopIconButton
            name={item.name}
            leftIcon={item.leftIcon}
            rightIcon={item.rightIcon}
            classNames={item.classNames}
            drawBorder={needsBorder}
          />{' '}
        </a>,
      );
      return acc;
    },
    [],
  );
};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
  readonly showLogin?: boolean;
  readonly classNames?: Record<string, string>;
}

const TopBar = ({ items, showLogin = false, classNames = {} }: TopBarProps) => {
  const classNamesDefaults = {
    root: 'flex justify-end items-center align-middle w-100 bg-primary',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(classNamesDefaults, classNames);
  return (
    <div>
      <header className={extractClassName('root', mergedClassnames)}>
        <nav className="flex items-center align-middle">
          {processTopBarItems(items, showLogin)}
          {showLogin ? <LoginAccountButton /> : null}
          {showLogin ? <LoginButton /> : null}
        </nav>
      </header>
    </div>
  );
};

export default TopBar;
