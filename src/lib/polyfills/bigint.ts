// Ensure BigInt values can be JSON-stringified in the browser.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/BigInt_not_serializable
// and https://wagmi.sh/core/guides/faq#bigint-serialization
if (typeof BigInt !== "undefined" && !(BigInt.prototype as { toJSON?: () => string }).toJSON) {
  // eslint-disable-next-line no-extend-native
  (BigInt.prototype as { toJSON?: () => string }).toJSON = function () {
    return this.toString();
  };
}
