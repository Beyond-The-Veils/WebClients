import { type FC, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router-dom';

import { c } from 'ttag';

import { InlineLinkButton } from '@proton/atoms';
import { useAppState } from '@proton/pass/components/Core/AppStateProvider';
import { useAuthStore } from '@proton/pass/components/Core/AuthStoreProvider';
import { useConnectivity } from '@proton/pass/components/Core/ConnectivityProvider';
import { LockProbeProvider } from '@proton/pass/components/Core/LockProbeProvider';
import { BottomBar } from '@proton/pass/components/Layout/Bar/BottomBar';
import { PasswordUnlockProvider } from '@proton/pass/components/Lock/PasswordUnlockProvider';
import { PinUnlockProvider } from '@proton/pass/components/Lock/PinUnlockProvider';
import { clientOffline } from '@proton/pass/lib/client';
import { offlineResume } from '@proton/pass/store/actions';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import noop from '@proton/utils/noop';

import { useAuthService } from './Auth/AuthServiceProvider';
import { useServiceWorkerState } from './ServiceWorker/client/ServiceWorkerProvider';
import { Main } from './Views/Main';
import { PublicSwitch } from './Views/Public/PublicSwitch';

export const AppGuard: FC = () => {
    const dispatch = useDispatch();
    const { state } = useAppState();
    const authStore = useAuthStore();

    const status = useRef(state.status);
    status.current = state.status;

    const online = useConnectivity();
    const auth = useAuthService();
    const updateAvailable = useServiceWorkerState()?.updateAvailable ?? false;

    const handleProbe = useCallback(() => auth.checkLock().catch(noop), []);

    useEffect(() => {
        const localID = authStore?.getLocalID();
        if (online && clientOffline(status.current)) dispatch(offlineResume.intent({ localID }));
    }, [online]);

    return (
        <>
            <Route
                path="*"
                render={() =>
                    state.booted ? (
                        <LockProbeProvider onProbe={handleProbe}>
                            <PasswordUnlockProvider>
                                <PinUnlockProvider>
                                    <Main />
                                </PinUnlockProvider>
                            </PasswordUnlockProvider>
                        </LockProbeProvider>
                    ) : (
                        <PublicSwitch />
                    )
                }
            />

            {online && updateAvailable && (
                <BottomBar
                    className="bg-danger absolute bottom-0"
                    text={
                        <span className="text-center">
                            {c('Info')
                                .t`A new version of ${PASS_APP_NAME} is available. Update it to enjoy the latest features and bug fixes.`}
                            <InlineLinkButton className="text-semibold px-1" onClick={() => window.location.reload()}>
                                {c('Action').t`Reload`}
                            </InlineLinkButton>
                        </span>
                    }
                />
            )}
        </>
    );
};
