import { PLANS } from '@proton/payments';
import { type Plan } from '@proton/shared/lib/interfaces';

import { getPlanByName } from './plans-map-wrapper';

describe('getPlan', () => {
    it('should return matching currency', () => {
        const prefferedCurrency = 'BRL';

        const plans: Plan[] = [
            {
                Name: PLANS.MAIL,
                Currency: 'CHF',
            } as Plan,
            {
                Name: PLANS.MAIL,
                Currency: 'USD',
            } as Plan,
            {
                Name: PLANS.MAIL,
                Currency: 'BRL',
            } as Plan,
        ];

        const plan = getPlanByName(plans, PLANS.MAIL, prefferedCurrency);
        expect(plan).toEqual({
            Name: PLANS.MAIL,
            Currency: 'BRL',
        });
    });

    it('should respect currency fallback', () => {
        const prefferedCurrency = 'BRL';

        const plans: Plan[] = [
            {
                Name: PLANS.MAIL,
                Currency: 'CHF',
            } as Plan,
            {
                Name: PLANS.MAIL,
                Currency: 'USD',
            } as Plan,
            {
                Name: PLANS.MAIL,
                Currency: 'EUR',
            } as Plan,
        ];

        const plan = getPlanByName(plans, PLANS.MAIL, prefferedCurrency);
        expect(plan).toEqual({
            Name: PLANS.MAIL,
            Currency: 'EUR',
        });
    });

    it('should return any currency if fallback currency does not exist', () => {
        const prefferedCurrency = 'BRL';

        const plans: Plan[] = [
            {
                Name: PLANS.MAIL,
                Currency: 'CHF',
            } as Plan,
            {
                Name: PLANS.MAIL,
                Currency: 'EUR',
            } as Plan,
        ];

        const plan = getPlanByName(plans, PLANS.MAIL, prefferedCurrency);
        expect(plan).toEqual({
            Name: PLANS.MAIL,
            Currency: 'EUR',
        });
    });
});
