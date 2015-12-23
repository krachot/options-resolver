'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createResolver;

var _difference = require('lodash/array/difference');

var _difference2 = _interopRequireDefault(_difference);

var _object = require('lodash/object');

var _lang = require('lodash/lang');

var _lang2 = _interopRequireDefault(_lang);

var _sortBy = require('lodash/collection/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function createResolver() {
  var state = {
    defined: {},
    defaults: {},
    required: {},
    resolved: {},
    normalizers: {},
    allowedValues: {},
    allowedTypes: {},
    lazy: {},
    calling: {},
    locked: false
  };

  var clone = { locked: false };

  function setDefault(option, value) {
    if (state.locked) {
      throw new Error('Default values cannot be set from a lazy option or normalizer.');
    }

    if (!state.defined.hasOwnProperty(option) || null === state.defined[option] || state.resolved.hasOwnProperty(option)) {
      state.resolved[option] = value;
    }

    state.defaults[option] = value;
    state.defined[option] = true;

    return this;
  }

  function setDefaults(defaults) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(defaults)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var option = _step.value;

        setDefault(option, defaults[option]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return this;
  }

  function hasDefault(option) {
    return state.defaults.hasOwnProperty(option);
  }

  function setRequired(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be made required from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = optionNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var option = _step2.value;

        state.defined[option] = true;
        state.required[option] = true;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return this;
  }

  function isRequired(option) {
    return state.required.hasOwnProperty(option) && null !== state.required[option];
  }

  function getRequiredOptions() {
    return Object.keys(state.required);
  }

  function isMissing(option) {
    return isRequired(option) && !hasDefault(option);
  }

  function getMissingOptions() {
    return (0, _difference2.default)(Object.keys(state.required), Object.keys(state.defaults));
  }

  function setDefined(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be defined from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = optionNames[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var option = _step3.value;

        state.defined[option] = true;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return this;
  }

  function isDefined(option) {
    return state.defined.hasOwnProperty(option) && null !== state.defined[option];
  }

  function getDefinedOptions() {
    return Object.keys(state.defined);
  }

  function setNormalizer(option, normalizer) {
    if (state.locked) {
      throw new Error('Normalizers cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = Object.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.normalizers[option] = normalizer;
    state.resolved = (0, _object.omit)(state.resolved, option);

    return this;
  }

  function setAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = Object.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.allowedValues[option] = Array.isArray(values) ? values : [values];
    state.resolved = (0, _object.omit)(state.resolved, option);

    return this;
  }

  function addAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = Object.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    if (!state.allowedValues.hasOwnProperty(option) || null === state.allowedValues[option]) {
      state.allowedValues[option] = values;
    } else {
      state.allowedValues[option] = [].concat(_toConsumableArray(state.allowedValues[option]), _toConsumableArray(values));
    }

    state.resolved = (0, _object.omit)(state.resolved, option);

    return this;
  }

  function setAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = Object.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.allowedTypes[option] = Array.isArray(types) ? types : [types];
    state.resolved = (0, _object.omit)(state.resolved, option);

    return this;
  }

  function addAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = Object.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    if (!Array.isArray(types)) {
      types = [types];
    }

    if (!state.allowedTypes.hasOwnProperty(option) || null === state.allowedTypes[option]) {
      state.allowedTypes[option] = types;
    } else {
      state.allowedTypes[option] = [].concat(_toConsumableArray(state.allowedTypes[option]), _toConsumableArray(types));
    }

    state.resolved = (0, _object.omit)(state.resolved, option);

    return this;
  }

  function remove(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be removed from a lazy option or normalizer.');
    }

    state.defined = (0, _object.omit)(state.defined, optionNames);
    state.defaults = (0, _object.omit)(state.defaults, optionNames);
    state.required = (0, _object.omit)(state.required, optionNames);
    state.resolved = (0, _object.omit)(state.resolved, optionNames);
    state.lazy = (0, _object.omit)(state.lazy, optionNames);
    state.normalizers = (0, _object.omit)(state.normalizers, optionNames);
    state.allowedValues = (0, _object.omit)(state.allowedValues, optionNames);
    state.allowedTypes = (0, _object.omit)(state.allowedTypes, optionNames);

    return this;
  }

  function clear() {
    if (state.locked) {
      throw new Error('Options cannot be cleared from a lazy option or normalizer.');
    }

    state.defined = {};
    state.defaults = {};
    state.required = {};
    state.resolved = {};
    state.lazy = {};
    state.normalizers = {};
    state.allowedValues = {};
    state.allowedTypes = {};
    state.calling = {};

    return this;
  }

  function resolve() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return new Promise(function (resolve, reject) {
      if (state.locked) {
        var err = new Error('Options cannot be state.resolved from a lazy option or normalizer.');
        return reject(err);
      }

      clone = _lang2.default.clone(state, true);
      var definedDiff = (0, _difference2.default)(Object.keys(options), Object.keys(clone.defined));

      if (definedDiff.length) {
        var definedKeys = (0, _sortBy2.default)(Object.keys(clone.defined)).join('", "');
        var diffKeys = (0, _sortBy2.default)(definedDiff).join('", "');
        var err = 'The option(s) "' + diffKeys + '" do not exist. Defined options are: "' + definedKeys + '"';
        return reject(err);
      }

      clone.defaults = (0, _object.merge)(clone.defaults, options);
      clone.resolved = (0, _object.omit)(clone.resolved, Object.keys(options));
      clone.lazy = (0, _object.omit)(clone.lazy, options);

      var requiredDiff = (0, _difference2.default)(Object.keys(clone.required), Object.keys(clone.defaults));
      if (requiredDiff.length) {
        var diffKeys = (0, _sortBy2.default)(requiredDiff).join('", "');
        var err = 'The required options "' + diffKeys + '" are missing';
        return reject(err);
      }

      clone.locked = true;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(clone.defaults)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var option = _step4.value;

          get(option);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var resolved = _lang2.default.clone(clone.resolved, true);
      clone = { locked: false };

      resolve(resolved);
    });
  }

  function get(option) {
    if (!clone.locked) {
      throw new Error('get is only supported within closures of lazy options and normalizers.');
    }

    if (clone.resolved.hasOwnProperty(option)) {
      return clone.resolved[option];
    }

    if (!clone.defaults.hasOwnProperty(option)) {
      if (!clone.defined.hasOwnProperty(option) || null === clone.defined[option]) {
        var definedOptions = Object.keys(clone.defined).join('", "');
        throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
      }

      throw new Error('The optional option "' + option + '" has no value set. You should make sure it is set with "isset" before reading it.');
    }

    var value = clone.defaults[option];

    // @todo : process lazy option
    if (clone.allowedTypes.hasOwnProperty(option) && null !== clone.allowedTypes[option]) {
      var valid = false;

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = clone.allowedTypes[option][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var allowedType = _step5.value;

          var functionName = 'is' + allowedType.charAt(0).toUpperCase() + allowedType.substr(1).toLowerCase();
          if (_lang2.default.hasOwnProperty(functionName)) {
            if (_lang2.default[functionName](value)) {
              valid = true;
              break;
            }

            continue;
          }

          if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === allowedType) {
            valid = true;
            break;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      if (!valid) {
        // @todo add better log error
        throw new Error('Invalid type for option "' + option + '".');
      }
    }

    if (clone.allowedValues.hasOwnProperty(option) && null !== clone.allowedValues[option]) {
      var success = false;
      var printableAllowedValues = [];

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = clone.allowedValues[option][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var allowedValue = _step6.value;

          if (_lang2.default.isFunction(allowedValue)) {
            if (allowedValue(value)) {
              success = true;
              break;
            }

            continue;
          } else if (value === allowedValue) {
            success = true;
            break;
          }

          printableAllowedValues.push(allowedValue);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      if (!success) {
        var message = 'The option "' + option + '" is invalid.';
        if (printableAllowedValues.length) {
          message += ' Accepted values are : ' + printableAllowedValues.join(', ');
        }

        throw new Error(message);
      }
    }

    if (clone.normalizers.hasOwnProperty(option) && null !== clone.normalizers[option]) {
      if (clone.calling.hasOwnProperty(option) && null !== clone.calling[option]) {
        var callingKeys = Object.keys(clone.calling).join('", "');
        throw new Error('The options "' + callingKeys + '" have a cyclic dependency');
      }

      var normalizer = clone.normalizers[option];
      clone.calling[option] = true;
      try {
        value = normalizer(value);
      } finally {
        clone.calling = (0, _object.omit)(clone.calling, option);
      }
    }

    clone.resolved[option] = value;

    return value;
  }

  return {
    setDefault: setDefault,
    setDefaults: setDefaults,
    hasDefault: hasDefault,
    setRequired: setRequired,
    isRequired: isRequired,
    getRequiredOptions: getRequiredOptions,
    isMissing: isMissing,
    getMissingOptions: getMissingOptions,
    setDefined: setDefined,
    isDefined: isDefined,
    getDefinedOptions: getDefinedOptions,
    setNormalizer: setNormalizer,
    setAllowedValues: setAllowedValues,
    addAllowedValues: addAllowedValues,
    setAllowedTypes: setAllowedTypes,
    addAllowedTypes: addAllowedTypes,
    remove: remove,
    clear: clear,
    resolve: resolve,
    get: get
  };
}