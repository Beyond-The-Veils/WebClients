import React from 'react';
import { c } from 'ttag';
import { Button, classnames } from 'react-components';
import { UserSettings } from 'proton-shared/lib/interfaces';
import { DENSITY } from 'proton-shared/lib/constants';

import { Filter } from '../../models/tools';

interface Props {
    loading?: boolean;
    filter: Filter;
    userSettings: UserSettings;
    onFilter: (filter: Filter) => void;
}

const FilterButtons = ({ loading, filter = {}, userSettings, onFilter }: Props) => {
    const noFilterApply = !Object.values(filter).length;

    const isCompactView = userSettings.Density === DENSITY.COMPACT;

    const FILTER_OPTIONS = {
        SHOW_ALL: c('Filter option').t`All`,
        SHOW_UNREAD: c('Filter option').t`Unread`,
        SHOW_READ: c('Filter option').t`Read`,
        SHOW_MOVED_MESSAGE: c('Filter option').t`Show moved message`,
        HIDE_MOVED_MESSAGE: c('Filter option').t`Hide moved message`,
    };

    return (
        <div>
            <Button
                data-testid="filter-dropdown:show-all"
                size="small"
                shape="ghost"
                loading={loading}
                aria-pressed={noFilterApply}
                className={classnames([
                    'text-sm mt0 mb0 mr0-25',
                    noFilterApply && 'no-pointer-events bg-strong',
                    isCompactView ? 'ml1' : 'ml0-5',
                ])}
                onClick={() => !noFilterApply && onFilter({})}
            >
                {FILTER_OPTIONS.SHOW_ALL}
            </Button>
            <Button
                data-testid="filter-dropdown:show-read"
                size="small"
                shape="ghost"
                loading={loading}
                aria-pressed={filter.Unread === 0}
                className={classnames([
                    'text-sm mt0 mb0 no-tablet no-mobile mr0-25',
                    filter.Unread === 0 && 'no-pointer-events bg-strong',
                ])}
                onClick={() => filter.Unread !== 0 && onFilter({ Unread: 0 })}
            >
                {FILTER_OPTIONS.SHOW_READ}
            </Button>
            <Button
                data-testid="filter-dropdown:show-unread"
                size="small"
                shape="ghost"
                loading={loading}
                aria-pressed={filter.Unread === 1}
                className={classnames(['text-sm mt0 mb0', filter.Unread === 1 && 'no-pointer-events bg-strong'])}
                onClick={() => filter.Unread !== 1 && onFilter({ Unread: 1 })}
            >
                {FILTER_OPTIONS.SHOW_UNREAD}
            </Button>
        </div>
    );
};

export default FilterButtons;
