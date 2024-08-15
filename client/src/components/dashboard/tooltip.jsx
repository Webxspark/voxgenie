import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

const WxpToolTip = ({ children, title, side = "top", asChild = false, className, sparkVariant = false, ...props }) => {
    return (
        <TooltipProvider delayDuration={0} {...props}>
            <Tooltip>
                <TooltipTrigger asChild={asChild}>
                    {children}
                </TooltipTrigger>
                <TooltipContent className={cn(className, sparkVariant === true && "bg-white border shadow text-black my-1")} side={side}>
                    {title}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default WxpToolTip;