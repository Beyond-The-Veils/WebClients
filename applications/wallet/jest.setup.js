import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

import '@proton/testing/lib/mockMatchMedia';
import '@proton/testing/lib/mockUnleash';

// Getting ReferenceError: TextDecoder is not defined without
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// FIXME: temporary workaround because I could not config jest in a way that allows us to run wasm
jest.mock('proton-wallet-web', () => ({
    __esModule: true,
    WasmError: {},
    WasmCoinSelection: {},
    WasmChangeSpendPolicy: {},
}));

// Do not start crypto worker pool, let the single tests setup/mock the CryptoProxy as needed
jest.mock('@proton/shared/lib/helpers/setupCryptoWorker', () => ({
    __esModule: true,
    loadCryptoWorker: jest.fn(),
}));

jest.mock('@proton/shared/lib/i18n/dateFnLocales', () => ({
    __esModule: true,
}));

jest.mock('@proton/shared/lib/pow/wasmWorkerWrapper.ts', () => ({
    __esModule: true,
}));

jest.mock('./src/app/locales.ts', () => ({
    __esModule: true,
    getLocaleMapping: () => 'en',
}));

jest.mock('@proton/shared/lib/pow/pbkdfWorkerWrapper.ts', () => ({
    __esModule: true,
}));
// That's an unresolved issue of jsdom https://github.com/jsdom/jsdom/issues/918
// In particular, we need this fix to render all the components that have PaymentMethodDetails in their trees
window.SVGElement.prototype.getBBox = jest.fn().mockReturnValue({ width: 0 });

// Some components use the metrics API. If we don't mock it, tests might fail in a seemingly random manner.
// For instance, a test covering a component with metrics might finish successfully, but a subsequent test
// could fail seconds later when the metrics batch is sent via fetch.
// The metrics package has its own test coverage, so we don't need to test it here.
jest.mock('@proton/metrics');
