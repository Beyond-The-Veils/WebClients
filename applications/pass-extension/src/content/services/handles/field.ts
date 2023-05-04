import { fathom } from '@proton/pass/fathom/protonpass-fathom';
import type { ProxiedSettings } from '@proton/pass/store/reducers/settings';
import { findBoundingElement, isInputElement } from '@proton/pass/utils/dom';
import { createListenerStore } from '@proton/pass/utils/listener';
import noop from '@proton/utils/noop';

import { autofill } from '../../../shared/form';
import { withContext } from '../../context/context';
import type { FieldHandle, FormFieldTypeMap, FormHandle } from '../../types';
import { DropdownAction, FormField, FormType } from '../../types';
import { createFieldIconHandle } from './icon';

const { isVisible } = fathom.utils;

type CreateFieldHandlesOptions<T extends FormType, V extends FormField> = {
    formType: T;
    fieldType: V;
    getFormHandle: () => FormHandle;
};

export const canProcessAction = (action: DropdownAction, settings: ProxiedSettings): boolean => {
    switch (action) {
        case DropdownAction.AUTOFILL:
            return settings.autofill.inject;
        case DropdownAction.AUTOSUGGEST_ALIAS:
            return settings.autosuggest.email;
        case DropdownAction.AUTOSUGGEST_PASSWORD:
            return settings.autosuggest.password;
        default:
            return true;
    }
};

export const createFieldHandles =
    <T extends FormType, V extends FormField>({
        formType,
        fieldType,
        getFormHandle,
    }: CreateFieldHandlesOptions<T, V>) =>
    (element: FormFieldTypeMap[V]): FieldHandle => {
        /**
         * Since we're creating "field handles" for elements
         * that may include submit buttons as well : make sure
         * we're dealing with an HTMLInputElement for autofilling
         * and icon injection
         */
        const isInput = isInputElement(element);
        const listeners = createListenerStore();
        const boxElement = findBoundingElement(element);

        const field: FieldHandle = {
            formType,
            fieldType,
            element,
            boxElement,
            icon: null,
            action: null,
            value: element.value ?? '',
            getFormHandle,
            setValue: (value) => (field.value = value),
            autofill: isInput ? autofill(element) : noop,

            /* make sure the element is actually visible
             * as we may have detected a "hidden" field
             * in order to track it */
            attachIcon: withContext(({ getSettings, getState }, action) => {
                field.action = action;

                if (isVisible(field.element) && canProcessAction(action, getSettings())) {
                    const { status, loggedIn } = getState();
                    field.icon = field.icon ?? (isInput ? createFieldIconHandle({ field }) : null);
                    field.icon?.setStatus(status);
                    field.icon?.setAction(action);
                    if (!loggedIn) field.icon?.setCount(0);
                }
            }),

            detachIcon() {
                field.icon?.detach();
                field.icon = null;
            },

            sync: withContext(({ getSettings }) => {
                if (field.action === null) return;

                if (canProcessAction(field.action, getSettings())) return field.attachIcon(field.action);

                field.icon?.detach();
                field.icon = null;
            }),

            attachListeners: withContext(({ service: { iframe }, getSettings }, onSubmit) => {
                const onFocus = () => {
                    const settings = getSettings();
                    iframe.dropdown?.close(); /* dropdown might be open */

                    return (
                        settings.autofill.openOnFocus &&
                        iframe.dropdown?.open({
                            action: DropdownAction.AUTOFILL,
                            focus: true,
                            field,
                        })
                    );
                };

                if (formType === FormType.LOGIN) {
                    if (document.activeElement === field.element) onFocus();
                    listeners.addListener(field.element, 'focus', onFocus);
                }

                listeners.addListener(field.element, 'input', () => {
                    if (iframe.dropdown?.getState().visible) {
                        iframe.dropdown?.close();
                    }

                    field.setValue(element.value);
                });

                listeners.addListener(field.element, 'keydown', (e) => {
                    const { key } = e as KeyboardEvent;
                    return key === 'Enter' && onSubmit();
                });
            }),

            detachListeners: () => listeners.removeAll(),
        };

        return field;
    };
