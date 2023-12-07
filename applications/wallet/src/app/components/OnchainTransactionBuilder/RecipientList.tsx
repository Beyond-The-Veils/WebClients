import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Input } from '@proton/atoms/Input';
import { ButtonGroup } from '@proton/components/components';

import { WasmRecipient } from '../../../pkg';
import { AccountWithBlockchainData, BitcoinUnit } from '../../types';
import { getAccountBalance } from '../../utils';
import { useOnchainTransactionBuilder } from './useOnchainTransactionBuilder';

interface Props {
    selectedAccount?: AccountWithBlockchainData;
    recipients: WasmRecipient[];
    onRecipientAddition: ReturnType<typeof useOnchainTransactionBuilder>['addRecipient'];
    onRecipientUpdate: ReturnType<typeof useOnchainTransactionBuilder>['updateRecipient'];
    onRecipientRemove: ReturnType<typeof useOnchainTransactionBuilder>['removeRecipient'];
}

export const RecipientList = ({
    selectedAccount,
    recipients,
    onRecipientUpdate,
    onRecipientAddition,
    onRecipientRemove,
}: Props) => {
    return (
        <ul className="unstyled m-0 my-4 p-0 h-custom overflow-y-auto" style={{ '--h-custom': '14rem' }}>
            {recipients.map((recipient, index) => {
                const isLastRecipientItem = index === recipients.length - 1;

                return (
                    <li className="overflow-hidden py-3 border-bottom border-weak" key={recipient[0]}>
                        <div className="flex flex-row">
                            <div className="w-2/3">
                                <Input
                                    data-testid="recipient-address-input"
                                    placeholder={c('Wallet Send').t`Recipient address`}
                                    value={recipient[1]}
                                    onChange={(event) => {
                                        onRecipientUpdate(index, { address: event.target.value });
                                    }}
                                />
                            </div>
                            <Button
                                className="ml-auto mr-2"
                                shape="underline"
                                color="norm"
                                onClick={
                                    isLastRecipientItem ? () => onRecipientAddition() : () => onRecipientRemove(index)
                                }
                            >
                                {isLastRecipientItem
                                    ? c('Wallet Send').t`Add recipient`
                                    : c('Wallet Send').t`Remove recipient`}
                            </Button>
                        </div>
                        <div className="flex flex-row mt-2">
                            <div className="w-custom" style={{ '--w-custom': '10rem' }}>
                                <Input
                                    data-testid="recipient-amount-input"
                                    placeholder={c('Wallet Send').t`Amount`}
                                    type="number"
                                    value={Number(recipient[2])}
                                    onChange={(event) => {
                                        onRecipientUpdate(index, { amount: parseInt(event.target.value) });
                                    }}
                                />
                            </div>
                            <ButtonGroup className="ml-3">
                                <Button
                                    data-testid="recipient-sats-display-button"
                                    // selected={recipient.unit === BitcoinUnit.SATS} TODO: fix this
                                    onClick={() => {
                                        onRecipientUpdate(index, { unit: BitcoinUnit.SATS });
                                    }}
                                >
                                    SATS
                                </Button>
                                <Button
                                    data-testid="recipient-btc-display-button"
                                    // selected={recipient.unit === BitcoinUnit.BTC} TODO: fix this
                                    onClick={() => {
                                        onRecipientUpdate(index, { unit: BitcoinUnit.BTC });
                                    }}
                                >
                                    BTC
                                </Button>
                            </ButtonGroup>
                            {recipients.length === 1 && selectedAccount && (
                                <Button
                                    className="ml-3"
                                    shape="underline"
                                    color="norm"
                                    onClick={() => {
                                        onRecipientUpdate(index, {
                                            amount: getAccountBalance(selectedAccount),
                                        });
                                    }}
                                >{c('Wallet Send').t`Maximum amount`}</Button>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
