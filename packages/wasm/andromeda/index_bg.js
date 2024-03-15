let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_42(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h6a7b8ab4209ff952(arg0, arg1, addHeapObject(arg2));
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
*/
export function setPanicHook() {
    wasm.setPanicHook();
}

/**
* @param {string} word_start
* @returns {(string)[]}
*/
export function getWordsAutocomplete(word_start) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(word_start, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.getWordsAutocomplete(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4, 4);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_419(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h3d4c9ff356446c61(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const WasmPaymentLinkKind = Object.freeze({ BitcoinAddress:0,"0":"BitcoinAddress",BitcoinURI:1,"1":"BitcoinURI",LightningURI:2,"2":"LightningURI",UnifiedURI:3,"3":"UnifiedURI", });
/**
*/
export const WasmKeychainKind = Object.freeze({
/**
* External keychain, used for deriving recipient addresses.
*/
External:0,"0":"External",
/**
* Internal keychain, used for deriving change addresses.
*/
Internal:1,"1":"Internal", });
/**
*/
export const WasmCoinSelection = Object.freeze({ BranchAndBound:0,"0":"BranchAndBound",LargestFirst:1,"1":"LargestFirst",OldestFirst:2,"2":"OldestFirst",Manual:3,"3":"Manual", });
/**
*/
export const WasmWordCount = Object.freeze({ Words12:0,"0":"Words12",Words15:1,"1":"Words15",Words18:2,"2":"Words18",Words21:3,"3":"Words21",Words24:4,"4":"Words24", });
/**
*/
export const WasmError = Object.freeze({ AccountNotFound:0,"0":"AccountNotFound",ApiError:1,"1":"ApiError",AddUtxoError:2,"2":"AddUtxoError",BdkError:3,"3":"BdkError",Bip32Error:4,"4":"Bip32Error",Bip39Error:5,"5":"Bip39Error",CannotBroadcastTransaction:6,"6":"CannotBroadcastTransaction",CannotComputeTxFees:7,"7":"CannotComputeTxFees",CannotGetFeeEstimation:8,"8":"CannotGetFeeEstimation",CannotCreateAddressFromScript:9,"9":"CannotCreateAddressFromScript",CannotFindPersistedData:10,"10":"CannotFindPersistedData",CannotGetAddressFromScript:11,"11":"CannotGetAddressFromScript",CannotGetLocalStorage:12,"12":"CannotGetLocalStorage",CannotParsePersistedData:13,"13":"CannotParsePersistedData",CannotPersistData:14,"14":"CannotPersistData",CannotSerializePersistedData:15,"15":"CannotSerializePersistedData",CannotSignPsbt:16,"16":"CannotSignPsbt",CreateTxError:17,"17":"CreateTxError",DerivationError:18,"18":"DerivationError",DescriptorError:19,"19":"DescriptorError",InsufficientFunds:20,"20":"InsufficientFunds",InvalidAccountIndex:21,"21":"InvalidAccountIndex",InvalidAddress:22,"22":"InvalidAddress",InvalidData:23,"23":"InvalidData",InvalidDescriptor:24,"24":"InvalidDescriptor",InvalidDerivationPath:25,"25":"InvalidDerivationPath",InvalidNetwork:26,"26":"InvalidNetwork",InvalidTxId:27,"27":"InvalidTxId",InvalidScriptType:28,"28":"InvalidScriptType",InvalidSecretKey:29,"29":"InvalidSecretKey",InvalidMnemonic:30,"30":"InvalidMnemonic",LoadError:31,"31":"LoadError",NewWalletError:32,"32":"NewWalletError",NoWindowContext:33,"33":"NoWindowContext",OutpointParsingError:34,"34":"OutpointParsingError",SignerError:35,"35":"SignerError",SyncError:36,"36":"SyncError",TransactionNotFound:37,"37":"TransactionNotFound",WriteError:38,"38":"WriteError", });
/**
*/
export const WasmNetwork = Object.freeze({
/**
* Mainnet Bitcoin.
*/
Bitcoin:0,"0":"Bitcoin",
/**
* Bitcoin's testnet network.
*/
Testnet:1,"1":"Testnet",
/**
* Bitcoin's signet network.
*/
Signet:2,"2":"Signet",
/**
* Bitcoin's regtest network.
*/
Regtest:3,"3":"Regtest", });
/**
*/
export const WasmScriptType = Object.freeze({ Legacy:0,"0":"Legacy",NestedSegwit:1,"1":"NestedSegwit",NativeSegwit:2,"2":"NativeSegwit",Taproot:3,"3":"Taproot", });
/**
*/
export const WasmChangeSpendPolicy = Object.freeze({ ChangeAllowed:0,"0":"ChangeAllowed",OnlyChange:1,"1":"OnlyChange",ChangeForbidden:2,"2":"ChangeForbidden", });
/**
*/
export const WasmLanguage = Object.freeze({ English:0,"0":"English",SimplifiedChinese:1,"1":"SimplifiedChinese",TraditionalChinese:2,"2":"TraditionalChinese",Czech:3,"3":"Czech",French:4,"4":"French",Italian:5,"5":"Italian",Japanese:6,"6":"Japanese",Korean:7,"7":"Korean",Spanish:8,"8":"Spanish", });

const DetailledWasmErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_detailledwasmerror_free(ptr >>> 0));
/**
*/
export class DetailledWasmError {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DetailledWasmError.prototype);
        obj.__wbg_ptr = ptr;
        DetailledWasmErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DetailledWasmErrorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_detailledwasmerror_free(ptr);
    }
    /**
    * @returns {WasmError}
    */
    get kind() {
        const ret = wasm.__wbg_get_detailledwasmerror_kind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {WasmError} arg0
    */
    set kind(arg0) {
        wasm.__wbg_set_detailledwasmerror_kind(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {any}
    */
    get details() {
        const ret = wasm.__wbg_get_detailledwasmerror_details(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} arg0
    */
    set details(arg0) {
        wasm.__wbg_set_detailledwasmerror_details(this.__wbg_ptr, addHeapObject(arg0));
    }
}

const WasmAccountFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmaccount_free(ptr >>> 0));
/**
*/
export class WasmAccount {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmAccount.prototype);
        obj.__wbg_ptr = ptr;
        WasmAccountFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAccountFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmaccount_free(ptr);
    }
    /**
    * @param {number | undefined} [index]
    * @param {bigint | undefined} [amount]
    * @param {string | undefined} [label]
    * @param {string | undefined} [message]
    * @returns {WasmPaymentLink}
    */
    getBitcoinUri(index, amount, label, message) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(label) ? 0 : passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(message) ? 0 : passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmaccount_getBitcoinUri(retptr, this.__wbg_ptr, !isLikeNone(index), isLikeNone(index) ? 0 : index, !isLikeNone(amount), isLikeNone(amount) ? BigInt(0) : amount, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmPaymentLink.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {WasmAddress} address
    * @returns {boolean}
    */
    owns(address) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(address, WasmAddress);
            wasm.wasmaccount_owns(retptr, this.__wbg_ptr, address.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {WasmBalance}
    */
    getBalance() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmaccount_getBalance(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmBalance.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    getDerivationPath() {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmaccount_getDerivationPath(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
    * @returns {WasmUtxoArray}
    */
    getUtxos() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmaccount_getUtxos(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmUtxoArray.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {WasmPagination | undefined} [pagination]
    * @returns {WasmTransactionDetailsArray}
    */
    getTransactions(pagination) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            let ptr0 = 0;
            if (!isLikeNone(pagination)) {
                _assertClass(pagination, WasmPagination);
                ptr0 = pagination.__destroy_into_raw();
            }
            wasm.wasmaccount_getTransactions(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmTransactionDetailsArray.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} txid
    * @returns {WasmTransactionDetails}
    */
    getTransaction(txid) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmaccount_getTransaction(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmTransactionDetails.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    hasSyncData() {
        const ret = wasm.wasmaccount_hasSyncData(this.__wbg_ptr);
        return ret !== 0;
    }
}

const WasmAddressFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmaddress_free(ptr >>> 0));
/**
*/
export class WasmAddress {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmAddress.prototype);
        obj.__wbg_ptr = ptr;
        WasmAddressFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAddressFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmaddress_free(ptr);
    }
    /**
    * @param {string} str
    * @param {WasmNetwork} network
    */
    constructor(str, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmaddress_new(retptr, ptr0, len0, network);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {WasmScript} value
    * @param {WasmNetwork} network
    * @returns {WasmAddress}
    */
    static fromScript(value, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(value, WasmScript);
            var ptr0 = value.__destroy_into_raw();
            wasm.wasmaddress_fromScript(retptr, ptr0, network);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmAddress.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmaddress_toString(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {WasmScript}
    */
    intoScript() {
        const ret = wasm.wasmaddress_intoScript(this.__wbg_ptr);
        return WasmScript.__wrap(ret);
    }
}

const WasmAddressInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmaddressinfo_free(ptr >>> 0));
/**
*/
export class WasmAddressInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAddressInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmaddressinfo_free(ptr);
    }
    /**
    * @returns {number}
    */
    get index() {
        const ret = wasm.wasmaddressinfo_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {string}
    */
    to_string() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmaddressinfo_to_string(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const WasmApiExchangeRateDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiexchangeratedata_free(ptr >>> 0));
/**
*/
export class WasmApiExchangeRateData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiExchangeRateData.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiExchangeRateDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiExchangeRateDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiexchangeratedata_free(ptr);
    }
    /**
    * @returns {WasmApiExchangeRate}
    */
    get 0() {
        const ret = wasm.__wbg_get_wasmapiexchangeratedata_0(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmApiExchangeRate} arg0
    */
    set 0(arg0) {
        wasm.__wbg_set_wasmapiexchangeratedata_0(this.__wbg_ptr, addHeapObject(arg0));
    }
}

const WasmApiWalletAccountsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiwalletaccounts_free(ptr >>> 0));
/**
*/
export class WasmApiWalletAccounts {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiWalletAccounts.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiWalletAccountsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiWalletAccountsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiwalletaccounts_free(ptr);
    }
    /**
    * @returns {(WasmWalletAccountData)[]}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwalletaccounts_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmWalletAccountData)[]} arg0
    */
    set 0(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwalletaccounts_0(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmApiWalletDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiwalletdata_free(ptr >>> 0));
/**
*/
export class WasmApiWalletData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiWalletData.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiWalletDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmApiWalletData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiWalletDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiwalletdata_free(ptr);
    }
    /**
    * @returns {WasmApiWallet}
    */
    get Wallet() {
        const ret = wasm.__wbg_get_wasmapiwalletdata_Wallet(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmApiWallet} arg0
    */
    set Wallet(arg0) {
        wasm.__wbg_set_wasmapiwalletdata_Wallet(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
    * @returns {WasmApiWalletKey}
    */
    get WalletKey() {
        const ret = wasm.__wbg_get_wasmapiwalletdata_WalletKey(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmApiWalletKey} arg0
    */
    set WalletKey(arg0) {
        wasm.__wbg_set_wasmapiwalletdata_WalletKey(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
    * @returns {WasmApiWalletSettings}
    */
    get WalletSettings() {
        const ret = wasm.__wbg_get_wasmapiwalletdata_WalletSettings(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmApiWalletSettings} arg0
    */
    set WalletSettings(arg0) {
        wasm.__wbg_set_wasmapiwalletdata_WalletSettings(this.__wbg_ptr, addHeapObject(arg0));
    }
    /**
    * @param {WasmApiWallet} wallet
    * @param {WasmApiWalletKey} key
    * @param {WasmApiWalletSettings} settings
    * @returns {WasmApiWalletData}
    */
    static from_parts(wallet, key, settings) {
        const ret = wasm.wasmapiwalletdata_from_parts(addHeapObject(wallet), addHeapObject(key), addHeapObject(settings));
        return WasmApiWalletData.__wrap(ret);
    }
}

const WasmApiWalletTransactionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiwallettransaction_free(ptr >>> 0));
/**
*/
export class WasmApiWalletTransaction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiWalletTransaction.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiWalletTransactionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmApiWalletTransaction)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiWalletTransactionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiwallettransaction_free(ptr);
    }
    /**
    * @returns {string}
    */
    get ID() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_ID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set ID(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_ID(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get WalletID() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_WalletID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set WalletID(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_WalletID(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string | undefined}
    */
    get Label() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_Label(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} [arg0]
    */
    set Label(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_Label(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get TransactionID() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_TransactionID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set TransactionID(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_TransactionID(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmApiWalletTransactionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiwallettransactions_free(ptr >>> 0));
/**
*/
export class WasmApiWalletTransactions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiWalletTransactions.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiWalletTransactionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiWalletTransactionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiwallettransactions_free(ptr);
    }
    /**
    * @returns {(WasmApiWalletTransaction)[]}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransactions_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmApiWalletTransaction)[]} arg0
    */
    set 0(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransactions_0(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmApiWalletsDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmapiwalletsdata_free(ptr >>> 0));
/**
*/
export class WasmApiWalletsData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmApiWalletsData.prototype);
        obj.__wbg_ptr = ptr;
        WasmApiWalletsDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmApiWalletsDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmapiwalletsdata_free(ptr);
    }
    /**
    * @returns {(WasmApiWalletData)[]}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwalletsdata_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmApiWalletData)[]} arg0
    */
    set 0(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwalletsdata_0(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmAuthDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmauthdata_free(ptr >>> 0));
/**
*/
export class WasmAuthData {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAuthDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmauthdata_free(ptr);
    }
    /**
    * @returns {string}
    */
    get uid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_ID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set uid(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_ID(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get access() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_WalletID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set access(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_WalletID(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get refresh() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmapiwallettransaction_TransactionID(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set refresh(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmapiwallettransaction_TransactionID(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {(string)[]}
    */
    get scopes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmauthdata_scopes(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(string)[]} arg0
    */
    set scopes(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmauthdata_scopes(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmBalanceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmbalance_free(ptr >>> 0));
/**
*/
export class WasmBalance {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmBalance.prototype);
        obj.__wbg_ptr = ptr;
        WasmBalanceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBalanceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbalance_free(ptr);
    }
    /**
    * All coinbase outputs not yet matured
    * @returns {bigint}
    */
    get immature() {
        const ret = wasm.__wbg_get_wasmbalance_immature(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * All coinbase outputs not yet matured
    * @param {bigint} arg0
    */
    set immature(arg0) {
        wasm.__wbg_set_wasmbalance_immature(this.__wbg_ptr, arg0);
    }
    /**
    * Unconfirmed UTXOs generated by a wallet tx
    * @returns {bigint}
    */
    get trusted_pending() {
        const ret = wasm.__wbg_get_wasmbalance_trusted_pending(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * Unconfirmed UTXOs generated by a wallet tx
    * @param {bigint} arg0
    */
    set trusted_pending(arg0) {
        wasm.__wbg_set_wasmbalance_trusted_pending(this.__wbg_ptr, arg0);
    }
    /**
    * Unconfirmed UTXOs received from an external wallet
    * @returns {bigint}
    */
    get untrusted_pending() {
        const ret = wasm.__wbg_get_wasmbalance_untrusted_pending(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * Unconfirmed UTXOs received from an external wallet
    * @param {bigint} arg0
    */
    set untrusted_pending(arg0) {
        wasm.__wbg_set_wasmbalance_untrusted_pending(this.__wbg_ptr, arg0);
    }
    /**
    * Confirmed and immediately spendable balance
    * @returns {bigint}
    */
    get confirmed() {
        const ret = wasm.__wbg_get_wasmbalance_confirmed(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * Confirmed and immediately spendable balance
    * @param {bigint} arg0
    */
    set confirmed(arg0) {
        wasm.__wbg_set_wasmbalance_confirmed(this.__wbg_ptr, arg0);
    }
}

const WasmBlockchainClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmblockchainclient_free(ptr >>> 0));
/**
*/
export class WasmBlockchainClient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmBlockchainClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmblockchainclient_free(ptr);
    }
    /**
    * Generates a Mnemonic with a random entropy based on the given word
    * count.
    * @param {WasmProtonWalletApiClient} proton_api_client
    */
    constructor(proton_api_client) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(proton_api_client, WasmProtonWalletApiClient);
            wasm.wasmblockchainclient_new(retptr, proton_api_client.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Promise<Map<string, number>>}
    */
    getFeesEstimation() {
        const ret = wasm.wasmblockchainclient_getFeesEstimation(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmAccount} account
    * @returns {Promise<void>}
    */
    fullSync(account) {
        _assertClass(account, WasmAccount);
        const ret = wasm.wasmblockchainclient_fullSync(this.__wbg_ptr, account.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmAccount} account
    * @returns {Promise<void>}
    */
    partialSync(account) {
        _assertClass(account, WasmAccount);
        const ret = wasm.wasmblockchainclient_partialSync(this.__wbg_ptr, account.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmAccount} account
    * @returns {Promise<boolean>}
    */
    shouldSync(account) {
        _assertClass(account, WasmAccount);
        const ret = wasm.wasmblockchainclient_shouldSync(this.__wbg_ptr, account.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmPartiallySignedTransaction} psbt
    * @returns {Promise<string>}
    */
    broadcastPsbt(psbt) {
        _assertClass(psbt, WasmPartiallySignedTransaction);
        const ret = wasm.wasmblockchainclient_broadcastPsbt(this.__wbg_ptr, psbt.__wbg_ptr);
        return takeObject(ret);
    }
}

const WasmDerivationPathFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmderivationpath_free(ptr >>> 0));
/**
*/
export class WasmDerivationPath {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmDerivationPath.prototype);
        obj.__wbg_ptr = ptr;
        WasmDerivationPathFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDerivationPathFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmderivationpath_free(ptr);
    }
    /**
    * @param {string} path
    */
    constructor(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmderivationpath_new(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} purpose
    * @param {WasmNetwork} network
    * @param {number} account_index
    * @returns {WasmDerivationPath}
    */
    static fromParts(purpose, network, account_index) {
        const ret = wasm.wasmderivationpath_fromParts(purpose, network, account_index);
        return WasmDerivationPath.__wrap(ret);
    }
    /**
    * @param {string} str
    * @returns {WasmDerivationPath}
    */
    static fromString(str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmderivationpath_fromString(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmDerivationPath.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WasmExchangeRateClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmexchangerateclient_free(ptr >>> 0));
/**
*/
export class WasmExchangeRateClient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmExchangeRateClient.prototype);
        obj.__wbg_ptr = ptr;
        WasmExchangeRateClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmExchangeRateClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmexchangerateclient_free(ptr);
    }
    /**
    * @param {WasmFiatCurrency} fiat
    * @param {bigint} time
    * @returns {Promise<WasmApiExchangeRateData>}
    */
    getExchangeRate(fiat, time) {
        const ret = wasm.wasmexchangerateclient_getExchangeRate(this.__wbg_ptr, addHeapObject(fiat), time);
        return takeObject(ret);
    }
}

const WasmLockTimeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmlocktime_free(ptr >>> 0));
/**
*/
export class WasmLockTime {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmLockTime.prototype);
        obj.__wbg_ptr = ptr;
        WasmLockTimeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmLockTimeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmlocktime_free(ptr);
    }
    /**
    * @param {number} height
    * @returns {WasmLockTime}
    */
    static fromHeight(height) {
        const ret = wasm.wasmlocktime_fromHeight(height);
        return WasmLockTime.__wrap(ret);
    }
    /**
    * @param {number} seconds
    * @returns {WasmLockTime}
    */
    static fromSeconds(seconds) {
        const ret = wasm.wasmlocktime_fromSeconds(seconds);
        return WasmLockTime.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    isBlockHeight() {
        const ret = wasm.wasmlocktime_isBlockHeight(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    isBlockTime() {
        const ret = wasm.wasmlocktime_isBlockTime(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @returns {number}
    */
    toConsensusU32() {
        const ret = wasm.wasmlocktime_toConsensusU32(this.__wbg_ptr);
        return ret >>> 0;
    }
}

const WasmMnemonicFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmnemonic_free(ptr >>> 0));
/**
*/
export class WasmMnemonic {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmMnemonic.prototype);
        obj.__wbg_ptr = ptr;
        WasmMnemonicFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMnemonicFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmnemonic_free(ptr);
    }
    /**
    * Generates a Mnemonic with a random entropy based on the given word
    * count.
    * @param {WasmWordCount} word_count
    */
    constructor(word_count) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmmnemonic_new(retptr, word_count);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Parse a Mnemonic with the given string.
    * @param {string} mnemonic
    * @returns {WasmMnemonic}
    */
    static fromString(mnemonic) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmmnemonic_fromString(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmMnemonic.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the Mnemonic as a string.
    * @returns {string}
    */
    asString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmmnemonic_asString(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {(string)[]}
    */
    asWords() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmmnemonic_asWords(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WasmNetworkClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmnetworkclient_free(ptr >>> 0));
/**
*/
export class WasmNetworkClient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmNetworkClient.prototype);
        obj.__wbg_ptr = ptr;
        WasmNetworkClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmNetworkClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmnetworkclient_free(ptr);
    }
    /**
    * @returns {Promise<WasmNetwork>}
    */
    getNetwork() {
        const ret = wasm.wasmnetworkclient_getNetwork(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const WasmOnchainPaymentLinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmonchainpaymentlink_free(ptr >>> 0));
/**
*/
export class WasmOnchainPaymentLink {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmOnchainPaymentLink.prototype);
        obj.__wbg_ptr = ptr;
        WasmOnchainPaymentLinkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmOnchainPaymentLinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmonchainpaymentlink_free(ptr);
    }
    /**
    * @returns {string | undefined}
    */
    get address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmonchainpaymentlink_address(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} [arg0]
    */
    set address(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmonchainpaymentlink_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint | undefined}
    */
    get amount() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmonchainpaymentlink_amount(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r2 = getBigInt64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : BigInt.asUintN(64, r2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint | undefined} [arg0]
    */
    set amount(arg0) {
        wasm.__wbg_set_wasmonchainpaymentlink_amount(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
    * @returns {string | undefined}
    */
    get message() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmonchainpaymentlink_message(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} [arg0]
    */
    set message(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmonchainpaymentlink_message(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string | undefined}
    */
    get label() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmonchainpaymentlink_label(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} [arg0]
    */
    set label(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmonchainpaymentlink_label(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmOutPointFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmoutpoint_free(ptr >>> 0));
/**
* Serialised Outpoint under the form <txid>:<index>
*/
export class WasmOutPoint {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmOutPoint.prototype);
        obj.__wbg_ptr = ptr;
        WasmOutPointFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmOutPointFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmoutpoint_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmoutpoint_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmoutpoint_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} str
    * @returns {WasmOutPoint}
    */
    static fromString(str) {
        const ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmoutpoint_fromString(ptr0, len0);
        return WasmOutPoint.__wrap(ret);
    }
}

const WasmPaginationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpagination_free(ptr >>> 0));
/**
*/
export class WasmPagination {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPaginationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpagination_free(ptr);
    }
    /**
    * @returns {number}
    */
    get skip() {
        const ret = wasm.__wbg_get_wasmpagination_skip(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set skip(arg0) {
        wasm.__wbg_set_wasmpagination_skip(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get take() {
        const ret = wasm.__wbg_get_wasmpagination_take(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set take(arg0) {
        wasm.__wbg_set_wasmpagination_take(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} skip
    * @param {number} take
    */
    constructor(skip, take) {
        const ret = wasm.wasmpagination_new(skip, take);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

const WasmPartiallySignedTransactionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpartiallysignedtransaction_free(ptr >>> 0));
/**
*/
export class WasmPartiallySignedTransaction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPartiallySignedTransaction.prototype);
        obj.__wbg_ptr = ptr;
        WasmPartiallySignedTransactionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPartiallySignedTransactionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpartiallysignedtransaction_free(ptr);
    }
    /**
    * @returns {(WasmPsbtRecipient)[]}
    */
    get recipients() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmpartiallysignedtransaction_recipients(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmPsbtRecipient)[]} arg0
    */
    set recipients(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmpartiallysignedtransaction_recipients(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint}
    */
    get total_fees() {
        const ret = wasm.__wbg_get_wasmpartiallysignedtransaction_total_fees(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set total_fees(arg0) {
        wasm.__wbg_set_wasmpartiallysignedtransaction_total_fees(this.__wbg_ptr, arg0);
    }
    /**
    * @param {WasmAccount} wasm_account
    * @param {WasmNetwork} network
    * @returns {WasmPartiallySignedTransaction}
    */
    sign(wasm_account, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(wasm_account, WasmAccount);
            wasm.wasmpartiallysignedtransaction_sign(retptr, this.__wbg_ptr, wasm_account.__wbg_ptr, network);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmPartiallySignedTransaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WasmPaymentLinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpaymentlink_free(ptr >>> 0));
/**
*/
export class WasmPaymentLink {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPaymentLink.prototype);
        obj.__wbg_ptr = ptr;
        WasmPaymentLinkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPaymentLinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpaymentlink_free(ptr);
    }
    /**
    * @returns {string}
    */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmpaymentlink_toString(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    toUri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmpaymentlink_toUri(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} str
    * @param {WasmNetwork} network
    * @returns {WasmPaymentLink}
    */
    static tryParse(str, network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmpaymentlink_tryParse(retptr, ptr0, len0, network);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmPaymentLink.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {WasmPaymentLinkKind}
    */
    getKind() {
        const ret = wasm.wasmpaymentlink_getKind(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {WasmOnchainPaymentLink}
    */
    assumeOnchain() {
        const ret = wasm.wasmpaymentlink_assumeOnchain(this.__wbg_ptr);
        return WasmOnchainPaymentLink.__wrap(ret);
    }
}

const WasmProtonWalletApiClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmprotonwalletapiclient_free(ptr >>> 0));
/**
*/
export class WasmProtonWalletApiClient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmProtonWalletApiClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmprotonwalletapiclient_free(ptr);
    }
    /**
    * @param {string | undefined} [uid_str]
    * @param {string | undefined} [origin]
    */
    constructor(uid_str, origin) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(uid_str) ? 0 : passStringToWasm0(uid_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(origin) ? 0 : passStringToWasm0(origin, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmprotonwalletapiclient_new(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns a client to use exchange rate API
    * @returns {WasmExchangeRateClient}
    */
    exchange_rate() {
        const ret = wasm.wasmprotonwalletapiclient_exchange_rate(this.__wbg_ptr);
        return WasmExchangeRateClient.__wrap(ret);
    }
    /**
    * Returns a client to use settings API
    * @returns {WasmSettingsClient}
    */
    settings() {
        const ret = wasm.wasmprotonwalletapiclient_settings(this.__wbg_ptr);
        return WasmSettingsClient.__wrap(ret);
    }
    /**
    * Returns a client to use network API
    * @returns {WasmNetworkClient}
    */
    network() {
        const ret = wasm.wasmprotonwalletapiclient_network(this.__wbg_ptr);
        return WasmNetworkClient.__wrap(ret);
    }
    /**
    * Returns a client to use wallet API
    * @returns {WasmWalletClient}
    */
    wallet() {
        const ret = wasm.wasmprotonwalletapiclient_wallet(this.__wbg_ptr);
        return WasmWalletClient.__wrap(ret);
    }
}

const WasmPsbtRecipientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmpsbtrecipient_free(ptr >>> 0));
/**
*/
export class WasmPsbtRecipient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPsbtRecipient.prototype);
        obj.__wbg_ptr = ptr;
        WasmPsbtRecipientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmPsbtRecipient)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPsbtRecipientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmpsbtrecipient_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmpsbtrecipient_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmpsbtrecipient_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint}
    */
    get 1() {
        const ret = wasm.__wbg_get_wasmpartiallysignedtransaction_total_fees(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set 1(arg0) {
        wasm.__wbg_set_wasmpartiallysignedtransaction_total_fees(this.__wbg_ptr, arg0);
    }
}

const WasmRecipientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmrecipient_free(ptr >>> 0));
/**
*/
export class WasmRecipient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmRecipient.prototype);
        obj.__wbg_ptr = ptr;
        WasmRecipientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRecipientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmrecipient_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmrecipient_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmrecipient_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get 1() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmrecipient_1(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 1(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmrecipient_1(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint}
    */
    get 2() {
        const ret = wasm.__wbg_get_wasmrecipient_2(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set 2(arg0) {
        wasm.__wbg_set_wasmrecipient_2(this.__wbg_ptr, arg0);
    }
}

const WasmScriptFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmscript_free(ptr >>> 0));
/**
*/
export class WasmScript {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmScript.prototype);
        obj.__wbg_ptr = ptr;
        WasmScriptFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmScriptFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmscript_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmscript_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} arg0
    */
    set 0(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmoutpoint_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {WasmNetwork} network
    * @returns {WasmAddress}
    */
    toAddress(network) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmscript_toAddress(retptr, this.__wbg_ptr, network);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmAddress.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WasmSequenceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsequence_free(ptr >>> 0));
/**
*/
export class WasmSequence {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSequence.prototype);
        obj.__wbg_ptr = ptr;
        WasmSequenceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSequenceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsequence_free(ptr);
    }
    /**
    * @returns {number}
    */
    get 0() {
        const ret = wasm.__wbg_get_wasmsequence_0(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set 0(arg0) {
        wasm.__wbg_set_wasmsequence_0(this.__wbg_ptr, arg0);
    }
}

const WasmSettingsClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsettingsclient_free(ptr >>> 0));
/**
*/
export class WasmSettingsClient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSettingsClient.prototype);
        obj.__wbg_ptr = ptr;
        WasmSettingsClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSettingsClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsettingsclient_free(ptr);
    }
    /**
    * @returns {Promise<WasmUserSettingsData>}
    */
    getUserSettings() {
        const ret = wasm.wasmsettingsclient_getUserSettings(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmBitcoinUnit} symbol
    * @returns {Promise<WasmUserSettingsData>}
    */
    setBitcoinUnit(symbol) {
        const ret = wasm.wasmsettingsclient_setBitcoinUnit(this.__wbg_ptr, addHeapObject(symbol));
        return takeObject(ret);
    }
    /**
    * @param {WasmFiatCurrency} symbol
    * @returns {Promise<WasmUserSettingsData>}
    */
    setFiatCurrency(symbol) {
        const ret = wasm.wasmsettingsclient_setFiatCurrency(this.__wbg_ptr, addHeapObject(symbol));
        return takeObject(ret);
    }
    /**
    * @param {bigint} amount
    * @returns {Promise<WasmUserSettingsData>}
    */
    setTwoFaThreshold(amount) {
        const ret = wasm.wasmsettingsclient_setTwoFaThreshold(this.__wbg_ptr, amount);
        return takeObject(ret);
    }
    /**
    * @param {boolean} hide_empty_used_addresses
    * @returns {Promise<WasmUserSettingsData>}
    */
    setHideEmptyUsedAddresses(hide_empty_used_addresses) {
        const ret = wasm.wasmsettingsclient_setHideEmptyUsedAddresses(this.__wbg_ptr, hide_empty_used_addresses);
        return takeObject(ret);
    }
}

const WasmTransactionDetailsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtransactiondetails_free(ptr >>> 0));
/**
*/
export class WasmTransactionDetails {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTransactionDetails.prototype);
        obj.__wbg_ptr = ptr;
        WasmTransactionDetailsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmTransactionDetails)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTransactionDetailsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtransactiondetails_free(ptr);
    }
    /**
    * @returns {string}
    */
    get txid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetails_txid(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set txid(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmtransactiondetails_txid(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint}
    */
    get received() {
        const ret = wasm.__wbg_get_wasmtransactiondetails_received(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set received(arg0) {
        wasm.__wbg_set_wasmtransactiondetails_received(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {bigint}
    */
    get sent() {
        const ret = wasm.__wbg_get_wasmtransactiondetails_sent(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set sent(arg0) {
        wasm.__wbg_set_wasmtransactiondetails_sent(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {bigint | undefined}
    */
    get fee() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetails_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r2 = getBigInt64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : BigInt.asUintN(64, r2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint | undefined} [arg0]
    */
    set fee(arg0) {
        wasm.__wbg_set_wasmtransactiondetails_fee(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
    * @returns {WasmTransactionTime | undefined}
    */
    get time() {
        const ret = wasm.__wbg_get_wasmtransactiondetails_time(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmTransactionTime.__wrap(ret);
    }
    /**
    * @param {WasmTransactionTime | undefined} [arg0]
    */
    set time(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, WasmTransactionTime);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_wasmtransactiondetails_time(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {(WasmTxIn)[]}
    */
    get inputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetails_inputs(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmTxIn)[]} arg0
    */
    set inputs(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmtransactiondetails_inputs(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {(WasmTxOut)[]}
    */
    get outputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetails_outputs(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmTxOut)[]} arg0
    */
    set outputs(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmtransactiondetails_outputs(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {WasmPartiallySignedTransaction} psbt
    * @param {WasmAccount} account
    * @returns {Promise<WasmTransactionDetails>}
    */
    static fromPsbt(psbt, account) {
        _assertClass(psbt, WasmPartiallySignedTransaction);
        _assertClass(account, WasmAccount);
        const ret = wasm.wasmtransactiondetails_fromPsbt(psbt.__wbg_ptr, account.__wbg_ptr);
        return takeObject(ret);
    }
}

const WasmTransactionDetailsArrayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtransactiondetailsarray_free(ptr >>> 0));
/**
*/
export class WasmTransactionDetailsArray {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTransactionDetailsArray.prototype);
        obj.__wbg_ptr = ptr;
        WasmTransactionDetailsArrayFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTransactionDetailsArrayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtransactiondetailsarray_free(ptr);
    }
    /**
    * @returns {(WasmTransactionDetails)[]}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetailsarray_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmTransactionDetails)[]} arg0
    */
    set 0(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmtransactiondetailsarray_0(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmTransactionTimeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtransactiontime_free(ptr >>> 0));
/**
*/
export class WasmTransactionTime {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTransactionTime.prototype);
        obj.__wbg_ptr = ptr;
        WasmTransactionTimeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTransactionTimeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtransactiontime_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get confirmed() {
        const ret = wasm.__wbg_get_wasmtransactiontime_confirmed(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set confirmed(arg0) {
        wasm.__wbg_set_wasmtransactiontime_confirmed(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {bigint | undefined}
    */
    get confirmation_time() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiondetails_fee(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r2 = getBigInt64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : BigInt.asUintN(64, r2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint | undefined} [arg0]
    */
    set confirmation_time(arg0) {
        wasm.__wbg_set_wasmtransactiondetails_fee(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
    * @returns {bigint | undefined}
    */
    get last_seen() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmtransactiontime_last_seen(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r2 = getBigInt64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : BigInt.asUintN(64, r2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint | undefined} [arg0]
    */
    set last_seen(arg0) {
        wasm.__wbg_set_wasmtransactiontime_last_seen(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
}

const WasmTxBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtxbuilder_free(ptr >>> 0));
/**
*/
export class WasmTxBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTxBuilder.prototype);
        obj.__wbg_ptr = ptr;
        WasmTxBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTxBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtxbuilder_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.wasmtxbuilder_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {WasmAccount} account
    * @returns {Promise<WasmTxBuilder>}
    */
    setAccount(account) {
        _assertClass(account, WasmAccount);
        const ret = wasm.wasmtxbuilder_setAccount(this.__wbg_ptr, account.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {WasmTxBuilder}
    */
    clearRecipients() {
        const ret = wasm.wasmtxbuilder_clearRecipients(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmTxBuilder}
    */
    addRecipient() {
        const ret = wasm.wasmtxbuilder_addRecipient(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @param {number} index
    * @returns {WasmTxBuilder}
    */
    removeRecipient(index) {
        const ret = wasm.wasmtxbuilder_removeRecipient(this.__wbg_ptr, index);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @param {number} index
    * @param {string | undefined} [address_str]
    * @param {bigint | undefined} [amount]
    * @returns {Promise<WasmTxBuilder>}
    */
    updateRecipient(index, address_str, amount) {
        var ptr0 = isLikeNone(address_str) ? 0 : passStringToWasm0(address_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtxbuilder_updateRecipient(this.__wbg_ptr, index, ptr0, len0, !isLikeNone(amount), isLikeNone(amount) ? BigInt(0) : amount);
        return takeObject(ret);
    }
    /**
    * @param {number} index
    * @returns {Promise<WasmTxBuilder>}
    */
    updateRecipientAmountToMax(index) {
        const ret = wasm.wasmtxbuilder_updateRecipientAmountToMax(this.__wbg_ptr, index);
        return takeObject(ret);
    }
    /**
    * @returns {(WasmRecipient)[]}
    */
    getRecipients() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtxbuilder_getRecipients(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    *
    *     * UTXOs
    *
    * @param {WasmOutPoint} outpoint
    * @returns {WasmTxBuilder}
    */
    addUtxoToSpend(outpoint) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(outpoint, WasmOutPoint);
            var ptr0 = outpoint.__destroy_into_raw();
            wasm.wasmtxbuilder_addUtxoToSpend(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmTxBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {WasmOutPoint} outpoint
    * @returns {WasmTxBuilder}
    */
    removeUtxoToSpend(outpoint) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(outpoint, WasmOutPoint);
            var ptr0 = outpoint.__destroy_into_raw();
            wasm.wasmtxbuilder_removeUtxoToSpend(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmTxBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {WasmTxBuilder}
    */
    clearUtxosToSpend() {
        const ret = wasm.wasmtxbuilder_clearUtxosToSpend(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {(WasmOutPoint)[]}
    */
    getUtxosToSpend() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtxbuilder_getUtxosToSpend(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    *
    *     * Coin selection enforcement
    *
    * @param {WasmCoinSelection} coin_selection
    * @returns {WasmTxBuilder}
    */
    setCoinSelection(coin_selection) {
        const ret = wasm.wasmtxbuilder_setCoinSelection(this.__wbg_ptr, coin_selection);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmCoinSelection}
    */
    getCoinSelection() {
        const ret = wasm.wasmtxbuilder_getCoinSelection(this.__wbg_ptr);
        return ret;
    }
    /**
    *
    *     * RBF
    *
    * @returns {WasmTxBuilder}
    */
    enableRbf() {
        const ret = wasm.wasmtxbuilder_enableRbf(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmTxBuilder}
    */
    disableRbf() {
        const ret = wasm.wasmtxbuilder_disableRbf(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    getRbfEnabled() {
        const ret = wasm.wasmtxbuilder_getRbfEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    *
    *     * Change policy
    *
    * @param {WasmChangeSpendPolicy} change_policy
    * @returns {WasmTxBuilder}
    */
    setChangePolicy(change_policy) {
        const ret = wasm.wasmtxbuilder_setChangePolicy(this.__wbg_ptr, change_policy);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmChangeSpendPolicy}
    */
    getChangePolicy() {
        const ret = wasm.wasmtxbuilder_getChangePolicy(this.__wbg_ptr);
        return ret;
    }
    /**
    *
    *     * Fees
    *
    * @param {number} sat_per_vb
    * @returns {Promise<WasmTxBuilder>}
    */
    setFeeRate(sat_per_vb) {
        const ret = wasm.wasmtxbuilder_setFeeRate(this.__wbg_ptr, sat_per_vb);
        return takeObject(ret);
    }
    /**
    * @returns {number | undefined}
    */
    getFeeRate() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtxbuilder_getFeeRate(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getFloat32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    *
    *     * Locktime
    *
    * @param {WasmLockTime} locktime
    * @returns {WasmTxBuilder}
    */
    addLocktime(locktime) {
        _assertClass(locktime, WasmLockTime);
        var ptr0 = locktime.__destroy_into_raw();
        const ret = wasm.wasmtxbuilder_addLocktime(this.__wbg_ptr, ptr0);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmTxBuilder}
    */
    removeLocktime() {
        const ret = wasm.wasmtxbuilder_removeLocktime(this.__wbg_ptr);
        return WasmTxBuilder.__wrap(ret);
    }
    /**
    * @returns {WasmLockTime | undefined}
    */
    getLocktime() {
        const ret = wasm.wasmtxbuilder_getLocktime(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmLockTime.__wrap(ret);
    }
    /**
    *
    *     * Final
    *
    * @param {WasmNetwork} network
    * @returns {Promise<WasmPartiallySignedTransaction>}
    */
    createPsbt(network) {
        const ret = wasm.wasmtxbuilder_createPsbt(this.__wbg_ptr, network);
        return takeObject(ret);
    }
}

const WasmTxInFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtxin_free(ptr >>> 0));
/**
*/
export class WasmTxIn {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTxIn.prototype);
        obj.__wbg_ptr = ptr;
        WasmTxInFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmTxIn)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTxInFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtxin_free(ptr);
    }
    /**
    * @returns {WasmOutPoint}
    */
    get previous_output() {
        const ret = wasm.__wbg_get_wasmtxin_previous_output(this.__wbg_ptr);
        return WasmOutPoint.__wrap(ret);
    }
    /**
    * @param {WasmOutPoint} arg0
    */
    set previous_output(arg0) {
        _assertClass(arg0, WasmOutPoint);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmtxin_previous_output(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {WasmScript}
    */
    get script_sig() {
        const ret = wasm.__wbg_get_wasmtxin_script_sig(this.__wbg_ptr);
        return WasmScript.__wrap(ret);
    }
    /**
    * @param {WasmScript} arg0
    */
    set script_sig(arg0) {
        _assertClass(arg0, WasmScript);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmtxin_script_sig(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {WasmSequence}
    */
    get sequence() {
        const ret = wasm.__wbg_get_wasmtxin_sequence(this.__wbg_ptr);
        return WasmSequence.__wrap(ret);
    }
    /**
    * @param {WasmSequence} arg0
    */
    set sequence(arg0) {
        _assertClass(arg0, WasmSequence);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmtxin_sequence(this.__wbg_ptr, ptr0);
    }
}

const WasmTxOutFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtxout_free(ptr >>> 0));
/**
*/
export class WasmTxOut {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTxOut.prototype);
        obj.__wbg_ptr = ptr;
        WasmTxOutFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmTxOut)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTxOutFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtxout_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get value() {
        const ret = wasm.__wbg_get_wasmbalance_immature(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set value(arg0) {
        wasm.__wbg_set_wasmbalance_immature(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {WasmScript}
    */
    get script_pubkey() {
        const ret = wasm.__wbg_get_wasmtxout_script_pubkey(this.__wbg_ptr);
        return WasmScript.__wrap(ret);
    }
    /**
    * @param {WasmScript} arg0
    */
    set script_pubkey(arg0) {
        _assertClass(arg0, WasmScript);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmtxout_script_pubkey(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {WasmAddress}
    */
    get address() {
        const ret = wasm.__wbg_get_wasmtxout_address(this.__wbg_ptr);
        return WasmAddress.__wrap(ret);
    }
    /**
    * @param {WasmAddress} arg0
    */
    set address(arg0) {
        _assertClass(arg0, WasmAddress);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmtxout_address(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {boolean}
    */
    get is_mine() {
        const ret = wasm.__wbg_get_wasmtxout_is_mine(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_mine(arg0) {
        wasm.__wbg_set_wasmtxout_is_mine(this.__wbg_ptr, arg0);
    }
}

const WasmUserSettingsDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmusersettingsdata_free(ptr >>> 0));
/**
*/
export class WasmUserSettingsData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmUserSettingsData.prototype);
        obj.__wbg_ptr = ptr;
        WasmUserSettingsDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUserSettingsDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmusersettingsdata_free(ptr);
    }
    /**
    * @returns {WasmUserSettings}
    */
    get 0() {
        const ret = wasm.__wbg_get_wasmusersettingsdata_0(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmUserSettings} arg0
    */
    set 0(arg0) {
        wasm.__wbg_set_wasmusersettingsdata_0(this.__wbg_ptr, addHeapObject(arg0));
    }
}

const WasmUtxoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmutxo_free(ptr >>> 0));
/**
*/
export class WasmUtxo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmUtxo.prototype);
        obj.__wbg_ptr = ptr;
        WasmUtxoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmUtxo)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUtxoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmutxo_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get value() {
        const ret = wasm.__wbg_get_wasmbalance_immature(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set value(arg0) {
        wasm.__wbg_set_wasmbalance_immature(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {WasmOutPoint}
    */
    get outpoint() {
        const ret = wasm.__wbg_get_wasmutxo_outpoint(this.__wbg_ptr);
        return WasmOutPoint.__wrap(ret);
    }
    /**
    * @param {WasmOutPoint} arg0
    */
    set outpoint(arg0) {
        _assertClass(arg0, WasmOutPoint);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmutxo_outpoint(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {WasmScript}
    */
    get script_pubkey() {
        const ret = wasm.__wbg_get_wasmutxo_script_pubkey(this.__wbg_ptr);
        return WasmScript.__wrap(ret);
    }
    /**
    * @param {WasmScript} arg0
    */
    set script_pubkey(arg0) {
        _assertClass(arg0, WasmScript);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_wasmutxo_script_pubkey(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {WasmKeychainKind}
    */
    get keychain() {
        const ret = wasm.__wbg_get_wasmutxo_keychain(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {WasmKeychainKind} arg0
    */
    set keychain(arg0) {
        wasm.__wbg_set_wasmutxo_keychain(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {boolean}
    */
    get is_spent() {
        const ret = wasm.__wbg_get_wasmutxo_is_spent(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_spent(arg0) {
        wasm.__wbg_set_wasmutxo_is_spent(this.__wbg_ptr, arg0);
    }
}

const WasmUtxoArrayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmutxoarray_free(ptr >>> 0));
/**
*/
export class WasmUtxoArray {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmUtxoArray.prototype);
        obj.__wbg_ptr = ptr;
        WasmUtxoArrayFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUtxoArrayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmutxoarray_free(ptr);
    }
    /**
    * @returns {(WasmUtxo)[]}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_wasmutxoarray_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(WasmUtxo)[]} arg0
    */
    set 0(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmutxoarray_0(this.__wbg_ptr, ptr0, len0);
    }
}

const WasmWalletFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmwallet_free(ptr >>> 0));
/**
*/
export class WasmWallet {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmWalletFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmwallet_free(ptr);
    }
    /**
    * @param {WasmNetwork} network
    * @param {string} bip39_mnemonic
    * @param {string | undefined} [bip38_passphrase]
    * @param {([u8, String])[] | undefined} [accounts]
    */
    constructor(network, bip39_mnemonic, bip38_passphrase, accounts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(bip39_mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(bip38_passphrase) ? 0 : passStringToWasm0(bip38_passphrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(accounts) ? 0 : passArrayJsValueToWasm0(accounts, wasm.__wbindgen_malloc);
            var len2 = WASM_VECTOR_LEN;
            wasm.wasmwallet_new(retptr, network, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} script_type
    * @param {string} derivation_path
    * @returns {WasmDerivationPath}
    */
    addAccount(script_type, derivation_path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(derivation_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmwallet_addAccount(retptr, this.__wbg_ptr, script_type, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return WasmDerivationPath.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} derivation_path
    * @returns {WasmAccount | undefined}
    */
    getAccount(derivation_path) {
        const ptr0 = passStringToWasm0(derivation_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwallet_getAccount(this.__wbg_ptr, ptr0, len0);
        return ret === 0 ? undefined : WasmAccount.__wrap(ret);
    }
    /**
    * @returns {Promise<WasmBalance>}
    */
    getBalance() {
        const ret = wasm.wasmwallet_getBalance(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmPagination | undefined} [pagination]
    * @returns {Promise<WasmTransactionDetailsArray>}
    */
    getTransactions(pagination) {
        let ptr0 = 0;
        if (!isLikeNone(pagination)) {
            _assertClass(pagination, WasmPagination);
            ptr0 = pagination.__destroy_into_raw();
        }
        const ret = wasm.wasmwallet_getTransactions(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {WasmDerivationPath} account_key
    * @param {string} txid
    * @returns {Promise<WasmTransactionDetails>}
    */
    getTransaction(account_key, txid) {
        _assertClass(account_key, WasmDerivationPath);
        const ptr0 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwallet_getTransaction(this.__wbg_ptr, account_key.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @returns {string}
    */
    getFingerprint() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmwallet_getFingerprint(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const WasmWalletAccountDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmwalletaccountdata_free(ptr >>> 0));
/**
*/
export class WasmWalletAccountData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmWalletAccountData.prototype);
        obj.__wbg_ptr = ptr;
        WasmWalletAccountDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmWalletAccountData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmWalletAccountDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmwalletaccountdata_free(ptr);
    }
    /**
    * @returns {WasmApiWalletAccount}
    */
    get Account() {
        const ret = wasm.__wbg_get_wasmwalletaccountdata_Account(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {WasmApiWalletAccount} arg0
    */
    set Account(arg0) {
        wasm.__wbg_set_wasmwalletaccountdata_Account(this.__wbg_ptr, addHeapObject(arg0));
    }
}

const WasmWalletClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmwalletclient_free(ptr >>> 0));
/**
*/
export class WasmWalletClient {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmWalletClient.prototype);
        obj.__wbg_ptr = ptr;
        WasmWalletClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmWalletClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmwalletclient_free(ptr);
    }
    /**
    * @returns {Promise<WasmApiWalletsData>}
    */
    getWallets() {
        const ret = wasm.wasmwalletclient_getWallets(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} name
    * @param {boolean} is_imported
    * @param {number} wallet_type
    * @param {boolean} has_passphrase
    * @param {string} user_key_id
    * @param {string} wallet_key
    * @param {string | undefined} [mnemonic]
    * @param {string | undefined} [fingerprint]
    * @param {string | undefined} [public_key]
    * @returns {Promise<WasmApiWalletData>}
    */
    createWallet(name, is_imported, wallet_type, has_passphrase, user_key_id, wallet_key, mnemonic, fingerprint, public_key) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(user_key_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(wallet_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(mnemonic) ? 0 : passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(fingerprint) ? 0 : passStringToWasm0(fingerprint, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(public_key) ? 0 : passStringToWasm0(public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len5 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_createWallet(this.__wbg_ptr, ptr0, len0, is_imported, wallet_type, has_passphrase, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @returns {Promise<void>}
    */
    deleteWallet(wallet_id) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_deleteWallet(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @returns {Promise<WasmApiWalletAccounts>}
    */
    getWalletAccounts(wallet_id) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_getWalletAccounts(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {WasmDerivationPath} derivation_path
    * @param {string} label
    * @param {WasmScriptType} script_type
    * @returns {Promise<WasmWalletAccountData>}
    */
    createWalletAccount(wallet_id, derivation_path, label, script_type) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(derivation_path, WasmDerivationPath);
        var ptr1 = derivation_path.__destroy_into_raw();
        const ptr2 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_createWalletAccount(this.__wbg_ptr, ptr0, len0, ptr1, ptr2, len2, script_type);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {string} wallet_account_id
    * @param {string} label
    * @returns {Promise<WasmWalletAccountData>}
    */
    updateWalletAccountLabel(wallet_id, wallet_account_id, label) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(wallet_account_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_updateWalletAccountLabel(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {string} wallet_account_id
    * @returns {Promise<void>}
    */
    deleteWalletAccount(wallet_id, wallet_account_id) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(wallet_account_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_deleteWalletAccount(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @returns {Promise<WasmApiWalletTransactions>}
    */
    getWalletTransactions(wallet_id) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_getWalletTransactions(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {string} label
    * @param {string} txid
    * @returns {Promise<WasmApiWalletTransaction>}
    */
    createWalletTransaction(wallet_id, label, txid) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(txid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_createWalletTransaction(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {string} wallet_transaction_id
    * @param {string} label
    * @returns {Promise<WasmApiWalletTransaction>}
    */
    updateWalletTransactionLabel(wallet_id, wallet_transaction_id, label) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(wallet_transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_updateWalletTransactionLabel(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {string} wallet_id
    * @param {string} wallet_transaction_id
    * @returns {Promise<void>}
    */
    deleteWalletTransaction(wallet_id, wallet_transaction_id) {
        const ptr0 = passStringToWasm0(wallet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(wallet_transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmwalletclient_deleteWalletTransaction(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return takeObject(ret);
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmtxbuilder_new(arg0) {
    const ret = WasmTxBuilder.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmutxo_new(arg0) {
    const ret = WasmUtxo.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiwalletdata_new(arg0) {
    const ret = WasmApiWalletData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiexchangeratedata_new(arg0) {
    const ret = WasmApiExchangeRateData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmoutpoint_new(arg0) {
    const ret = WasmOutPoint.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiwallettransactions_new(arg0) {
    const ret = WasmApiWalletTransactions.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiwallettransaction_new(arg0) {
    const ret = WasmApiWalletTransaction.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmtxin_new(arg0) {
    const ret = WasmTxIn.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiwalletaccounts_new(arg0) {
    const ret = WasmApiWalletAccounts.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmapiwalletsdata_new(arg0) {
    const ret = WasmApiWalletsData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmtransactiondetails_new(arg0) {
    const ret = WasmTransactionDetails.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmbalance_new(arg0) {
    const ret = WasmBalance.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmusersettingsdata_new(arg0) {
    const ret = WasmUserSettingsData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmtransactiondetailsarray_new(arg0) {
    const ret = WasmTransactionDetailsArray.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmrecipient_new(arg0) {
    const ret = WasmRecipient.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_detailledwasmerror_new(arg0) {
    const ret = DetailledWasmError.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmpartiallysignedtransaction_new(arg0) {
    const ret = WasmPartiallySignedTransaction.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmtxout_new(arg0) {
    const ret = WasmTxOut.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmpsbtrecipient_new(arg0) {
    const ret = WasmPsbtRecipient.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmwalletaccountdata_new(arg0) {
    const ret = WasmWalletAccountData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_wasmapiwalletdata_unwrap(arg0) {
    const ret = WasmApiWalletData.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_wasmwalletaccountdata_unwrap(arg0) {
    const ret = WasmWalletAccountData.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_wasmapiwallettransaction_unwrap(arg0) {
    const ret = WasmApiWalletTransaction.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_wasmtxin_unwrap(arg0) {
    const ret = WasmTxIn.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_wasmtxout_unwrap(arg0) {
    const ret = WasmTxOut.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_wasmtransactiondetails_unwrap(arg0) {
    const ret = WasmTransactionDetails.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_wasmutxo_unwrap(arg0) {
    const ret = WasmUtxo.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbindgen_json_parse(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_wasmpsbtrecipient_unwrap(arg0) {
    const ret = WasmPsbtRecipient.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_as_number(arg0) {
    const ret = +getObject(arg0);
    return ret;
};

export function __wbg_set_f975102236d3c502(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_fetch_9490421f75e0b282(arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_instanceof_Window_f401953a2cf86220(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_localStorage_e381d34d0c40c761() { return handleError(function (arg0) {
    const ret = getObject(arg0).localStorage;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_fetch_921fad6ef9e883dd(arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_signal_a61f78a3478fd9bc(arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
};

export function __wbg_new_0d76b0581eca6298() { return handleError(function () {
    const ret = new AbortController();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_abort_2aa7521d5690750e(arg0) {
    getObject(arg0).abort();
};

export function __wbg_getItem_164e8e5265095b87() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

export function __wbg_set_2ff617abddd9098d() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0)[getStringFromWasm0(arg1, arg2)] = getStringFromWasm0(arg3, arg4);
}, arguments) };

export function __wbg_instanceof_Response_849eb93e75734b6e(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_url_5f6dc4009ac5f99d(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_status_61a01141acd3cf74(arg0) {
    const ret = getObject(arg0).status;
    return ret;
};

export function __wbg_headers_9620bfada380764a(arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

export function __wbg_arrayBuffer_29931d52c7206b02() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_ab6fd82b10560829() { return handleError(function () {
    const ret = new Headers();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_append_7bfcb4937d1d5e29() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_newwithstrandinit_3fd6fba4083ff2d0() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_crypto_d05b68a3572bb8ca(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_process_b02b3570280d0366(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_c1cb42213cedf0f5(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_43b1089f407e4ec2(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_require_9a7e0f667ead4995() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_msCrypto_10fc94afee92bd76(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_b70ccbdf4926a99d() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_getRandomValues_7e42b4fb8779dc6d() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_queueMicrotask_3cbae2ec6b6cd3d6(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbg_queueMicrotask_481971b0d87f3dd4(arg0) {
    queueMicrotask(getObject(arg0));
};

export function __wbg_get_bd8e338fbd5f5cc8(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_length_cd7af8117672b8b8(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newnoargs_e258087cd0daa0ea(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_new_d9bc3a0147634640() {
    const ret = new Map();
    return addHeapObject(ret);
};

export function __wbg_next_40fc327bfc8770e6(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_next_196c84450b364254() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_298b57d23c0fc80c(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_value_d93c65011f51a456(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_iterator_2cee6dadfd956dfa() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_get_e3c254076557e348() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_27c0f87801dedf93() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_72fb9a18b5ae2624() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_self_ce0dbfc45cf2f5be() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_c6fb939a7f436783() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_d1e6af4856ba331b() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_207b558942527489() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_isArray_2ab64d95e09ea0ae(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_836825be07d4c9d2(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_call_b3ca7c6051f9bec1() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_8417257aaedc936b(arg0, arg1, arg2) {
    const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_isSafeInteger_f7b04ef02296c4d2(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

export function __wbg_new_81740750da40724f(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_419(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_b0083a7967828ec8(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_0c86a60e8fcfe9f6(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_a73caa9a87991566(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_buffer_12d079cc21e14bdb(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_63b92bc8671ed464(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_a47bac70306a19a7(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_c20a40f15020d68a(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_instanceof_Uint8Array_2b3bbecd033d19f6(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_newwithlength_e9b4878cebadb3d3(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_a1f73cd4b5b42fe1(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_has_0af94d20077affa2() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_set_1f9b04f170055d33() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_stringify_8887fe74e1c50d81() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper8588(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 1456, __wbg_adapter_42);
    return addHeapObject(ret);
};

