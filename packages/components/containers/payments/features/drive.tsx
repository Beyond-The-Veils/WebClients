import { c } from 'ttag';

import {
    BRAND_NAME,
    CALENDAR_APP_NAME,
    CALENDAR_SHORT_APP_NAME,
    CONTACTS_SHORT_APP_NAME,
    DRIVE_APP_NAME,
    DRIVE_SHORT_APP_NAME,
    MAIL_APP_NAME,
    MAIL_SHORT_APP_NAME,
    PASS_APP_NAME,
    PASS_SHORT_APP_NAME,
    PLANS,
    VPN_SHORT_APP_NAME,
} from '@proton/shared/lib/constants';
import humanSize, { getSizeFormat } from '@proton/shared/lib/helpers/humanSize';
import type { FreePlanDefault, PlansMap } from '@proton/shared/lib/interfaces';
import { Audience } from '@proton/shared/lib/interfaces';

import type { PlanCardFeature, PlanCardFeatureDefinition } from './interface';

const getTb = (n: number) => {
    return `${n} ${getSizeFormat('TB', n)}`;
};

export const getFreeDriveStorageFeature = (freePlan: FreePlanDefault): PlanCardFeatureDefinition => {
    const totalStorageSize = humanSize({ bytes: freePlan.MaxDriveRewardSpace, fraction: 0 });
    return {
        text: c('storage_split: feature').t`Up to ${totalStorageSize} Drive storage`,
        tooltip: '',
        included: true,
        icon: 'storage',
    };
};

export const getFreeMailStorageFeature = (freePlan: FreePlanDefault): PlanCardFeatureDefinition => {
    const totalStorageSize = humanSize({ bytes: freePlan.MaxBaseRewardSpace, fraction: 0 });
    return {
        text: c('storage_split: feature').t`Up to ${totalStorageSize} Mail storage`,
        tooltip: c('storage_split: feature')
            .t`Storage for data generated by ${BRAND_NAME} ${MAIL_SHORT_APP_NAME}, ${CALENDAR_SHORT_APP_NAME}, ${CONTACTS_SHORT_APP_NAME}, and ${PASS_SHORT_APP_NAME}`,
        included: true,
        icon: 'storage',
    };
};

export const getStorageFeature = (
    bytes: number,
    options: {
        freePlan: FreePlanDefault;
        highlight?: boolean;
        boldStorageSize?: boolean;
        family?: boolean;
        duo?: boolean;
        visionary?: boolean;
        subtext?: boolean;
    }
): PlanCardFeatureDefinition => {
    const { highlight = false, boldStorageSize = false } = options;
    if (bytes === -1) {
        const freeBaseStorage = options.freePlan.MaxBaseRewardSpace;
        const freeDriveStorage = options.freePlan.MaxDriveRewardSpace;
        const driveStorageSize = humanSize({ bytes: freeDriveStorage, fraction: 0 });
        const baseStorageSize = humanSize({ bytes: freeBaseStorage, fraction: 0 });
        const totalStorageSize = humanSize({ bytes: freeDriveStorage + freeBaseStorage, fraction: 0 });
        return {
            text: c('new_plans: feature').t`Up to ${totalStorageSize} storage`,
            subtext: options.subtext
                ? `${baseStorageSize} ${MAIL_SHORT_APP_NAME} + ${driveStorageSize} ${DRIVE_SHORT_APP_NAME}`
                : undefined,
            included: true,
            icon: 'storage',
        };
    }

    // humanSize doesn't support TB and we don't want to add it yet because of "nice numbers" rounding issues.
    let humanReadableSize = humanSize({ bytes, fraction: 0 });
    if (options.duo) {
        humanReadableSize = getTb(1);
    } else if (options.visionary) {
        humanReadableSize = getTb(6);
    } else if (options.family) {
        humanReadableSize = getTb(3);
    }

    const size = boldStorageSize ? <b key="bold-storage-size">{humanReadableSize}</b> : humanReadableSize;
    const tooltip = options.family
        ? c('new_plans: tooltip')
              .t`Storage space is shared between users across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, ${DRIVE_APP_NAME}, and ${PASS_APP_NAME}`
        : c('new_plans: tooltip')
              .t`Storage space is shared across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, ${DRIVE_APP_NAME}, and ${PASS_APP_NAME}`;

    return {
        text: c('new_plans: feature').jt`${size} storage`,
        subtext: options.subtext ? c('storage_split: info').t`For all ${BRAND_NAME} services` : undefined,
        tooltip,
        included: true,
        highlight,
        icon: 'storage',
    };
};

export const getStorageBoostFeature = (bundleStorage: string): PlanCardFeatureDefinition => {
    return {
        icon: 'storage',
        text: c('new_plans: Upsell attribute').t`Boost your storage space to ${bundleStorage} total`,
        included: true,
    };
};

export const getStorageBoostFeatureB2B = (bundleStorage: string): PlanCardFeatureDefinition => {
    return {
        icon: 'storage',
        text: c('new_plans: Upsell attribute').t`Boost your storage space to ${bundleStorage} per user`,
        included: true,
    };
};

export const getStorageFeatureB2B = (
    bytes: number,
    options: {
        highlight?: boolean;
        subtext?: boolean;
        unit?: Parameters<typeof humanSize>[0]['unit'];
    }
): PlanCardFeatureDefinition => {
    const size = humanSize({ bytes, fraction: 0, unit: options.unit });

    return {
        text: c('new_plans: feature').t`${size} storage per user`,
        tooltip: c('new_plans: tooltip')
            .t`Storage space is shared across ${MAIL_APP_NAME}, ${CALENDAR_APP_NAME}, and ${DRIVE_APP_NAME}. Administrators can allocate different storage amounts to users in their organization`,
        subtext: options.subtext ? c('storage_split: info').t`For all ${BRAND_NAME} services` : undefined,
        included: true,
        highlight: options.highlight,
        icon: 'storage',
    };
};

export const getEndToEndEncryption = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`End-to-end encryption`,
        included: true,
    };
};

export const getVersionHistory = (options?: 'generic' | '30' | '365'): PlanCardFeatureDefinition => {
    if (options === '365' || options === '30') {
        return {
            text: c('new_plans: feature').t`${options}-day file and folders version history`,
            included: true,
        };
    }

    return {
        text: c('new_plans: feature').t`Version history`,
        included: true,
    };
};

export const getPremiumFeatures = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature')
            .t`Premium features of ${MAIL_SHORT_APP_NAME}/${CALENDAR_SHORT_APP_NAME}/${VPN_SHORT_APP_NAME}/${DRIVE_SHORT_APP_NAME}/${PASS_SHORT_APP_NAME}`,
        included: true,
    };
};

export const getDriveAppFeature = (options?: { family?: boolean; duo?: boolean }): PlanCardFeatureDefinition => {
    let tooltip = c('new_plans: tooltip')
        .t`${DRIVE_APP_NAME}: Secure your files with encrypted cloud storage. Includes automatic sync, encrypted file sharing, and more.`;

    if (options?.duo || options?.family) {
        tooltip = c('new_plans: tooltip')
            .t`Secure your files with encrypted cloud storage. Includes automatic sync, encrypted file sharing, and more.`;
    }

    return {
        text: DRIVE_APP_NAME,
        tooltip,
        included: true,
        icon: 'brand-proton-drive',
    };
};

const getShareFeature = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Share files with no size limit`,
        tooltip: c('new_plans: tooltip').t`Share your files or folders with anyone by using secure, shareable links`,
        included: true,
    };
};

const getSyncAndBackupFeature = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Sync and backup all your files across devices`,
        included: true,
    };
};

const getDocumentEditor = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Online document editor`,
        included: true,
    };
};

export const getCollaborate = (): PlanCardFeatureDefinition => {
    return {
        text: c('new_plans: feature').t`Collaborate and share large files`,
        included: true,
    };
};

export const getStorage = (plansMap: PlansMap, freePlan: FreePlanDefault): PlanCardFeature => {
    return {
        name: 'storage',
        plans: {
            [PLANS.FREE]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.BUNDLE]: getStorageFeature(plansMap[PLANS.BUNDLE]?.MaxSpace ?? 536870912000, {
                subtext: true,
                freePlan,
            }),
            [PLANS.MAIL]: getStorageFeature(plansMap[PLANS.MAIL]?.MaxSpace ?? 16106127360, { subtext: true, freePlan }),
            [PLANS.VPN]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.DRIVE]: getStorageFeature(plansMap[PLANS.DRIVE]?.MaxSpace ?? 214748364800, {
                subtext: true,
                freePlan,
            }),
            [PLANS.DRIVE_BUSINESS]: getStorageFeatureB2B(plansMap[PLANS.DRIVE_BUSINESS]?.MaxSpace ?? 1099511627776, {
                subtext: true,
                unit: 'TB',
            }),
            [PLANS.PASS]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.WALLET]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.FAMILY]: getStorageFeature(plansMap[PLANS.FAMILY]?.MaxSpace ?? 2748779069440, {
                family: true,
                subtext: true,
                freePlan,
            }),
            [PLANS.DUO]: getStorageFeature(plansMap[PLANS.DUO]?.MaxSpace ?? 1099511627776, {
                duo: true,
                subtext: true,
                freePlan,
            }),
            [PLANS.MAIL_PRO]: getStorageFeatureB2B(plansMap[PLANS.MAIL_PRO]?.MaxSpace ?? 16106127360, {
                subtext: true,
            }),
            [PLANS.MAIL_BUSINESS]: getStorageFeatureB2B(plansMap[PLANS.MAIL_BUSINESS]?.MaxSpace ?? 53687091200, {
                subtext: true,
            }),
            [PLANS.BUNDLE_PRO]: getStorageFeatureB2B(plansMap[PLANS.BUNDLE_PRO]?.MaxSpace ?? 536870912000, {
                subtext: true,
            }),
            [PLANS.BUNDLE_PRO_2024]: getStorageFeatureB2B(plansMap[PLANS.BUNDLE_PRO_2024]?.MaxSpace ?? 1099511627776, {
                subtext: true,
            }),
            [PLANS.PASS_PRO]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.PASS_BUSINESS]: getStorageFeature(-1, { subtext: true, freePlan }),
            [PLANS.VPN_PRO]: null,
            [PLANS.VPN_BUSINESS]: null,
        },
    };
};

export const getDriveFeatures = (plansMap: PlansMap, freePlan: FreePlanDefault): PlanCardFeature[] => {
    return [
        getStorage(plansMap, freePlan),
        {
            name: 'encryption',
            plans: {
                [PLANS.FREE]: getEndToEndEncryption(),
                [PLANS.BUNDLE]: getEndToEndEncryption(),
                [PLANS.MAIL]: getEndToEndEncryption(),
                [PLANS.VPN]: getEndToEndEncryption(),
                [PLANS.DRIVE]: getEndToEndEncryption(),
                [PLANS.DRIVE_BUSINESS]: getEndToEndEncryption(),
                [PLANS.WALLET]: getEndToEndEncryption(),
                [PLANS.PASS]: getEndToEndEncryption(),
                [PLANS.FAMILY]: getEndToEndEncryption(),
                [PLANS.DUO]: getEndToEndEncryption(),
                [PLANS.MAIL_PRO]: getEndToEndEncryption(),
                [PLANS.MAIL_BUSINESS]: getEndToEndEncryption(),
                [PLANS.BUNDLE_PRO]: getEndToEndEncryption(),
                [PLANS.BUNDLE_PRO_2024]: getEndToEndEncryption(),
                [PLANS.PASS_PRO]: getEndToEndEncryption(),
                [PLANS.PASS_BUSINESS]: getEndToEndEncryption(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
            },
        },
        {
            name: 'document-editor',
            target: Audience.B2B,
            plans: {
                [PLANS.FREE]: getDocumentEditor(),
                [PLANS.BUNDLE]: getDocumentEditor(),
                [PLANS.MAIL]: getDocumentEditor(),
                [PLANS.VPN]: getDocumentEditor(),
                [PLANS.DRIVE]: getDocumentEditor(),
                [PLANS.DRIVE_BUSINESS]: getDocumentEditor(),
                [PLANS.PASS]: getDocumentEditor(),
                [PLANS.WALLET]: getDocumentEditor(),
                [PLANS.FAMILY]: getDocumentEditor(),
                [PLANS.DUO]: getDocumentEditor(),
                [PLANS.MAIL_PRO]: getDocumentEditor(),
                [PLANS.MAIL_BUSINESS]: getDocumentEditor(),
                [PLANS.BUNDLE_PRO]: getDocumentEditor(),
                [PLANS.BUNDLE_PRO_2024]: getDocumentEditor(),
                [PLANS.PASS_PRO]: getDocumentEditor(),
                [PLANS.PASS_BUSINESS]: getDocumentEditor(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
            },
        },
        {
            name: 'share',
            plans: {
                [PLANS.FREE]: getShareFeature(),
                [PLANS.BUNDLE]: getShareFeature(),
                [PLANS.MAIL]: getShareFeature(),
                [PLANS.VPN]: getShareFeature(),
                [PLANS.DRIVE]: getShareFeature(),
                [PLANS.DRIVE_BUSINESS]: getShareFeature(),
                [PLANS.PASS]: getShareFeature(),
                [PLANS.WALLET]: getShareFeature(),
                [PLANS.FAMILY]: getShareFeature(),
                [PLANS.DUO]: getShareFeature(),
                [PLANS.MAIL_PRO]: getShareFeature(),
                [PLANS.MAIL_BUSINESS]: getShareFeature(),
                [PLANS.BUNDLE_PRO]: getShareFeature(),
                [PLANS.BUNDLE_PRO_2024]: getShareFeature(),
                [PLANS.PASS_PRO]: getShareFeature(),
                [PLANS.PASS_BUSINESS]: getShareFeature(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
            },
        },
        {
            name: 'sync-and-backup',
            plans: {
                [PLANS.FREE]: getSyncAndBackupFeature(),
                [PLANS.BUNDLE]: getSyncAndBackupFeature(),
                [PLANS.MAIL]: getSyncAndBackupFeature(),
                [PLANS.VPN]: getSyncAndBackupFeature(),
                [PLANS.DRIVE]: getSyncAndBackupFeature(),
                [PLANS.DRIVE_BUSINESS]: getSyncAndBackupFeature(),
                [PLANS.PASS]: getSyncAndBackupFeature(),
                [PLANS.WALLET]: getSyncAndBackupFeature(),
                [PLANS.FAMILY]: getSyncAndBackupFeature(),
                [PLANS.DUO]: getSyncAndBackupFeature(),
                [PLANS.MAIL_PRO]: getSyncAndBackupFeature(),
                [PLANS.MAIL_BUSINESS]: getSyncAndBackupFeature(),
                [PLANS.BUNDLE_PRO]: getSyncAndBackupFeature(),
                [PLANS.BUNDLE_PRO_2024]: getSyncAndBackupFeature(),
                [PLANS.PASS_PRO]: getSyncAndBackupFeature(),
                [PLANS.PASS_BUSINESS]: getSyncAndBackupFeature(),
                [PLANS.VPN_PRO]: null,
                [PLANS.VPN_BUSINESS]: null,
            },
        },
        {
            name: 'version-history',
            plans: {
                [PLANS.FREE]: null,
                [PLANS.BUNDLE]: null,
                [PLANS.MAIL]: null,
                [PLANS.VPN]: null,
                [PLANS.DRIVE]: null,
                [PLANS.DRIVE_BUSINESS]: getVersionHistory('365'),
                [PLANS.PASS]: null,
                [PLANS.WALLET]: null,
                [PLANS.FAMILY]: null,
                [PLANS.DUO]: null,
                [PLANS.MAIL_PRO]: getVersionHistory('30'),
                [PLANS.MAIL_BUSINESS]: getVersionHistory('30'),
                [PLANS.BUNDLE_PRO]: getVersionHistory('365'),
                [PLANS.BUNDLE_PRO_2024]: getVersionHistory('365'),
                [PLANS.PASS_PRO]: getVersionHistory('30'),
                [PLANS.PASS_BUSINESS]: getVersionHistory('30'),
                [PLANS.VPN_PRO]: getVersionHistory('30'),
                [PLANS.VPN_BUSINESS]: getVersionHistory('30'),
            },
        },
    ];
};
