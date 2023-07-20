import { type VFC, useCallback, useEffect, useState } from 'react';

import { c } from 'ttag';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import type { AliasState } from '@proton/pass/store';
import { createTelemetryEvent } from '@proton/pass/telemetry/events';
import { type MaybeNull, type RequiredNonNull, WorkerMessageType } from '@proton/pass/types';
import { TelemetryEventName } from '@proton/pass/types/data/telemetry';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import { wait } from '@proton/shared/lib/helpers/promise';
import noop from '@proton/utils/noop';

import { navigateToUpgrade } from '../../../../..//shared/components/upgrade/UpgradeButton';
import { AliasPreview } from '../../../../../shared/components/alias/Alias.preview';
import { useEnsureMounted } from '../../../../../shared/hooks/useEnsureMounted';
import { SubTheme } from '../../../../../shared/theme/sub-theme';
import { type IFrameMessage, IFrameMessageType } from '../../../../types';
import { useIFrameContext } from '../../context/IFrameContextProvider';
import { DropdownItem } from '../components/DropdownItem';

type Props = {
    prefix: string;
    domain: string;
    onMessage?: (message: IFrameMessage) => void;
    onOptions?: () => void;
};

const isValidAliasOptions = (
    options: MaybeNull<AliasState['aliasOptions']>
): options is RequiredNonNull<AliasState['aliasOptions']> => {
    return options !== null && options?.suffixes?.[0] !== undefined;
};

const getInitialLoadingText = (): string => c('Info').t`Generating alias...`;

export const AliasAutoSuggest: VFC<Props> = ({ prefix, domain, onOptions, onMessage }) => {
    const ensureMounted = useEnsureMounted();
    const { userEmail } = useIFrameContext();
    const [aliasOptions, setAliasOptions] = useState<MaybeNull<AliasState['aliasOptions']>>(null);
    const [needsUpgrade, setNeedsUpgrade] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<MaybeNull<string>>(getInitialLoadingText());
    const [error, setError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<MaybeNull<string>>(null);

    const requestAliasOptions = useCallback(async () => {
        try {
            setLoadingText(getInitialLoadingText());
            onOptions?.(); /* notify parent component if we need an iframe resize */
            setError(false);
            await wait(500);

            await sendMessage.onSuccess(contentScriptMessage({ type: WorkerMessageType.ALIAS_OPTIONS }), (response) => {
                if (response.options === null) {
                    throw new Error('alias options could not be resolved');
                }
                ensureMounted(setAliasOptions)(response.options);
                ensureMounted(setNeedsUpgrade)(response.needsUpgrade);
            });
            ensureMounted(setLoadingText)(null);
        } catch (_) {
            ensureMounted(setError)(true);
        } finally {
            onOptions?.(); /* notify parent component if we need an iframe resize */
        }
    }, []);

    const createAlias = useCallback(
        async ({ suffixes, mailboxes }: RequiredNonNull<AliasState['aliasOptions']>) => {
            const defaultSuffix = suffixes[0];

            setLoadingText(c('Info').t`Creating alias...`);
            const aliasEmail = `${prefix}${defaultSuffix.suffix}`;
            try {
                await sendMessage.onSuccess(
                    contentScriptMessage({
                        type: WorkerMessageType.ALIAS_CREATE,
                        payload: {
                            url: domain,
                            alias: {
                                prefix,
                                mailboxes: [mailboxes[0]],
                                signedSuffix: defaultSuffix.signedSuffix,
                                aliasEmail,
                            },
                        },
                    }),
                    (response) => {
                        if (response.ok) {
                            void sendMessage(
                                contentScriptMessage({
                                    type: WorkerMessageType.TELEMETRY_EVENT,
                                    payload: {
                                        event: createTelemetryEvent(TelemetryEventName.AutosuggestAliasCreated, {}, {}),
                                    },
                                })
                            );
                        }

                        if (!response.ok) {
                            ensureMounted(setErrorText)(response.reason);
                            throw new Error(response.reason);
                        }
                    }
                );

                ensureMounted(() => {
                    setLoadingText(null);
                    onMessage?.({
                        type: IFrameMessageType.DROPDOWN_AUTOFILL_EMAIL,
                        payload: { email: aliasEmail },
                    });
                })();
            } catch (err) {
                ensureMounted(setError)(true);
            } finally {
                onOptions?.(); /* notify parent component if we need an iframe resize */
            }
        },
        [domain]
    );

    useEffect(() => {
        wait(500).then(requestAliasOptions).catch(noop);
    }, []);

    useEffect(() => {
        if (error) setLoadingText(null);
        if (!error) setErrorText(null);
    }, [error]);

    const validAliasOptions = isValidAliasOptions(aliasOptions);

    return (
        <>
            <DropdownItem
                title={c('Title').t`Use my email`}
                disabled={!userEmail}
                subTitle={
                    userEmail ?? (
                        <span className="block flex flex-align-items-center">
                            <CircleLoader className="mr-1" />
                            <span>{c('Info').t`Loading...`}</span>
                        </span>
                    )
                }
                icon="envelope"
                onClick={
                    userEmail
                        ? () =>
                              onMessage?.({
                                  type: IFrameMessageType.DROPDOWN_AUTOFILL_EMAIL,
                                  payload: { email: userEmail },
                              })
                        : noop
                }
            />
            <DropdownItem
                title={needsUpgrade ? c('Info').t`Upgrade ${PASS_APP_NAME}` : c('Title').t`Hide my email`}
                autogrow
                subTitle={(() => {
                    if (loadingText) {
                        return (
                            <span className="block flex flex-align-items-center">
                                <CircleLoader className="mr-1" />
                                <span>{loadingText}</span>
                            </span>
                        );
                    }

                    if (needsUpgrade) {
                        return (
                            <span className="text-sm block">{c('Warning')
                                .t`Your plan does not allow you to create more aliases`}</span>
                        );
                    }

                    if (error) {
                        return (
                            <span className="color-danger block">
                                {errorText
                                    ? c('Error').t`Cannot create alias (${errorText}).`
                                    : c('Error').t`Cannot create alias.`}{' '}
                                <span className="text-semibold text-underline">{c('Action').t`Try again`}</span>
                            </span>
                        );
                    }

                    if (validAliasOptions) {
                        return (
                            <AliasPreview
                                prefix={prefix}
                                suffix={aliasOptions.suffixes[0].suffix}
                                standalone
                                key="alias-preview"
                            />
                        );
                    }
                })()}
                icon={needsUpgrade ? 'arrow-out-square' : 'alias'}
                subTheme={SubTheme.TEAL}
                disabled={loadingText !== null}
                onClick={(() => {
                    if (needsUpgrade) return navigateToUpgrade;
                    if (error) return requestAliasOptions;
                    if (validAliasOptions) return () => createAlias(aliasOptions);
                })()}
            />
        </>
    );
};
