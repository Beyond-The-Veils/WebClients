/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_wasmpsbtrecipient_free(a: number): void;
export function __wbg_get_wasmpsbtrecipient_0(a: number, b: number): void;
export function __wbg_set_wasmpsbtrecipient_0(a: number, b: number, c: number): void;
export function __wbg_wasmpartiallysignedtransaction_free(a: number): void;
export function __wbg_get_wasmpartiallysignedtransaction_recipients(a: number, b: number): void;
export function __wbg_set_wasmpartiallysignedtransaction_recipients(a: number, b: number, c: number): void;
export function __wbg_get_wasmpartiallysignedtransaction_total_fees(a: number): number;
export function __wbg_set_wasmpartiallysignedtransaction_total_fees(a: number, b: number): void;
export function wasmpartiallysignedtransaction_sign(a: number, b: number, c: number): number;
export function __wbg_wasmlocktime_free(a: number): void;
export function wasmlocktime_fromHeight(a: number): number;
export function wasmlocktime_fromSeconds(a: number): number;
export function wasmlocktime_isBlockHeight(a: number): number;
export function wasmlocktime_isBlockTime(a: number): number;
export function wasmlocktime_toConsensusU32(a: number): number;
export function __wbg_wasmutxo_free(a: number): void;
export function __wbg_get_wasmutxo_outpoint(a: number): number;
export function __wbg_set_wasmutxo_outpoint(a: number, b: number): void;
export function __wbg_get_wasmutxo_script_pubkey(a: number): number;
export function __wbg_set_wasmutxo_script_pubkey(a: number, b: number): void;
export function __wbg_get_wasmutxo_keychain(a: number): number;
export function __wbg_set_wasmutxo_keychain(a: number, b: number): void;
export function __wbg_get_wasmutxo_is_spent(a: number): number;
export function __wbg_set_wasmutxo_is_spent(a: number, b: number): void;
export function __wbg_get_wasmutxo_derivation_index(a: number): number;
export function __wbg_set_wasmutxo_derivation_index(a: number, b: number): void;
export function __wbg_get_wasmutxo_confirmation_time(a: number): number;
export function __wbg_set_wasmutxo_confirmation_time(a: number, b: number): void;
export function library_version(a: number): void;
export function __wbg_get_wasmpsbtrecipient_1(a: number): number;
export function __wbg_get_wasmutxo_value(a: number): number;
export function __wbg_set_wasmpsbtrecipient_1(a: number, b: number): void;
export function __wbg_set_wasmutxo_value(a: number, b: number): void;
export function __wbg_wasmderivationpath_free(a: number): void;
export function wasmderivationpath_new(a: number, b: number, c: number): void;
export function wasmderivationpath_fromRawTs(a: number): number;
export function __wbg_wasmpagination_free(a: number): void;
export function __wbg_get_wasmpagination_skip(a: number): number;
export function __wbg_set_wasmpagination_skip(a: number, b: number): void;
export function __wbg_get_wasmpagination_take(a: number): number;
export function __wbg_set_wasmpagination_take(a: number, b: number): void;
export function wasmpagination_new(a: number, b: number): number;
export function __wbg_wasmwallet_free(a: number): void;
export function __wbg_wasmwalletconfig_free(a: number): void;
export function __wbg_get_wasmwalletconfig_network(a: number): number;
export function __wbg_set_wasmwalletconfig_network(a: number, b: number): void;
export function __wbg_get_wasmwalletconfig_no_persist(a: number): number;
export function __wbg_set_wasmwalletconfig_no_persist(a: number, b: number): void;
export function wasmwalletconfig_new(a: number, b: number): number;
export function wasmwallet_new(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function wasmwallet_addAccount(a: number, b: number, c: number, d: number): void;
export function wasmwallet_getAccount(a: number, b: number): number;
export function wasmwallet_getBalance(a: number): number;
export function wasmwallet_getTransactions(a: number, b: number): number;
export function wasmwallet_getTransaction(a: number, b: number, c: number, d: number): number;
export function wasmwallet_getFingerprint(a: number, b: number): void;
export function __wbg_wasmaccount_free(a: number): void;
export function __wbg_wasmaccountconfig_free(a: number): void;
export function __wbg_get_wasmaccountconfig_script_type(a: number): number;
export function __wbg_set_wasmaccountconfig_script_type(a: number, b: number): void;
export function __wbg_get_wasmaccountconfig_network(a: number): number;
export function __wbg_set_wasmaccountconfig_network(a: number, b: number): void;
export function __wbg_get_wasmaccountconfig_account_index(a: number): number;
export function __wbg_set_wasmaccountconfig_account_index(a: number, b: number): void;
export function wasmaccountconfig_new(a: number, b: number, c: number, d: number): number;
export function wasmaccount_hasSyncData(a: number): number;
export function wasmaccount_getBitcoinUri(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number): number;
export function wasmaccount_owns(a: number, b: number): number;
export function wasmaccount_getBalance(a: number): number;
export function wasmaccount_getDerivationPath(a: number): number;
export function wasmaccount_getUtxos(a: number): number;
export function wasmaccount_getTransactions(a: number, b: number): number;
export function wasmaccount_getTransaction(a: number, b: number, c: number): number;
export function setPanicHook(): void;
export function __wbg_wasmmnemonic_free(a: number): void;
export function wasmmnemonic_new(a: number, b: number): void;
export function wasmmnemonic_fromString(a: number, b: number, c: number): void;
export function wasmmnemonic_asString(a: number, b: number): void;
export function wasmmnemonic_toWords(a: number, b: number): void;
export function getWordsAutocomplete(a: number, b: number, c: number): void;
export function __wbg_wasmpaymentlink_free(a: number): void;
export function __wbg_wasmonchainpaymentlink_free(a: number): void;
export function __wbg_get_wasmonchainpaymentlink_address(a: number, b: number): void;
export function __wbg_set_wasmonchainpaymentlink_address(a: number, b: number, c: number): void;
export function __wbg_get_wasmonchainpaymentlink_amount(a: number, b: number): void;
export function __wbg_set_wasmonchainpaymentlink_amount(a: number, b: number, c: number): void;
export function __wbg_get_wasmonchainpaymentlink_message(a: number, b: number): void;
export function __wbg_set_wasmonchainpaymentlink_message(a: number, b: number, c: number): void;
export function __wbg_get_wasmonchainpaymentlink_label(a: number, b: number): void;
export function __wbg_set_wasmonchainpaymentlink_label(a: number, b: number, c: number): void;
export function wasmpaymentlink_toString(a: number, b: number): void;
export function wasmpaymentlink_toUri(a: number, b: number): void;
export function wasmpaymentlink_tryParse(a: number, b: number, c: number, d: number): void;
export function wasmpaymentlink_getKind(a: number): number;
export function wasmpaymentlink_assumeOnchain(a: number): number;
export function __wbg_wasmtxbuilder_free(a: number): void;
export function __wbg_wasmrecipient_free(a: number): void;
export function __wbg_get_wasmrecipient_0(a: number, b: number): void;
export function __wbg_set_wasmrecipient_0(a: number, b: number, c: number): void;
export function __wbg_get_wasmrecipient_1(a: number, b: number): void;
export function __wbg_set_wasmrecipient_1(a: number, b: number, c: number): void;
export function __wbg_get_wasmrecipient_2(a: number): number;
export function __wbg_set_wasmrecipient_2(a: number, b: number): void;
export function __wbg_get_wasmrecipient_3(a: number): number;
export function __wbg_set_wasmrecipient_3(a: number, b: number): void;
export function wasmtxbuilder_new(): number;
export function wasmtxbuilder_setAccount(a: number, b: number): number;
export function wasmtxbuilder_clearRecipients(a: number): number;
export function wasmtxbuilder_addRecipient(a: number): number;
export function wasmtxbuilder_removeRecipient(a: number, b: number): number;
export function wasmtxbuilder_updateRecipient(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function wasmtxbuilder_updateRecipientAmountToMax(a: number, b: number): number;
export function wasmtxbuilder_getRecipients(a: number, b: number): void;
export function wasmtxbuilder_addUtxoToSpend(a: number, b: number, c: number): void;
export function wasmtxbuilder_removeUtxoToSpend(a: number, b: number, c: number): void;
export function wasmtxbuilder_clearUtxosToSpend(a: number): number;
export function wasmtxbuilder_getUtxosToSpend(a: number, b: number): void;
export function wasmtxbuilder_setCoinSelection(a: number, b: number): number;
export function wasmtxbuilder_getCoinSelection(a: number): number;
export function wasmtxbuilder_enableRbf(a: number): number;
export function wasmtxbuilder_disableRbf(a: number): number;
export function wasmtxbuilder_getRbfEnabled(a: number): number;
export function wasmtxbuilder_setChangePolicy(a: number, b: number): number;
export function wasmtxbuilder_getChangePolicy(a: number): number;
export function wasmtxbuilder_setFeeRate(a: number, b: number): number;
export function wasmtxbuilder_getFeeRate(a: number, b: number): void;
export function wasmtxbuilder_addLocktime(a: number, b: number): number;
export function wasmtxbuilder_removeLocktime(a: number): number;
export function wasmtxbuilder_getLocktime(a: number): number;
export function wasmtxbuilder_createPsbt(a: number, b: number): number;
export function __wbg_detailledwasmerror_free(a: number): void;
export function __wbg_get_detailledwasmerror_kind(a: number): number;
export function __wbg_set_detailledwasmerror_kind(a: number, b: number): void;
export function __wbg_get_detailledwasmerror_details(a: number): number;
export function __wbg_set_detailledwasmerror_details(a: number, b: number): void;
export function __wbg_wasmchain_free(a: number): void;
export function wasmchain_new(a: number): void;
export function wasmchain_getFeesEstimation(a: number): number;
export function wasmchain_fullSync(a: number, b: number): number;
export function wasmchain_partialSync(a: number, b: number): number;
export function wasmchain_broadcastPsbt(a: number, b: number): number;
export function __wbg_wasmaddress_free(a: number): void;
export function wasmaddress_new(a: number, b: number, c: number, d: number): void;
export function wasmaddress_fromScript(a: number, b: number, c: number): void;
export function wasmaddress_toString(a: number, b: number): void;
export function wasmaddress_intoScript(a: number): number;
export function __wbg_wasmaddressinfo_free(a: number): void;
export function wasmaddressinfo_to_string(a: number, b: number): void;
export function __wbg_wasmbalance_free(a: number): void;
export function __wbg_get_wasmbalance_immature(a: number): number;
export function __wbg_set_wasmbalance_immature(a: number, b: number): void;
export function __wbg_get_wasmbalance_trusted_pending(a: number): number;
export function __wbg_set_wasmbalance_trusted_pending(a: number, b: number): void;
export function __wbg_get_wasmbalance_untrusted_pending(a: number): number;
export function __wbg_set_wasmbalance_untrusted_pending(a: number, b: number): void;
export function __wbg_get_wasmbalance_confirmed(a: number): number;
export function __wbg_set_wasmbalance_confirmed(a: number, b: number): void;
export function __wbg_wasmscript_free(a: number): void;
export function __wbg_get_wasmscript_0(a: number, b: number): void;
export function __wbg_set_wasmscript_0(a: number, b: number, c: number): void;
export function wasmscript_toAddress(a: number, b: number, c: number): void;
export function __wbg_wasmoutpoint_free(a: number): void;
export function __wbg_get_wasmoutpoint_0(a: number, b: number): void;
export function __wbg_set_wasmoutpoint_0(a: number, b: number, c: number): void;
export function wasmoutpoint_fromRawTs(a: number): number;
export function __wbg_wasmsequence_free(a: number): void;
export function __wbg_get_wasmsequence_0(a: number): number;
export function __wbg_set_wasmsequence_0(a: number, b: number): void;
export function __wbg_wasmtxin_free(a: number): void;
export function __wbg_get_wasmtxin_previous_output(a: number): number;
export function __wbg_set_wasmtxin_previous_output(a: number, b: number): void;
export function __wbg_get_wasmtxin_script_sig(a: number): number;
export function __wbg_set_wasmtxin_script_sig(a: number, b: number): void;
export function __wbg_get_wasmtxin_sequence(a: number): number;
export function __wbg_set_wasmtxin_sequence(a: number, b: number): void;
export function __wbg_wasmtxout_free(a: number): void;
export function __wbg_get_wasmtxout_script_pubkey(a: number): number;
export function __wbg_set_wasmtxout_script_pubkey(a: number, b: number): void;
export function __wbg_get_wasmtxout_address(a: number): number;
export function __wbg_set_wasmtxout_address(a: number, b: number): void;
export function __wbg_get_wasmtxout_is_mine(a: number): number;
export function __wbg_set_wasmtxout_is_mine(a: number, b: number): void;
export function __wbg_wasmdetailledtransaction_free(a: number): void;
export function __wbg_get_wasmdetailledtransaction_txid(a: number, b: number): void;
export function __wbg_set_wasmdetailledtransaction_txid(a: number, b: number, c: number): void;
export function __wbg_get_wasmdetailledtransaction_fees(a: number, b: number): void;
export function __wbg_set_wasmdetailledtransaction_fees(a: number, b: number, c: number): void;
export function __wbg_get_wasmdetailledtransaction_time(a: number): number;
export function __wbg_set_wasmdetailledtransaction_time(a: number, b: number): void;
export function __wbg_get_wasmdetailledtransaction_inputs(a: number, b: number): void;
export function __wbg_set_wasmdetailledtransaction_inputs(a: number, b: number, c: number): void;
export function __wbg_get_wasmdetailledtransaction_outputs(a: number, b: number): void;
export function __wbg_set_wasmdetailledtransaction_outputs(a: number, b: number, c: number): void;
export function wasmdetailledtransaction_fromPsbt(a: number, b: number): number;
export function __wbg_wasmtransactiontime_free(a: number): void;
export function __wbg_get_wasmtransactiontime_confirmed(a: number): number;
export function __wbg_set_wasmtransactiontime_confirmed(a: number, b: number): void;
export function __wbg_get_wasmtransactiontime_last_seen(a: number, b: number): void;
export function __wbg_set_wasmtransactiontime_last_seen(a: number, b: number, c: number): void;
export function __wbg_wasmsimpletransaction_free(a: number): void;
export function __wbg_get_wasmsimpletransaction_txid(a: number, b: number): void;
export function __wbg_set_wasmsimpletransaction_txid(a: number, b: number, c: number): void;
export function __wbg_get_wasmsimpletransaction_time(a: number): number;
export function __wbg_set_wasmsimpletransaction_time(a: number, b: number): void;
export function __wbg_get_wasmsimpletransaction_account_key(a: number): number;
export function __wbg_set_wasmsimpletransaction_account_key(a: number, b: number): void;
export function __wbg_set_wasmtxout_value(a: number, b: number): void;
export function __wbg_set_wasmdetailledtransaction_value(a: number, b: number): void;
export function __wbg_set_wasmsimpletransaction_value(a: number, b: number): void;
export function __wbg_set_wasmtransactiontime_confirmation_time(a: number, b: number, c: number): void;
export function __wbg_set_wasmsimpletransaction_fees(a: number, b: number, c: number): void;
export function __wbg_get_wasmtxout_value(a: number): number;
export function __wbg_get_wasmdetailledtransaction_value(a: number): number;
export function __wbg_get_wasmsimpletransaction_value(a: number): number;
export function wasmaddressinfo_index(a: number): number;
export function __wbg_get_wasmtransactiontime_confirmation_time(a: number, b: number): void;
export function __wbg_get_wasmsimpletransaction_fees(a: number, b: number): void;
export function rustsecp256k1_v0_8_1_context_create(a: number): number;
export function rustsecp256k1_v0_8_1_context_destroy(a: number): void;
export function rustsecp256k1_v0_8_1_default_illegal_callback_fn(a: number, b: number): void;
export function rustsecp256k1_v0_8_1_default_error_callback_fn(a: number, b: number): void;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb081624c6f6d725a(a: number, b: number, c: number): void;
export function _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h21d05c7e3334b6dd(a: number, b: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
export function wasm_bindgen__convert__closures__invoke2_mut__h552e6e06cf548f58(a: number, b: number, c: number, d: number): void;
