import React from 'react';
import Group from './group';
import { ButtonProps } from './interface';
declare const ButtonComponent: React.ForwardRefExoticComponent<Partial<{
    htmlType?: "button" | "reset" | "submit";
} & import("./interface").BaseButtonProps & Omit<React.ButtonHTMLAttributes<any>, "type" | "className" | "onClick"> & {
    href: string;
    target?: string;
    anchorProps?: React.HTMLProps<HTMLAnchorElement>;
} & Omit<React.AnchorHTMLAttributes<any>, "type" | "className" | "onClick">> & React.RefAttributes<unknown>> & {
    __BYTE_BUTTON: boolean;
    Group: typeof Group;
};
export default ButtonComponent;
export { ButtonProps };
