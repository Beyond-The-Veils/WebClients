import type { FC, PropsWithChildren, ReactNode } from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleHeader,
    CollapsibleHeaderIconButton,
    Icon,
} from '@proton/components/components';

type CollapsibleHeaderProps = PropsWithChildren & {
    label: string;
    expanded?: boolean;
    suffix?: ReactNode;
};

export const CollapsibleItem: FC<CollapsibleHeaderProps> = ({ children, label, expanded = false, suffix }) => (
    <Collapsible expandByDefault={expanded}>
        <CollapsibleHeader className="flex flex-nowrap justify-space-between mb-2 color-weak" suffix={suffix}>
            <div>
                <CollapsibleHeaderIconButton className="color-weak">
                    <Icon name="chevron-down" />
                </CollapsibleHeaderIconButton>
                {label}
            </div>
        </CollapsibleHeader>
        <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
);
