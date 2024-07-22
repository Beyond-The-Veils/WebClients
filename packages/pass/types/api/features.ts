import type { MaybeNull } from '@proton/pass/types/utils';

export enum PassFeature {
    PassEnableDesktopAutoUpdate = 'PassEnableDesktopAutoUpdate',
    PassEnableOrganizationExport = 'PassEnableOrganizationExport',
    PassEnableOrganizationSharing = 'PassEnableOrganizationSharing',
    PassItemHistoryV1 = 'PassItemHistoryV1',
    PassMonitor = 'PassSentinelV1',
    PassPinningV1 = 'PassPinningV1',
    PassPublicLinkV1 = 'PassPublicLinkV1',
    PassRemovePrimaryVault = 'PassRemovePrimaryVault',
    PassSharingNewUsers = 'PassSharingNewUsers',
    PassSharingV1 = 'PassSharingV1',
    PassUsernameSplit = 'PassUsernameSplit',
    PassWebInternalAlpha = 'PassWebInternalAlpha',
    PassWebOfflineMode = 'PassWebOfflineMode',
    PassAccessKeyV1 = 'PassAccessKeyV1',
    PassIdentityV1 = 'PassIdentityV1',
}

export const PassFeaturesValues = Object.values(PassFeature);

/* Unleash response types */
export type FeatureFlagPayload = {
    type: string;
    value: string;
};

export type FeatureFlagVariant = {
    name: string;
    enabled: boolean;
    payload: MaybeNull<FeatureFlagPayload>;
};

export type FeatureFlagToggle = {
    name: string;
    variant: FeatureFlagVariant;
};

export type FeatureFlagsResponse = {
    Code: number;
    toggles: FeatureFlagToggle[];
};
