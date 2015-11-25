'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createResolver;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
    _lodash2.default.forEach(defaults, function (value, option) {
      setDefault(option, value);
    });

    return this;
  }

  function hasDefault(option) {
    return state.defaults.hasOwnProperty(option);
  }

  function setRequired(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be made required from a lazy option or normalizer.');
    }

    if (!_lodash2.default.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    _lodash2.default.forEach(optionNames, function (option) {
      state.defined[option] = true;
      state.required[option] = true;
    });

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
    return _lodash2.default.difference(_lodash2.default.keys(state.required), _lodash2.default.keys(state.defaults));
  }

  function setDefined(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be defined from a lazy option or normalizer.');
    }

    if (!_lodash2.default.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    _lodash2.default.forEach(optionNames, function (option) {
      state.defined[option] = true;
    });

    return this;
  }

  function isDefined(option) {
    return state.defined.hasOwnProperty(option) && null !== state.defined[option];
  }

  function getDefinedOptions() {
    return _lodash2.default.keys(state.defined);
  }

  function setNormalizer(option, normalizer) {
    if (state.locked) {
      throw new Error('Normalizers cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = _lodash2.default.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.normalizers[option] = normalizer;
    state.resolved = _lodash2.default.omit(state.resolved, option);

    return this;
  }

  function setAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = _lodash2.default.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.allowedValues[option] = _lodash2.default.isArray(values) ? values : [values];
    state.resolved = _lodash2.default.omit(state.resolved, option);

    return this;
  }

  function addAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = _lodash2.default.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    if (!_lodash2.default.isArray(values)) {
      values = [values];
    }

    if (!state.allowedValues.hasOwnProperty(option) || null === state.allowedValues[option]) {
      state.allowedValues[option] = values;
    } else {
      state.allowedValues[option] = [].concat(_toConsumableArray(state.allowedValues[option]), _toConsumableArray(values));
    }

    state.resolved = _lodash2.default.omit(state.resolved, option);

    return this;
  }

  function setAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = _lodash2.default.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    state.allowedTypes[option] = _lodash2.default.isArray(types) ? types : [types];
    state.resolved = _lodash2.default.omit(state.resolved, option);

    return this;
  }

  function addAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      var definedOptions = _lodash2.default.keys(state.defined).join('", "');
      throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
    }

    if (!_lodash2.default.isArray(types)) {
      types = [types];
    }

    if (!state.allowedTypes.hasOwnProperty(option) || null === state.allowedTypes[option]) {
      state.allowedTypes[option] = types;
    } else {
      state.allowedTypes[option] = [].concat(_toConsumableArray(state.allowedTypes[option]), _toConsumableArray(types));
    }

    state.resolved = _lodash2.default.omit(state.resolved, option);

    return this;
  }

  function remove(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be removed from a lazy option or normalizer.');
    }

    state.defined = _lodash2.default.omit(state.defined, optionNames);
    state.defaults = _lodash2.default.omit(state.defaults, optionNames);
    state.required = _lodash2.default.omit(state.required, optionNames);
    state.resolved = _lodash2.default.omit(state.resolved, optionNames);
    state.lazy = _lodash2.default.omit(state.lazy, optionNames);
    state.normalizers = _lodash2.default.omit(state.normalizers, optionNames);
    state.allowedValues = _lodash2.default.omit(state.allowedValues, optionNames);
    state.allowedTypes = _lodash2.default.omit(state.allowedTypes, optionNames);

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
    var callback = arguments[1];

    return new Promise(function (resolve, reject) {

      function throwError(err, args) {
        if (_lodash2.default.isFunction(callback)) {
          return callback(err, args);
        }

        return reject(err);
      }

      if (state.locked) {
        var err = new Error('Options cannot be state.resolved from a lazy option or normalizer.');
        return throwError(err);
      }

      clone = _lodash2.default.clone(state, true);
      var definedDiff = _lodash2.default.difference(Object.keys(options), Object.keys(clone.defined));

      if (definedDiff.length) {
        var definedKeys = _lodash2.default.sortBy(Object.keys(clone.defined)).join('", "');
        var diffKeys = _lodash2.default.sortBy(definedDiff).join('", "');
        var err = 'The option(s) "' + diffKeys + '" do not exist. Defined options are: "' + definedKeys + '"';
        return throwError(err);
      }

      clone.defaults = _lodash2.default.merge(clone.defaults, options);
      clone.resolved = _lodash2.default.omit(clone.resolved, Object.keys(options));
      clone.lazy = _lodash2.default.omit(clone.lazy, options);

      var requiredDiff = _lodash2.default.difference(Object.keys(clone.required), Object.keys(clone.defaults));
      if (requiredDiff.length) {
        var diffKeys = _lodash2.default.sortBy(requiredDiff).join('", "');
        var err = 'The required options "' + diffKeys + '" are missing';
        return throwError(err);
      }

      clone.locked = true;
      for (var option in clone.defaults) {
        get(option);
      }

      var resolved = _lodash2.default.clone(clone.resolved, true);
      clone = { locked: false };

      if (_lodash2.default.isFunction(callback)) {
        return callback(undefined, resolved);
      }

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
        var definedOptions = _lodash2.default.keys(clone.defined).join('", "');
        throw new Error('The option "' + option + '" does not exist. Defined options are : "' + definedOptions + '"');
      }

      throw new Error('The optional option "' + option + '" has no value set. You should make sure it is set with "isset" before reading it.');
    }

    var value = clone.defaults[option];

    // @todo : process lazy option
    if (clone.allowedTypes.hasOwnProperty(option) && null !== clone.allowedTypes[option]) {
      var valid = false;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = clone.allowedTypes[option][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var allowedType = _step.value;

          var functionName = 'is' + allowedType.charAt(0).toUpperCase() + allowedType.substr(1).toLowerCase();
          if (_lodash2.default.hasOwnProperty(functionName)) {
            if (_lodash2.default[functionName](value)) {
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

      if (!valid) {
        // @todo add better log error
        throw new Error('Invalid type for option "' + option + '".');
      }
    }

    if (clone.allowedValues.hasOwnProperty(option) && null !== clone.allowedValues[option]) {
      var success = false;
      var printableAllowedValues = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = clone.allowedValues[option][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var allowedValue = _step2.value;

          if (_lodash2.default.isFunction(allowedValue)) {
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
        clone.calling = _lodash2.default.omit(clone.calling, option);
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