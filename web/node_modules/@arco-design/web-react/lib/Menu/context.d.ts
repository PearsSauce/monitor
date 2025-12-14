/// <reference types="react" />
import { MenuProps } from './interface';
export declare type HotkeyInfo = {
    update: boolean;
    activeKeyPath: string[];
    type: 'sibling' | 'generation' | 'enter';
};
export declare type ResetHotkeyInfo = (activeKey?: string) => void;
declare const MenuContext: import("react").Context<Pick<MenuProps, "collapse" | "triggerProps" | "mode" | "inDropdown" | "icons" | "theme" | "levelIndent" | "selectedKeys" | "openKeys" | "tooltipProps" | "autoScrollIntoView" | "scrollConfig"> & {
    id?: string;
    prefixCls?: string;
    onClickMenuItem?: (key: string, event: any) => void;
    onClickSubMenu?: (key: string, level: number, type: 'pop' | 'inline') => void;
    collectInlineMenuKeys?: (key: string, unmount?: boolean) => void;
}>;
export default MenuContext;
