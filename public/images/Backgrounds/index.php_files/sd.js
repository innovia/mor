/*=prototype.js */

var Prototype = {
  Version: '1.6.1',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div');
      var form = document.createElement('form');
      var isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString;

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }


  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return typeof object === "function";
  }

  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());


Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function toJSON() {
    return this.inspect(true);
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.indexOf(pattern) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim ? String.prototype.trim : strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }

  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 500;
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});



function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}


(function(global) {

  var SETATTRIBUTE_IGNORES_NAME = (function(){
    var elForm = document.createElement("form");
    var elInput = document.createElement("input");
    var root = document.documentElement;
    elInput.setAttribute("name", "test");
    elForm.appendChild(elInput);
    root.appendChild(elForm);
    var isBuggy = elForm.elements
      ? (typeof elForm.elements.test == "undefined")
      : null;
    root.removeChild(elForm);
    elForm = elInput = null;
    return isBuggy;
  })();

  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (SETATTRIBUTE_IGNORES_NAME && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
})(this);

Element.cache = { };
Element.idCounter = 1;

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },


  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();

    function update(element, content) {
      element = $(element);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = Element.previousSiblings(element);
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = Element.nextSiblings(element);
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },


  select: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element, args);
  },

  adjacent: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
      els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'absolute') return element;

    var offsets = Element.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    //while ((element = element.parentNode) && element != document.body)
    while ((element = element.parentNode) && element != document.body && element != document)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source);

    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className';
    var forProp = 'for';

    var el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div');
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');
            var f;

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'))

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2);
        var el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName);
    var proto = element['__proto__'] || element.constructor.prototype;
    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = [Element.Storage.UID++];
      uid = element._prototypeUID[0];
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  }
});
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: (function() {

    var IS_DESCENDANT_SELECTOR_BUGGY = (function(){
      var isBuggy = false;
      if (document.evaluate && window.XPathResult) {
        var el = document.createElement('div');
        el.innerHTML = '<ul><li></li></ul><div><ul><li></li></ul></div>';

        var xpath = ".//*[local-name()='ul' or local-name()='UL']" +
          "//*[local-name()='li' or local-name()='LI']";

        var result = document.evaluate(xpath, el, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        isBuggy = (result.snapshotLength !== 2);
        el = null;
      }
      return isBuggy;
    })();

    return function() {
      if (!Prototype.BrowserFeatures.XPath) return false;

      var e = this.expression;

      if (Prototype.Browser.WebKit &&
       (e.include("-of-type") || e.include(":empty")))
        return false;

      if ((/(\[[\w-]*?:|:checked)/).test(e))
        return false;

      if (IS_DESCENDANT_SELECTOR_BUGGY) return false;

      return true;
    }

  })(),

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (Selector.CASE_INSENSITIVE_CLASS_NAMES) return false;

    if (!Selector._div) Selector._div = new Element('div');

    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[name]) ? c[name](m) :
            new Template(c[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        name = ps[i].name;
        if (m = e.match(ps[i].re)) {
          this.matcher.push(Object.isFunction(x[name]) ? x[name](m) :
            new Template(x[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          id = id.replace(/([\.:])/g, "\\$1");
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m, len = ps.length, name;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          if (as[name]) {
            this.tokens.push([name, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

if (Prototype.BrowserFeatures.SelectorsAPI &&
 document.compatMode === 'BackCompat') {
  Selector.CASE_INSENSITIVE_CLASS_NAMES = (function(){
    var div = document.createElement('div'),
     span = document.createElement('span');

    div.id = "prototype_test_id";
    span.className = 'Test';
    div.appendChild(span);
    var isIgnored = (div.querySelector('#prototype_test_id .test') !== null);
    div = span = null;
    return isIgnored;
  })();
}

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v, len = p.length, name;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i = 0; i<len; i++) {
            name = p[i].name
            if (m = e.match(p[i].re)) {
              v = Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: [
    { name: 'laterSibling', re: /^\s*~\s*/ },
    { name: 'child',        re: /^\s*>\s*/ },
    { name: 'adjacent',     re: /^\s*\+\s*/ },
    { name: 'descendant',   re: /^\s/ },

    { name: 'tagName',      re: /^\s*(\*|[\w\-]+)(\b|$)?/ },
    { name: 'id',           re: /^#([\w\-\*]+)(\b|$)/ },
    { name: 'className',    re: /^\.([\w\-\*]+)(\b|$)/ },
    { name: 'pseudo',       re: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/ },
    { name: 'attrPresence', re: /^\[((?:[\w-]+:)?[\w-]+)\]/ },
    { name: 'attr',         re: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/ }
  ],

  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: (function(){

      var PROPERTIES_ATTRIBUTES_MAP = (function(){
        var el = document.createElement('div'),
            isBuggy = false,
            propName = '_countedByPrototype',
            value = 'x'
        el[propName] = value;
        isBuggy = (el.getAttribute(propName) === value);
        el = null;
        return isBuggy;
      })();

      return PROPERTIES_ATTRIBUTES_MAP ?
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node.removeAttribute('_countedByPrototype');
          return nodes;
        } :
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node._countedByPrototype = void 0;
          return nodes;
        }
    })(),

    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (typeof (n = nodes[i])._countedByPrototype == 'undefined') {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;

      if (root == document) {
        if (!targetNode) return [];
        if (!nodes) return [targetNode];
      } else {
        if (!root.sourceIndex || root.sourceIndex < 1) {
          var nodes = root.getElementsByTagName('*');
          for (var j = 0, node; node = nodes[j]; j++) {
            if (node.id === id) return [node];
          }
        }
      }

      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;

  var _isButton;
  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    _isButton = function(event, code) {
      return event.button === buttonMap[code];
    };
  } else if (Prototype.Browser.WebKit) {
    _isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };
  } else {
    _isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);
    if (!expression) return element;
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0);
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }

  Event.Methods = {
    isLeftClick: isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick: isRightClick,

    element: element,
    findElement: findElement,

    pointer: pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };


  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover': element = event.fromElement; break;
        case 'mouseout':  element = event.toElement;   break;
        default: return null;
      }
      return Element.extend(element);
    }

    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    });

    Event.extend = function(event, element) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      return Object.extend(event, methods);
    };
  } else {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
    Event.extend = Prototype.K;
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K;

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      var translations = { mouseenter: "mouseover", mouseleave: "mouseout" };
      return eventName in translations ? translations[eventName] : eventName;
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onfilterchange", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) return element;

    if (eventName && !handler) {
      var responders = registry.get(eventName);

      if (Object.isUndefined(responders)) return element;

      responders.each( function(r) {
        Element.stopObserving(element, eventName, r.handler);
      });
      return element;
    } else if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key, responders = pair.value;

        responders.each( function(r) {
          Element.stopObserving(element, eventName, r.handler);
        });
      });
      return element;
    }

    var responders = registry.get(eventName);

    if (!responders) return;

    var responder = responders.find( function(r) { return r.handler === handler; });
    if (!responder) return element;

    var actualEventName = _getDOMEventName(eventName);

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onfilterchange",  responder);
      }
    } else {
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', true, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onfilterchange';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }


  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);


/* =prototype-ext.js */


String.prototype.ucfirst = function() {
	return this.substr(0, 1).toUpperCase() + this.substr(1);
};
String.prototype.excerpt = function(nLen) {
	return this.truncate(nLen-1, '\u2026');
};

String.prototype.trim = String.prototype.strip;


Prototype.Browser.IE6 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 6;
Prototype.Browser.IE7 = Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 7;
Prototype.Browser.IE8 = Prototype.Browser.IE && !Prototype.Browser.IE6 && !Prototype.Browser.IE7;
Prototype.Browser.isSlow = Prototype.Browser.IE6;
Prototype.Browser.FF3 = (/Firefox\/3.0/).test(navigator.userAgent);

Prototype.Browser.getName=function(){
    if(Prototype.Browser.Gecko) return "firefox";
    if(Prototype.Browser.IE6) return "ie6";
    if(Prototype.Browser.IE7) return "ie7";
    if(Prototype.Browser.IE8) return "ie8";
    if(Prototype.Browser.Webkit) return "webkit";
    if(Prototype.Browser.Opera) return "webkit";
    if(Prototype.Browser.MobileSafari) return "mobile-webkit";
};

/************ ARRAY *************/

// @see https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/Array/Map
if (!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun != "function") {
			throw new TypeError();
		}
	    var res = new Array(len);
	    var thisp = arguments[1];
	    for (var i=0; i<len; i++) {
	    	if (i in this) {
	    		res[i] = fun.call(thisp, this[i], i, this);
	    	}
	    }
		return res;
	};
}

/************** DATE **************/

Date.now = function() {
	return (new Date()).getTime();
}

/************** ELEMENT **************/

Element.addMethods({
	setWidth: function(element, w){
		var borderRightWidth = parseInt(element.getStyle("border-right-width") || 0) || 0;
		var borderLeftWidth = parseInt(element.getStyle("border-left-width") || 0) || 0;
		var paddingRight = parseInt(element.getStyle("padding-right") || 0) || 0;
		var paddingLeft = parseInt(element.getStyle("padding-left") || 0) || 0;

		element.setStyle({'width': (w - borderRightWidth - borderLeftWidth - paddingRight - paddingLeft) + 'px'});
		return element;
	},
	setHeight: function(element, h){
		var borderTopWidth = parseInt(element.getStyle("border-top-width") || 0) || 0;
		var borderBottomWidth = parseInt(element.getStyle("border-bottom-width") || 0) || 0;
		var paddingTop = parseInt(element.getStyle("padding-top") || 0) || 0;
		var paddingBottom = parseInt(element.getStyle("padding-bottom") || 0) || 0;

		element.setStyle({'height': (h - borderTopWidth - borderBottomWidth - paddingTop - paddingBottom) + 'px'});
		return element;
	}
});


/* =moo_ext.js */

var MooExt = Class.create({
	addEvent: function(type, fn){
		if (!this.$events) {
			this.$events = {};
		}
		type = MooExt.removeOn(type);
		var isFnRegistered = false;
		if (fn) {
			this.$events[type] = this.$events[type] || [];
			for(var i=0; i < this.$events[type].length; ++i) {
				if (this.$events[type][i] == fn) {
					isFnRegistered = true;
					break;
				}
			}
			!isFnRegistered && this.$events[type].push(fn);
		}
		return this;
	},

	addEvents: function (events) {
		for (var type in events) {
			this.addEvent(type, events[type]);
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		type = MooExt.removeOn(type);
		args = [].concat(args);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function (fn) {
		    if (delay) {
		    	var _this = this;
				setTimeout(function(){fn.apply(_this, args);}, delay);
		    }
		    else {
		    	fn.apply(this, args)
		    }
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = MooExt.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].without(fn);
		return this;
	},

	removeEvents: function(events){
		if (!this.$events) { return this;}
		var type;
		if (typeof events == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = MooExt.removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
		}
		return this;
	},

	// Options Extension

	setOptions: function(options){
		this.options = SD.Utils.Object.merge(this.options || {}, options || {}, true);
		if (!this.addEvent) return this;
		for (var option in this.options){
			if (typeof this.options[option] != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}
});

MooExt.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

/* =sd.js */

SD || (SD = {});
SD.log = function (x) {};
SD.info = function (x) {};
SD.error = function (x) {};
SD.warn = function (x) {};

/* =sd.utils.js */

SD.Utils = {}
SD.Utils.Object = {
	mergeArrays: function(a1, a2, isCloned){
		for(var i=0; i<a2.length; ++i){
			if(a2[i] !== null && a2[i] !== undefined && !isNaN(a2[i])){
				a1[i] = a2[i];
			}
		}
		return a1;
	},

	merge: function (obj1, obj2, isCloned, isExclusive) {
		isCloned = isCloned === false ? false : true;
		obj1 = isCloned ? this.clone(obj1) : obj1;
		var o1, o2;
		for (var i in obj2) {
			o1 = obj1[i];
			o2 = obj2[i];
			if (isExclusive && o1 !== undefined) {continue;}
			if (typeof o1 == 'object' && !(o1 instanceof Array) && !(o1 instanceof RegExp) && o1 !== null ) {
				if (typeof o2 == 'object' && !(o2 instanceof Array) && !(o2 instanceof RegExp) && o2 !== null) {
					obj1[i] = arguments.callee.call(this, o1, o2, isCloned, isExclusive);
				}
				else {
					obj1[i] = o2;
				}
			}
			else if (o1 instanceof Array && o2 instanceof Array) {
				for(var j=0, len=o2.length; j<len; ++j){
					o1[j] = o2[j];
				}
			}
			else if (typeof o2 == 'object' && !(o2 instanceof Array) && !(o2 instanceof RegExp) && o2 !== null ) {
				obj1[i] = this.clone(o2);
			}
			else {
				obj1[i] = o2;
			}
		}
		return obj1;
	},

	exclusiveMerge: function(obj1, obj2, isCloned){
		return this.merge(obj1, obj2, isCloned, true);
	},

	clone: function (obj) {
		// functions are not cloned
		var newObj = {};
		var o;
		for (var i in obj) {
			o = obj[i];
			if (o instanceof Array) {
				newObj[i] = o.concat();
			}
			else if (o instanceof RegExp) {
				newObj[i] = eval(o.toString());
			}
			else if (o === undefined || o === null) {
				newObj[i] = o;
			}
			else if (typeof o == 'object') {
				newObj[i] = arguments.callee.call(this, o);
			}
			else {
				newObj[i] = o;
			}
		}
		return newObj;
	}
}



/* =sd.window.js */

SD.Draggable = Class.create(MooExt, {
    initialize: function (handle, win) {
        // range - {x1:..., y1:..., x2:..., y2:...} or function producing the range object
        // the win should have a moveTo interface
        this.handle = $(handle);
        this.win = win;
        this.isDragging = false;
        this.hasDragged = false;

        this.boundOnDrag = this.onDrag.bindAsEventListener(this);
        this.boundOnStopDrag = this.onStopDrag.bindAsEventListener(this);

        this.handle.observe('mousedown', this.onStartDrag.bindAsEventListener(this));
        this.handle.observe('mouseup', this.boundOnStopDrag);
        this.handle.ondragstart = function (){return false;}
        Event.observe(document, 'mouseup', this.boundOnStopDrag);
    },

    onStartDrag: function (ev) {
        this.hasDragged = false;
        this.fireEvent("dragStart", ev);
        if (!this.isDragging ) {
            this.isDragging = true;
            Event.observe(document, 'mousemove', this.boundOnDrag);
            Event.observe(document, 'mouseup', this.boundOnStopDrag);
        }
    },

    onStopDrag: function (ev) {
        Event.stopObserving(document, 'mousemove', this.boundOnDrag);
        Event.stopObserving(document, 'mouseup', this.boundOnStopDrag);
        this.isDragging = false;
        this.fireEvent("dragStop", ev);
    },

    onDrag: function (ev) {
        this.hasDragged = true;
        this.fireEvent("drag", ev);
        Event.stop(ev);
    }
});

SD.Window = Class.create(MooExt, {
    options: {
        template: '\
            <div class="#{className} lib-window">\
                <div class="tl"></div>\
                <div class="tr"></div>\
                <div class="br lib-resize-handle-br"></div>\
                <div class="bl"></div>\
                <div class="sd-wnd-innerPane">\
                    <div class="sd-wnd-title lib-title lib-draggable">#{title}</div>\
                    <div class="sd-wnd-content lib-content">#{content}</div>\
                    <div class="sd-wnd-closeButton lib-close-handle" style="visibility:hidden">X</div>\
                </div>\
            </div>',

        draggable: true,
        resizable: false,
        closable: true,
        focusable: true,
        shim: Prototype.Browser.IE6,// IFRAME shim
        blocker: false,             // blocking background for modal dialogs

        shimClassName: "sd-window-shim",
        blockerClassName: "sd-window-blocker",

		domParent: null, 			// dom parent if the dom is going to be dynamically created

        position: "fixed",          // [fixed | absolute],
        groupId: "defaultGroup",    // groupId for attaching SD.WindowManager group window policies
        classNameDragged: null,     // className for dragged state (additive)
        classNameFocused: null,     // className for focused state
        className: "sd-window",     // className for blur state. For static windows it is added to the css class

        top: null,                  // window is centered by default, top will override the top position
        left: null,                 // window is centered by default, left will override the left position
        minWidth: 100,              // default minimum total width
        minHeight: 100,             // default minimum total height
        width: 200,                 // default total width
        contentWidth: null,         // default content width. It has higher priority over width
        height: null,               // default total height, height=null - window will resize dynamically to accomodate the content
        contentHeight: null,        // default content height It has higher priority over height

        populateMethod: "html",     // [html | htmlPlain | text],
        title: "",                  // title html or text
        content: "",                // content html or text
        footer: "",                 // footer html or text
        data: {},                   // data: {title:..., content:..., footer:...} for populating the window

        range: null,                // function producing range object {x1:..., y1:..., x2:..., y2:...} restricting window position and size
        //type: "dynamic",    		// [SD.Window.DYNAMIC | SD.Window.STATIC | "dynamic" | "static" ]
        closeMethod: "remove",      // [SD.Window.HIDE_CLOSE | SD.Window.REMOVE_CLOSE | SD.Window.OFFSCREEN_CLOSE | "hide" | "remove" | "offscreen"]
		parseLibrary: null,			// A collection of CSS selectors used to parse the window template for elemnts to which behaviors are attached
		hideMethod: "visibility_hide", // [SD.Window.VISIBILITY_HIDE | SD.Window.OFFSCREEN_HIDE | "visibility_hide" | "offscreen_hide"]

        onPopulate: null,			// handler for the event 'populate'
        onShow: null,               // handler for the event 'show'
        onHide: null,               // handler for the event 'hide'
        onBeforeHide: null,         // handler for the event 'beforeOpen'
        onBeforeOpen: null,         // handler for the event 'beforeOpen'
        onBeforeClose: null,        // handler for the event 'beforeClose'
        onAfterOpen: null,          // handler for the event 'afterOpen'
        onAfterClose: null,         // handler for the event 'afterClose'
        onMove: null,               // handler for the event 'move' fired when dragging the window
        onMoveStart: null,          // handler for the event 'moveStart' fired before dragging the window
        onMoveStop: null,           // handler for the event 'moveStop' fired after dragging the window
        onDragResize: null,         // handler for the event 'dragResize' fired when drag-resizing the window
        onDragResizeStart: null,    // handler for the event 'dragResizeStart' fired before drag-resizing the window
        onDragResizeStop: null      // handler for the event 'dragResizeStop' fired after drag-resizing the window
    },

	defaultParseLibrary: {
		'.lib-title': function (el, domRoot) {
			if (!this.domTitle) {this.domTitle = el}
			el.removeClassName("lib-title");
		},
		'.lib-content': function (el, domRoot) {
			if (!this.domContent) {this.domContent = el}
			el.removeClassName("lib-content");
		},
		'.lib-footer': function (el, domRoot) {
			if (!this.domFooter) {this.domFooter = el}
			el.removeClassName("lib-footer");
		},
		'.lib-resize-handle-br': function (el, domRoot) {
			this.isResizable = !(this.isResizable === false);
			this.isResizable && this._attachResizeBehavior(el);
			el.removeClassName("lib-resize-handle-br");
		},
		'.lib-draggable':  function (el, domRoot) {
			this.isDraggable = !(this.isDraggable === false);
			this.isDraggable && this._attachMoveBehavior(el);
			el.removeClassName("lib-draggable");
		},
		'.lib-close-handle': function (el, domRoot) {
			this.isClosable = !(this.isClosable === false);
			if (this.isClosable) {
				this._attachCloseBehavior(el);
				el.style.visibility = '';
			}
			el.removeClassName("lib-close-handle");
		},
		'.lib-hide-handle': function (el, domRoot) {
			this._attachHideBehavior(el);
			el.style.visibility = '';
			el.removeClassName("lib-hide-handle");
		}
	},

    initialize: function (dom, options) {
        if (!SD.WindowManager.isInitialized) {
        	SD.WindowManager.init();
        }
        if (arguments.length == 1) {
            options = dom;
            dom = '';
        }
        this.setOptions(options);
        this.parseLibrary = options.parseLibrary
        	? SD.Utils.Object.merge(this.defaultParseLibrary, this.options.parseLibrary, true)
        	: this.defaultParseLibrary;
        this.position = Prototype.Browser.IE6 ? "absolute" : this.options.position;
        this.populateMethod = this.options.populateMethod;
        this.groupId = this.options.groupId;

        this.dom = $(dom);
        this.domParent = $(this.options.domParent || document.body);
        this.type = this.dom ? SD.Window.STATIC : SD.Window.DYNAMIC
        this.isDomCreated = (this.type == SD.Window.STATIC) ? true : false;

        this.isDraggable = this.options.draggable;
        this.isResizable = this.options.resizable;
        this.isClosable = this.options.closable;

        this.isPopulated = false;
        this.isCentered = true;
        this.isOpened = false;
        this.isVisible = false;
		this.isFixedHeight = !!this.options.height || !!this.options.contentHeight || this.type == SD.Window.STATIC;
		this.hideMethod = this.options.hideMethod || SD.Window.VISIBILITY_HIDE;

        this.minWidth = this.options.minWidth;
        this.minHeight = this.options.minHeight;

		this.addEvent('populate', this.onPopulate);
        this.setup();
    },
    setup: function () {
    	this.setupTemplating();
    	this.setupData();
    	this.setupClassNames();
    	this.setupCloseMethod();
    	this.setupRange();
        this.setupDom(this.template);
        this.setupShim();
        this.setupBlocker();
        this._parseElements(this.dom);
		this.setupSizeDependencies();
		this.setupDimensions();
        this.populate(this.dom, this.data);
        return this;
    },
    setupTemplating: function () {
        if (this.type == SD.Window.DYNAMIC) {
            this.template = this.options.template;
            this.template = this.template.replace("#{className}", this.options.className || "sd-window");
        }
        else if (this.type == SD.Window.STATIC) {
            this.template = this.dom.innerHTML;
        }
    },
    setupData: function () {
        this.data = Object.extend({
            title: this.options.title,
            content: this.options.content,
            footer: this.options.footer
        }, this.options.data);
    },
    setupClassNames: function () {
    	this.options.classNameFocused = this.options.classNameFocused || this.options.className;
        if (this.type == SD.Window.DYNAMIC) {
            this.template = this.template.replace("#{className}", this.options.className || "sd-window");
        }
    },
    setupCloseMethod: function () {
        this.closeMethod = this.options.closeMethod;
        if (!this.closeMethod && this.type == SD.Window.STATIC) {
            this.closeMethod = SD.Window.HIDE_CLOSE;
        }
        else if (!this.closeMethod && this.type == SD.Window.DYNAMIC) {
            this.closeMethod = SD.Window.REMOVE_CLOSE;
        }
    },
    setupRange: function () {
    	this.range = this.options.range || this.range;
        this._range = this.range;
    },
    setupSizeDependencies: function () {
    	if (this.options.toHeight || this.options.toContentHeight) {
    		this.toHeight = this.options.toHeight;
    		this.toContentHeight = this.options.toContentHeight;
    		return;
    	}
    	this.heightAdjuster = 0;

    	var oldTitleHeight = this.domTitle && this.domTitle.style.height;
    	var oldContentHeight = this.domContent && this.domContent.style.height;
    	var oldFooterHeight = this.domFooter && this.domFooter.style.height;

    	this.domTitle && this.domTitle.setHeight(30);
    	this.domContent && this.domContent.setHeight(100);
    	this.domFooter && this.domFooter.setHeight(30);

    	this.heightAdjuster = this.dom.offsetHeight
    		- (this.domTitle && this.domTitle.offsetHeight || 0)
    		- (this.domContent && this.domContent.offsetHeight || 0)
    		- (this.domFooter && this.domFooter.offsetHeight || 0);

    	this.domTitle && (this.domTitle.style.height = oldTitleHeight);
    	this.domContent && (this.domContent.style.height = oldContentHeight);
    	this.domFooter && (this.domFooter.style.height = oldFooterHeight);
    },
	toHeight: function (win) {
        return this.heightAdjuster +
              (this.domTitle && this.domTitle.offsetHeight || 0)
            + (this.domContent && this.domContent.offsetHeight || 0)
            + (this.domFooter && this.domFooter.offsetHeight || 0);
	},
	toContentHeight: function (win) {
        return this.dom.offsetHeight -
              (this.domTitle && this.domTitle.offsetHeight || 0)
            - (this.domFooter && this.domFooter.offsetHeight || 0)
            - this.heightAdjuster;
	},
    setupDimensions: function () {
        this.dom.style.position = this.position || this.dom.style.position;
        if (this.options.contentWidth) {
        	this.options.width = this.options.contentWidth + this._calculateWidthDelta();
        }
        if (this.options.contentHeight) {
        	this.options.height = this.options.contentHeight + this._calculateHeightDelta();
        }

        this.top = parseInt(this.options.top || this.dom.getStyle('top'));
        this.left = parseInt(this.options.left || this.dom.getStyle('left'));

		this.resizeTo(this.options.width, this.options.height);
    },
    _calculateWidthDelta: function () {
    	//return this.dom.offsetWidth - parseInt(this.domContent.getStyle('width'));
    	return this.dom.offsetWidth - this.domContent.offsetWidth;
    },
    _calculateHeightDelta: function () {
    	//return this.dom.offsetHeight - parseInt(this.domContent.getStyle('height'));
    	return this.dom.offsetHeight - this.domContent.offsetHeight;
    },
    setupBlocker: function () {
    	if (this.options.blocker) {
    		SD.WindowManager.addBlockingWindow(this);
	    	var blocker = SD.WindowManager.getBlocker(this);
	    	if (!blocker) {
	            blocker = $(document.createElement("div"));
	            blocker.className = this.options.blockerClassName;
	            blocker.style.visibility = 'hidden';
	            document.body.appendChild(blocker);
	            SD.WindowManager.setBlocker(blocker, this);
	        }
        }
    },

    setupShim: function () {
        if (this.options.shim || Prototype.Browser.IE6) {
            this.shim = $(document.createElement("iframe"));
            this.shim.frameborder = "0";
            this.shim.className = this.options.shimClassName;
            Object.extend(this.shim.style, {
                position: this.position,
                top: 0,
                left: 0,
                width: this.dom.offsetWidth,
                height: this.dom.offsetHeight,
                borderWidth: 0,
                zIndex: this.dom.style.zIndex,
                visibility: 'hidden'
            });
            this.domParent.insertBefore(this.shim, this.dom);
        }
    },
    setupDom: function (domHtml) {
        if (!this.dom && this.type == SD.Window.DYNAMIC) {
            this.domParent.insert({bottom:domHtml.trim()});
            this.dom = this.domParent.lastChild;
            this.dom.style.visibility = "hidden";
        }
		this._assignDomId();
        this.isDomCreated = true;
        return this;
    },
    _assignDomId: function () {
        if (!this.dom.id) {
            this.dom.id = "window" + (new Date).getTime();
        }
        this.id = this.dom.id;
    },
	parser: function (domRoot) {
		domRoot = $(domRoot);
        for (var i in this.parseLibrary) {
            domRoot.select(i).each(function (el) {
                try {
                    this.parseLibrary[i].call(this, el, domRoot);
                }
                catch (e) {
                    console.log("error while parsing selector " + i);
                }
            }, this);
        }
	},
    _parseElements: function (rootDom) {
    	this.parser(rootDom);
        rootDom.select('*').each(function (el) {
            el.containerId = rootDom.id;
        });
    },
    _attachResizeBehavior: function (resizeHandle) {
        this.resizeManager = new SD.Draggable(resizeHandle, this);
        this.resizeManager.addEvent("drag", this.onResize.bind(this));
        this.resizeManager.addEvent("dragStart", this.onResizeStart.bind(this));
        this.resizeManager.addEvent("dragStop", this.onResizeStop.bind(this));
    },
    _attachMoveBehavior: function (dragHandle) {
        this.moveManager = new SD.Draggable(dragHandle, this);
        this.moveManager.addEvent("drag", this.onMove.bind(this));
        this.moveManager.addEvent("dragStart", this.onMoveStart.bind(this));
        this.moveManager.addEvent("dragStop", this.onMoveStop.bind(this));
    },
    _attachCloseBehavior: function (closeHandle) {
        closeHandle.observe('click', function (e) {
            this.close();
        }.bindAsEventListener(this))
    },
    _attachHideBehavior: function (hideHandle) {
        hideHandle.observe('click', function (e) {
            this.hide();
        }.bindAsEventListener(this))
    },

    onResizeStart: function (ev) {
        this.resizeManager.dragOffsetX = Event.pointerX(ev) - this.width;
        this.resizeManager.dragOffsetY = Event.pointerY(ev) - this.height;
        this._adjustContentHeight();
        this.isFixedHeight = true;
        this.fireEvent('dragResizeStart');
    },
    onResize: function (ev) {
        this.resizeTo(
            Event.pointerX(ev) - this.resizeManager.dragOffsetX,
            Event.pointerY(ev) - this.resizeManager.dragOffsetY
        );
        this.fireEvent('dragResize');
    },
    onResizeStop: function () {
        this.fireEvent('dragResizeStop');
    },
    onMoveStart: function (ev) {
        this.updateRange();
        this.moveManager.dragOffsetX = Event.pointerX(ev) - this.left;
        this.moveManager.dragOffsetY = Event.pointerY(ev) - this.top;
        if (this.options.classNameDragged) {
            this.dom.addClassName(this.options.classNameDragged);
        }
        this.fireEvent('moveStart');
    },
    onMove: function (ev) {
        this.moveTo(
            Event.pointerX(ev) - this.moveManager.dragOffsetX,
            Event.pointerY(ev) - this.moveManager.dragOffsetY
        );
        this.fireEvent('move');
    },
    onMoveStop: function () {
        if (this.options.classNameDragged) {
            this.dom.removeClassName(this.options.classNameDragged);
        }
        this.fireEvent('moveStop');
    },

    setZIndex: function (zIndex) {
        this.dom.style.zIndex = zIndex;
        if (this.shim) {
            this.shim.style.zIndex = zIndex;
        }
    },
    getZIndex: function () {
        return this.dom.style.zIndex;
    },

    // Templating

    _buildInlineTemplates: function () {
        this.inlineTemplates = [];
        var winNodes = this.dom.select('*');
        for(var i=0; i < winNodes.length; ++i) {
            for(var j=0; j < winNodes[i].childNodes.length; ++j) {
                if (winNodes[i].childNodes[j].nodeType == 3 && winNodes[i].childNodes[j].nodeValue.indexOf('#{') != -1) {
                    this.inlineTemplates.push({"node": winNodes[i].childNodes[j], "template": winNodes[i].childNodes[j].nodeValue});
                }
            }
        }
    },

    populate: function (dom, data) {
    	if (arguments.length == 1) {
    		data = dom;
    		dom = this.dom;
    	}
    	dom = $(dom) || this.dom;
        if (!this.inlineTemplates) {
            this._buildInlineTemplates();
        };

        if (this.populateMethod == 'html') {
            this.populateHtml(data);
        }
        else if (this.populateMethod == 'htmlPlain') {
            this.populateHtmlPlain(data);
        }
        else {
            this.populateText(data);
        }
        this.fireEvent('populate', dom);
        return this;
    },

    populateHtml: function (data) {
        var pNode, tmpNode, oldTextEl, elToInsert;
        if (data) {
            for (var i=0; i < this.inlineTemplates.length; ++i) {
                pNode = this.inlineTemplates[i].node.parentNode;
                tmpNode = document.createElement('span');
                tmpNode.innerHTML = this.inlineTemplates[i].template.interpolate(data);
                elToInsert = tmpNode.childNodes.length == 1 ? tmpNode.firstChild : tmpNode;
                oldTextEl = this.inlineTemplates[i].node;
                this.inlineTemplates[i].node = pNode.insertBefore(elToInsert, this.inlineTemplates[i].node);
                pNode.removeChild(oldTextEl);
            }
            this.isPopulated = true;
        }
    },

    populateHtmlPlain: function (data) {
        var pNode, tmpNode, dfNode, nextEl;
        if (data) {
            for (var i=0; i < this.inlineTemplates.length; ++i) {
                pNode = this.inlineTemplates[i].node.parentNode;
                tmpNode = document.createElement('span');
                tmpNode.innerHTML = this.inlineTemplates[i].template.interpolate(data);
                for (var j=0,len=tmpNode.childNodes.length; j<len; j++) {
                    pNode.insertBefore(tmpNode.firstChild, this.inlineTemplates[i].node);
                }
                pNode.removeChild(this.inlineTemplates[i].node);
            }
            this.isPopulated = true;
        }
    },

    populateText: function (data) {
        if (data) {
            for (var i=0; i < this.inlineTemplates.length; ++i) {
                this.inlineTemplates[i].node.nodeValue = this.inlineTemplates[i].template.interpolate(data);
            }
            this.isPopulated = true;
        }
    },

	onPopulate: function (dom) {
        this._parseElements(dom);
        if (dom == this.domTitle || dom == this.domFooter) {
        	(dom.innerHTML.trim() == '') ? dom.hide() : dom.show();
        }
        this._adjustDimensions();
	},

	update: function (dom, html) {
		dom = $(dom);
		if (!dom && dom != this.domTitle && dom != this.domFooter && dom != this.domContent) {return;}
		if (typeof html == 'string') {
			dom.innerHTML = html;
		} else {
			dom.innerHTML = "";
			for (var i=1; i<arguments.length; ++i) {
				dom.appendChild(arguments[i]);
			}
		}
		this.fireEvent('populate', dom);
	},

    updateTitle: function (html) {
    	this.update(this.domTitle, html);
    },

    updateContent: function (html) {
    	this.update(this.domContent, html);
    },

    updateFooter: function (html) {
		this.update(this.domFooter, html);
    },

    open: function (forceOpen) {
        try {
            this.fireEvent("beforeOpen");
        } catch (e) {
            if (!forceOpen && e === this.Events.STOP_DEFAULT_ACTION) {return;}
        }

        SD.WindowManager.add(this);
        this.show();
        this.isOpened = true;

        this.fireEvent("afterOpen");
        return this;
    },
    close: function (forceClose) {
    	try {
            this.fireEvent("beforeClose", forceClose);
        } catch (e) {
            if (!forceClose && e === this.Events.STOP_DEFAULT_ACTION) {return;}
        }

        if (this.closeMethod == SD.Window.OFFSCREEN_CLOSE) {
            this.placeDomOffScreen();
        } else if (this.closeMethod == SD.Window.HIDE_CLOSE) {
            this.hide();
        } else if (this.closeMethod == SD.Window.REMOVE_CLOSE) {
            this.removeDom();
        }

        SD.WindowManager.remove(this);
        try {
            this.fireEvent("afterClose");
        } catch (e) {}
        return this;
    },
    show: function () {
		this.placeDomOnScreen();
		this.showDom();
        this.isVisible = true;
        SD.WindowManager.focusWindow(this);
        this.fireEvent("show");
        return this;
    },
    hide: function (forceHide) {
        try {
            this.fireEvent("beforeHide", forceHide);
        } catch (e) {
            if (!forceHide && e === this.Events.STOP_DEFAULT_ACTION) {return;}
        }
    	if (this.hideMethod == SD.Window.OFFSCREEN_HIDE) {
            this.savePosition();
            this.placeDomOffScreen();
    	} else {
    		this.hideDom();
	    }
        this.isVisible = false;
        this.fireEvent("hide");
        return this;
    },
    savePosition: function () {
    	this.lastPosition = {
    		top: this.top,
    		left: this.left
    	}
    },
    retrieveAndDeletePosition: function () {
    	if (!this.lastPosition) {return null;}
    	var position = {
    		top: this.lastPosition.top,
    		left: this.lastPosition.left
    	};
    	this.lastPosition = null;
    	return position;
    },

    placeDomOnScreen: function () {
    	this.updateRange();
        if (this.dom.style.display == 'none') {
            this.dom.style.display = '';
        }
		var oldPosition = this.retrieveAndDeletePosition();
        if (this.hideMethod == SD.Window.OFFSCREEN_HIDE && oldPosition) {
        	this.moveTo(oldPosition.left, oldPosition.top);
        }
        else if (!this.isOpened) {
            this.isCentered && this.center(this.options.left, this.options.top);
        }
		else {
	        this.moveTo(this.left, this.top);
	    }
    },
    placeDomOffScreen: function () {
        this.dom.style.top = "-2000px";
        this.dom.style.left = "-2000px";
        if (this.shim) {
            this.shim.style.top = "-2000px";
            this.shim.style.left = "-2000px";
        }
    },
    hideDom: function () {
        this.dom.style.visibility = 'hidden';
        this.shim && (this.shim.style.visibility = 'hidden');
    },
    showDom: function () {
        this.dom.style.visibility = '';
        this.shim && (this.shim.style.visibility = '');
    },
	removeDom: function () {
        this.dom.remove();
        this.shim && this.shim.remove();
	},

    // Focusable

    focus: function () {
        SD.WindowManager.focusWindow(this);
    },
    blur: function () {
        SD.WindowManager.blurWindow(this);
    },
    focusAction: function () {
        this.dom.className = this.options.classNameFocused;
        this.isFocused = true;
        this.onFocus && this.onFocus();
    },
    blurAction: function () {
        this.dom.className = this.options.className;
        this.isFocused = false;
        this.onBlur && this.onBlur();
    },
	isFocusable: function () {
		return this.isVisible && this.options.focusable;
	},

	// position restriction logic
    range: function () {
    	if (this.domParent != document.body) {
    		return {x1:0, y1:0, x2: this.domParent.offsetWidth, y2: this.domParent.offsetHeight};
    	}
        var vDim = document.viewport.getDimensions();
        if (this.position == "fixed") {
            return {x1:0, y1:0, x2: vDim.width, y2: vDim.height};
        }
        else {
            var vScrollOffsets = document.viewport.getScrollOffsets();
            return {x1:vScrollOffsets.left, y1:vScrollOffsets.top, x2: vDim.width + vScrollOffsets.left, y2: vDim.height + vScrollOffsets.top};
        }
    },
    updateRange: function () {
        this._range = (typeof(this.range) == "function") ? this.range() : this.range;
    },

    // Movable

    moveTo: function (x, y) {
        if (x !== null && x !== undefined && !isNaN(x)) {
            if (this._range) {
                if (this._range.x1 > x) {
                    x = this._range.x1;
                }
                else if (this._range.x2 < x + this.width) {
                    x = this._range.x2 - this.width;
                }
            }
            this.dom.style.left = x + 'px';
            this.shim && (this.shim.style.left = x + 'px');
            this.left = x;
        }
        if (y !== null && y !== undefined && !isNaN(y)) {
            if (this._range) {
                if (this._range.y1 > y) {
                    y = this._range.y1;
                }
                else if (this._range.y2 < y + this.height) {
                    y = (this._range.y2 - this.height);
                }
            }
            this.dom.style.top = y + 'px';
            this.shim && (this.shim.style.top = y + 'px');
            this.top = y;
        }
        return this;
    },
    moveBy: function (dx, dy) {
        if (dx !== null && dx !== undefined) {
            var x = this.left + dx;
            this.moveTo(x, null);
        }
        if (dy !== null && dy !== undefined) {
            var y = this.top + dy;
            this.moveTo(null, y);
        }
        return this;
    },

    //Resizable

    resizeTo: function (w, h) {
        if (w !== null && w !== undefined && !isNaN(w) && this.type != SD.Window.STATIC) {
            if (this._range) {
                if (this._range.x2 < this.left + w) {
                    w = this._range.x2 - this.left;
                }
            }
            if (this.minWidth > w) {
                w = this.minWidth;
            }
            this.dom.setWidth(w);
        }
        if (h !== null && h !== undefined && !isNaN(h) && this.isFixedHeight && this.type != SD.Window.STATIC) {
            if (this._range) {
                if (this._range.y2 < this.top + h) {
                    h = this._range.y2 - this.top;
                }
            }
            if (this.minHeight > h) {
                h = this.minHeight;
            }
            this.dom.setHeight(h);
            this._adjustContentHeight();
        }
        this.width = this.dom.offsetWidth;
        this.height = this.dom.offsetHeight;
        this.shim && this.shim.setHeight(this.height);
        this.shim && this.shim.setWidth(this.width);
        return this;
    },
    resizeBy: function (dw, dh) {
        if (dw !== null && dw !== undefined) {
            var w = this.width + dw;
            this.resizeTo(w, null);
        }
        if (dh !== null && dh !== undefined) {
            var h = this.height + dh;
            this.resizeTo(null, h);
        }
        return this;
    },

    center: function (leftOffset, topOffset) {
        var vDim = document.viewport.getDimensions();
        var vScrollOffsets = document.viewport.getScrollOffsets();

        if (this.position == "fixed") {
            this.moveTo(
                (leftOffset === undefined || leftOffset === null)
                	? (vDim.width - this.width)/2
                	: leftOffset,
                (topOffset === undefined || topOffset === null)
                	? (vDim.height - this.height)/2
                	: topOffset
            );
        }
        else if (this.position == "absolute") {
            this.moveTo(
                (leftOffset === undefined || leftOffset === null)
                	? (vScrollOffsets.left + (vDim.width - this.width)/2)
                	: leftOffset,
                (topOffset === undefined || topOffset === null)
                	? vScrollOffsets.top + (vDim.height - this.height)/2
                	: topOffset
            );
        }
    },

    _adjustDimensions: function () {
        if (this.dom.offsetHeight > this._range.y2 - this._range.y1) {
        	this.isFixedHeight = true;
        	this.moveTo(this.left, Math.max(this._range.y1, 0));
            this.resizeTo(this.dom.offsetWidth, this._range.y2 - this._range.y1);
            return;
        }
		else {
            this.resizeTo(this.dom.offsetWidth, this.dom.offsetHeight);
        }
        //check if the window is in allowed coordinates
        this.moveTo(this.left, this.top);
    },

    _adjustContentHeight: function () {
    	this.domContent.setHeight(parseInt(this.toContentHeight(this)));
    },

    repaint: function (el) {
        el = el || this.dom;
        el.style.visibility = "hidden";
        setTimeout(function () {el.style.visibility = "";}.bind(this), 100);
    },

    Events: {
        STOP_DEFAULT_ACTION: {
        	name:"SD.Window.Events.STOP_DEFAULT_ACTION",
        	message:"Prevents the default action."
        }
    },

    // Adapter methods for window compatibility

    getContent: function () {
        return this.domContent;
    },
    showCenter: function (toCenter,y,x) {
        if (!this.isOpened) {
            this.open();
        }
        else if (!this.isVisible) {
            this.show();
        }
        this.center(x,y);
        this._adjustDimensions();
    },
    setCloseCallback: function (callback){
        this.addEvent('afterClose', callback);
    },
    getId: function () {
    	return this.id;
    }
});

SD.Window.DYNAMIC = "dynamic"; // created from template and dynamically inserted upon creation
SD.Window.STATIC = "static"; // created from existing rendered html elements on the page
SD.Window.HIDE_CLOSE = "hide";
SD.Window.REMOVE_CLOSE = "remove";
SD.Window.OFFSCREEN_CLOSE = "offscreen";

SD.Window.OFFSCREEN_HIDE = "offscreen_hide";
SD.Window.VISIBILITY_HIDE = "visibility_hide";

SD.Window.legacyTemplate = '<div class="dialog popup-box lib-window">' +
	'<table cellspacing="0" cellpadding="0" class="top table_window">' +
	  '<tbody>' +
	    '<tr>' +
	      '<td class="dialog_nw top_draggable lib-draggable"></td>' +
	      '<td class="dialog_n lib-draggable">' +
	        '<div class="dialog_title title_window top_draggable lib-title">#{title}</div>' +
	      '</td>' +
	      '<td class="dialog_ne top_draggable lib-draggable"></td>' +
	    '</tr>' +
	  '</tbody>' +
	'</table>' +
	'<table cellspacing="0" cellpadding="0" class="mid table_window">' +
	  '<tbody>' +
	    '<tr>' +
	      '<td class="dialog_w"></td>' +
	      '<td valign="top" class="dialog_content">' +
	        '<div class="p-content lib-content">#{content}</div>' +
	      '</td>' +
	      '<td class="dialog_e"></td>' +
	    '</tr>' +
	  '</tbody>' +
	'</table>' +
	'<table cellspacing="0" cellpadding="0" class="bot table_window lib-footer">' +
	  '<tbody>' +
	    '<tr>' +
	      '<td class="dialog_sw bottom_draggable"></td>' +
	      '<td class="dialog_s bottom_draggable">' +
	        '<div class="status_bar dialog_status">' +
	          '<span style="float: left; width: 1px; height: 1px;" />' +
	        '</div>' +
	      '</td>' +
	      '<td class="dialog_se bottom_draggable lib-resize-handle-br"></td>' +
	    '</tr>' +
	  '</tbody>' +
	'</table>' +
  '<div class="popup-close dialog-close-button lib-close-handle">&#215;</div>' +
'</div>';

SD.Window.infoMessageTemplate = '<div class="message lib-window"><div class="lib-content"></div></div>';

/* =sd.windowmanager.js */

SD.Window.Focusable = {
	setZIndex: function () {},
	getZIndex: function () {},
	isFocusable: function () {return false},
	blurAction: function () {},
	focusAction: function () {}
}

SD.WindowManager = {
	isInitialized: false,
	zRanges: {
		defaultGroup: {min:1000, max:2000, order:1},
		group1: {min:2001, max:3000, order:2},
		date: {min:3001, max:4000, order:3},
		group2: {min:4001, max:5000, order:4},
		dateOpener: {min:5001, max:6000, order:5},
		group3: {min:6001, max:7000, order:6},
		notification: {min:7001, max:8000, order:7},
		group4: {min:9001, max:10000, order:8}
	},
	init: function(){
		this.isInitialized = true;
		this._timer = 0;
		this.items = {};
		this.count = 0;
		this.focusedWindow = null;
		this.managers = {};

		this.blocker = null;
		this.blockingWindowCount = 0;
		this.blockingWindows = {};

		this.viewportDim = document.viewport.getDimensions();
		this.viewportOffsets = document.viewport.getScrollOffsets();

		Event.observe(window, 'resize', this.onResize.bind(this));
		Event.observe(window, 'scroll', this.onScroll.bind(this));
	},
	onResize: function () {
		if (this.blocker && this.blocker.style.position == "absolute") {
			clearTimeout(this._timer);
			this._timer = setTimeout( function () {
				this.updateBlockerSize();
			}.bind(this), 300);
		}
		var viewportDim = document.viewport.getDimensions();
		var items = this.getItems();
		for (var i in items) {
			items[i].updateRange && items[i].updateRange();
			if (items[i].isVisible) {
				try {
					items[i].moveTo(
						parseInt(items[i].left * (viewportDim.width - items[i].width) / (this.viewportDim.width - items[i].width)),
						parseInt(items[i].top * (viewportDim.height - items[i].height) / (this.viewportDim.height - items[i].height))
					);
				}
				catch (e) {}
			}
		}

		this.viewportDim = viewportDim;
		this.viewportOffsets = document.viewport.getScrollOffsets();
	},
	onScroll: function () {
		var items = this.getItems();
		var viewportOffsets = document.viewport.getScrollOffsets();
		var dx = viewportOffsets.left - this.viewportOffsets.left;
		var dy = viewportOffsets.top - this.viewportOffsets.top;

		for (var i in items) {
			items[i].updateRange && items[i].updateRange();
			if (items[i].isVisible) {
				if (items[i].position == 'absolute') {
					try {
						items[i].moveBy(dx, dy);
					}
					catch (e) {}
				}
			}
		}
		this.viewportOffsets = document.viewport.getScrollOffsets();
	},

	onWindowHide: function (win) {
		if (win != SD.WindowManager.focusedWindow) {
			return;
		}
		var winManager = this.managers[win.groupId];
		winManager.focusNextWindow();
		if (!this.focusedWindow) {
			var topmostWindow = this.getTopmostWindow(this.items);
			topmostWindow && this.focusWindow(topmostWindow);
		}
	},
	addGroupManager: function (id) {
		if (!this.zRanges[id]) {return;}
		this.managers[id] = new SD.WindowManager.GroupManager(id, this.zRanges[id], this.zRanges[id].order);
	},
	removeGroupManager: function (id) {
		this.managers[id] = null;
		delete this.managers[id];
	},
	add: function (win) {
		//console.log("add: " +  win.id);
		if (this.items[win.id]) {return;}
		win.groupId = win.groupId || 'defaultGroup';
		if (!this.zRanges[win.groupId]) { return;}
		if (!this.managers[win.groupId]) {
			this.addGroupManager(win.groupId);
		}
		this.items[win.id] = win;
		this.count++;

		if (win.addEvent) {
			win.addEvent('hide', SD.WindowManager.onWindowHide.bind(SD.WindowManager, win));
		}

		this.managers[win.groupId].add(win);
		return win;
	},
	remove: function (win) {
		//console.log("remove: " +  win.id);
		if (!this.items[win.id]) {return;}
		var winManager = this.managers[win.groupId];
		winManager.remove(win);
		this.items[win.id] = null;
		delete this.items[win.id];
		this.count--;
		if (winManager.count == 0 || !this.focusedWindow) {
			this.removeGroupManager(winManager.id);
			var topmostWindow = this.getTopmostWindow(this.items);
			topmostWindow && this.focusWindow(topmostWindow);
		}
		this.isBlockingWindow(win) && this.removeBlockingWindow(win);
	},
	focusWindow: function (win) {
		//console.log("SD.WindowManager:focusWindow - " + win.id);
		if (!this.managers[win.groupId]) {
			return;
		}
		this.managers[win.groupId].focusWindow(win);

		if (win.constructor != SD.WindowManager.GroupManager) {
			SD.WindowManager.focusedWindow = win;
		}
		this.adjustBlocker();
	},
	blurWindow: function (win) {
		if (!this.managers[win.groupId]) {
			return;
		}
		this.managers[win.groupId].blurWindow(win);
	},
	getItems: function () {
		return this.items;
	},
	getItemsAsArray: function () {
		var a = [];
		for (var i in this.items) {
			a.push(this.items[i]);
		}
		return a;
	},
	getCount: function () {
		return this.count;
	},

	getTopmostWindow: function (collection, withoutWindow) {
		var maxZ = 0,
			z = 0,
			topmostWindow;

		for (var i in collection) {
			try {
				z = collection[i].getZIndex();
				if (maxZ < z && collection[i].isFocusable() && collection[i] != withoutWindow) {
					maxZ = z;
					topmostWindow = collection[i];
				}
			} catch (e) {
				continue;
			}
		}
		return topmostWindow;
	},

	// blocker management

	isBlockingWindow: function (win) {
		return !!this.blockingWindows[win.id];
	},

	adjustBlocker: function (withoutWindow) {
		var topmostBlocker = this.getTopmostWindow(this.blockingWindows);
		if (topmostBlocker) {
			this.showBlocker(topmostBlocker);
		}
	},
	addBlockingWindow: function (win) {
		if (this.blockingWindows[win.id]) {return;}
		this.blockingWindows[win.id] = win;
		this.blockingWindowCount++;
	},
	removeBlockingWindow: function (win) {
		if (!this.blockingWindows[win.id]) {return;}
		this.blockingWindows[win.id] = null;
		delete this.blockingWindows[win.id];
		this.blockingWindowCount--;
		if (this.blockingWindowCount == 0) {
			this.hideBlocker();
		} else {
			this.adjustBlocker();
		}
	},
	getBlocker: function (win) {
		return this.blocker;
	},
	setBlocker: function (blocker, win) {
		this.blocker = $(blocker);
		this.blocker.style.position = Prototype.Browser.IE6 ? "absolute" : "fixed";
		this.updateBlockerSize();
	},
	positionBlocker: function (win) {
		win.dom.parentNode.insertBefore(this.blocker, win.dom);
        this.blocker.style.zIndex = win.dom.style.zIndex;
	},
	showBlocker: function (win) {
		this.blocker.style.visibility = '';
		if (this.lastShownBlocker != win) {
			this.positionBlocker(win);
		}
		this.lastShownBlocker = win;
	},
	hideBlocker: function (win) {
		this.blocker.style.visibility = 'hidden';
	},
	updateBlockerSize: function () {
		if (!Prototype.Browser.IE6) {
			this.blocker.style.width = "100%";
			this.blocker.style.height = "100%";
		}
		else {
			this.blocker.hide();
			var blockerHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight || 0);
			var blockerWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth || 0);
			this.blocker.show();
			this.blocker.style.width = blockerWidth + "px";
			this.blocker.style.height = blockerHeight + "px";
		}
	}
}

SD.WindowManager.GroupManager = Class.create({
	initialize: function (id, zRange, virtualZIndex) {
		this.id = id;
		this.items = {};
		this.count = 0;
		this.zRange = zRange;
		this.maxZIndex = this.zRange.min;
		this.virtualZIndex = virtualZIndex;
	},
	add: function (win) {
		if (!this.items[win.id]) {
			this.count++;
			this.items[win.id] = win;
		}
		win.dom && win.dom.observe('mousedown', function () {
			SD.WindowManager.focusWindow(win);
		});
		return win;
	},
	remove: function (win) {
		var toFocusNextWindow = (win == this.focusedItem);
		if (this.items[win.id]) {
			this.count--;
			delete this.items[win.id];
		}
		toFocusNextWindow && this.focusNextWindow();
	},
	focusNextWindow: function (withoutWindow) {
		var winToFocus = SD.WindowManager.getTopmostWindow(this.items, withoutWindow);

		if (winToFocus) {
			this.focusWindow(winToFocus);
		}
		else {
			this.focusedItem = null;
			SD.WindowManager.focusedWindow = null;
		}
	},
	focusWindow: function (win) {
		//console.log("SD.WindowManager.GroupManager:focusWindow - " + win.id);
		try {
			if (win == this.focusedItem) {return;}
			this.focusedItem && this.blurWindow(this.focusedItem);
			if (this.maxZIndex == this.zRange.max){
				this._resetZIndexes();
			}
			if (SD.WindowManager.isBlockingWindow(win)) {
				!win.getZIndex() && win.setZIndex(this.maxZIndex++);
			} else {
				win.setZIndex(this.maxZIndex++);
			}
			this.focusedItem = win;
			win.focusAction();
		}
		catch (e) {
			//console.log('error');
			return;
		}
	},
	blurWindow: function (win) {
		win.blurAction && win.blurAction();
	},
	hasFocusableItems: function() {
		for (var i in this.items) {
			try {
				if (this.items[i].isFocusable()) {
					return true;
				}
			} catch (e) {continue;}
		}
		return false;
	},
	getItems: function () {
		return this.items;
	},
	getCount: function () {
		return this.count;
	},
	_resetZIndexes: function () {
		var sortedWindows = this._sortByZIndex();
		var z = this.zRange.min;
		for (var i=0; i < sortedWindows.length; i++) {
			sortedWindows[i].setZIndex(z++);
		}
	},
	_sortByZIndex: function () {
		var sortedWindows = [];
		for (var i in this.items) {
			sortedWindows.push(this.items[i]);
		}
		return sortedWindows.sort(function (win1, win2) {
			var z1 = win1.getZIndex();
			var z2 = win2.getZIndex();
			if (z1 > z2) {return 1;}
			else if (z1 < z2) {return -1;}
			return 0;
		});
	}
});


/* =sd_ui_controller.js */

SD.UIController = {
	standardPopup: function(params) {
		var finalBaseParams;

		if (params.width) {
			params.contentWidth = params.width;
		}
        params.blocker = (params.draggable !== undefined) ? !params.draggable : true;

	    var baseParams = {
	    	width: 350,
		    closable: true,
		    template: SD.Window.legacyTemplate,
		    draggable: false,
			className: "dialog popup-box lib-window"
	    };

	    return new SD.Window(Object.extend(baseParams, params));
    }
};

/* =sd_event.js */

SD.Event = {
	observe: function (source, eventName, callback) {
		var eventHandler = function (event) {
			if (source === event.memo.source || !source) {
				callback({
					name: eventName,
					memo: event.memo.memo,
					source: event.memo.source
				});
			}
		}
		if (!callback.__eventStore) {
			callback.__eventStore = [];
		}
		callback.__eventStore.push({
			source: source,
			eventName: eventName,
			eventHandler: eventHandler
		});

		return document.observe(eventName, eventHandler);
	},

	stopObserving: function (source, eventName, callback) {
		var eventStore = callback.__eventStore;
		if (!eventStore || eventStore.length == 0) {return;}
		for (var i=0; i<eventStore.length; ++i) {
			if (eventStore[i].source === source && eventStore[i].eventName === eventName) {
				document.stopObserving(eventName, eventStore[i].eventHandler);
				callback.__eventStore = eventStore.without(eventStore[i]);
				return source;
			}
		}
	},

	fire: function (source, eventName, memo) {
		if (!eventName) {
		   SD.log('null event is not allowed in SD.Event');
		   return;
		}
		var event = null;
		memo = memo || '';
		SD.log('event:' + eventName);

		try {
			event = document.fire(eventName, {source: source, memo: memo});
		} catch (error) {
			SD.log('Error firing event:' + eventName + ' ' + error.message);
		};

		return event;
	},

	fireDeferred: function(source, eventName, memo) {
		(function () {SD.Event.fire(source, eventName, memo);}).defer();
	}
};


/* =domination.js */

var _dominate = function(basis) {
    var _styleAttribute = function(val) {
        if (typeof(val) == "") {
            return val;
        } else {
            var rv = [];
            for (var k in val) {
                rv.push(String(k) + ":" + String(val[k]));
            }
            return rv.join(";");
        }
    };

    var _safeAttributeSet = function(_e, attr, val) {
        attr = attr.toLowerCase();
        if (attr == 'class') {
            val = val.split(" ");
            for (var v=0; v<val.length; v++) {
                Element.addClassName(_e, val[v]);
            }
        } else if (attr == 'style') {
            Element.setStyle(_e, _styleAttribute(val));
        } else if (attr.startsWith('observe')) {
            Event.observe(_e, attr.substring(7).toLowerCase(), val);
        } else {
            _e.setAttribute(attr, val);
        }
    };

    var generateDOMElement= function(el){
    	if (typeof(el) == 'function')
            return(el());
        else if ( (typeof(el) == 'string') || (typeof(el) == 'number'))
            return(document.createTextNode(el));
        else
            return(el);
    }
    var createDOM = function(n, attrs) {
        var _e ;
		if (Prototype.Browser.IE && (n == "input") && attrs.name) {
			_e = document.createElement('<input name="' + attrs.name + '"/>');
		} else {
			_e = document.createElement(n);
		}
        _e = Element.extend(_e);
        if (n == "a") {
            _e.href = "#";
            _e.onclick = function() { return false; };
        }
        for (var attr in attrs) {
            _safeAttributeSet(_e, attr, attrs[attr]);
        }
        if ( (arguments != null) && (arguments.length > 2) ) {
            var node_args = arguments[2];
            for (var i = 1; i <  node_args.length; ++i) {
                var obj = node_args[i];
            	if(typeof(obj)=='object' && obj.each){
            		obj.each(function(el){
                        _e.appendChild(generateDOMElement(el));
                    });
            	} else {
            		_e.appendChild(generateDOMElement(obj));
            	}
            }
        }
        return _e;
    }

    var _nodes = [ 'table', 'tbody','thead', 'tr', 'th', 'td', 'a', 'strong', 'div', 'img',
                   'br', 'b', 'i', 'u', 'span', 'li', 'ul', 'ol', 'iframe', 'form', 'h1',
                   'input', 'button', 'h2', 'h3', 'h4', 'p', 'br', 'select', 'option', 'optgroup',
                   'label', 'textarea', 'em' ];


    for (var i = 0; i < _nodes.length; i++) {
        var node = _nodes[i].toUpperCase();
        var nodeName = _nodes[i];
        var makeFunction = function(nodeName) {
            return function(attrs) {
                return createDOM(nodeName, attrs, arguments);
            };
        };
        basis[node] = makeFunction(nodeName);
    }
};

_dominate(self);


/* =sd.signup.js */

if (typeof SD == 'undefined') {
    var SD = {};
};

SD.Signup = new function() {

    /***** PRIVATE *****/

    var nPlan = null;
    var oMenu = null;
    var aSavings = ['Save 50%', 'Save 20%', ''];
    function createMenu() {
        oMenu = UL({'class': 'signup-plans-menu'},
            SD.Config.subscriptionPlans.collect(function(o, n) {
            	var oElement = LI({}, o.description);
            	SD.Signup.registerInputMenuItem(oElement, n);
            	return oElement;
            })
        );
        oMenu.hide();
        document.observe('click', function() {
            oMenu.hide();
        });
        document.body.appendChild(oMenu);
    }
    function attachMenu(oElement) {
        oElement = $(oElement);
        var aOffset = oElement.cumulativeOffset();
        oMenu.setStyle({
            left: aOffset[0] + 'px',
            top: aOffset[1] + oElement.getHeight() + 'px'
        });
    }

	/***** PUBLIC *****/

    this.init = function() {
    	createMenu();
    };
    this.setPlan = function(nPlan) {
    	SD.Event.fire(null, SD.Signup.Events.PLAN_SELECT, {planIndex:nPlan});
    };
	this.registerInputChangePlan = function(oElement) {
    	oElement = $(oElement);
    	attachMenu(oElement);
    	oElement.observe('click', function(e) {
        	oMenu.toggle();
        	e.stop();
    	});
	};
	this.registerInputMenuItem = function(oElement, nPlan) {
    	oElement = $(oElement);
    	oElement.observe('click', function() {
        	SD.Event.fire(null, SD.Signup.Events.PLAN_SELECT, {planIndex:nPlan});
    	});
    	oElement.observe('mouseover', function() {
        	oElement.addClassName('over');
        });
    	oElement.observe('mouseout', function() {
    		oElement.removeClassName('over');
        });
	};
	this.registerInputSubmit = function(oElement) {
        oElement = $(oElement);
        oElement.observe('click', function() {
        	SD.Event.fire(null,SD.PremiumMembership.Events.PROCESS_PAYMENT);
        });
    };
    this.registerInputTerms = function(oElement) {
        oElement = $(oElement);
        oElement.observe('click', function() {
        	var win = SD.UIController.standardPopup({
                title: "Policy For All Billing Plans",
                draggable: true,
                width: 400,
                height: 375
            });
            win.getContent().insert($('rebill-info').innerHTML);
            win.showCenter();
        });
    };
    this.registerOutputSubscriptionTerm = function(oElement) {
        oElement = $(oElement);
        SD.Event.observe(null, SD.Signup.Events.PLAN_SELECT, function(e) {
            var nInterval = SD.Config.subscriptionPlans[e.memo.planIndex].interval;
            var sUnits = SD.Config.subscriptionPlans[e.memo.planIndex].interval_label;
            oElement.update(nInterval + ' ' + sUnits);
        });
    };
    this.registerOutputSubscriptionMonthlyPrice = function(oElement) {
        oElement = $(oElement);
        SD.Event.observe(null, SD.Signup.Events.PLAN_SELECT, function(e) {
            var nMonthlyPrice = SD.Config.subscriptionPlans[e.memo.planIndex].interval_price;
            oElement.update(nMonthlyPrice);
        });
    };
    this.registerOutputSubscriptionSavings = function(oElement) {
        oElement = $(oElement);
        SD.Event.observe(null, SD.Signup.Events.PLAN_SELECT, function(e) {
            oElement.update(aSavings[e.memo.planIndex]);
        });
    };
    this.registerOutputSubscriptionPrice = function(oElement) {
        oElement = $(oElement);
        SD.Event.observe(null, SD.Signup.Events.PLAN_SELECT, function(e) {
            oElement.update(SD.Config.subscriptionPlans[e.memo.planIndex].price);
        });
    };
    this.registerOutputFormElementPlanId = function(oElement) {
        oElement = $(oElement);
        SD.Event.observe(null, SD.Signup.Events.PLAN_SELECT, function(e) {
            oElement.value = SD.Config.subscriptionPlans[e.memo.planIndex].id;
        });
    };
};

SD.Signup.Events = {
	PLAN_SELECT: 'sdsignup:planselect'
};

/*=validation.js */

var Validator = Class.create();

Validator.prototype = {
	initialize : function(className, error, test, options) {
		if(typeof test == 'function'){
			this.options = $H(options);
			this._test = test;
		} else {
			this.options = $H(test);
			this._test = function(){return true};
		}
		this.error = error || 'Validation failed.';
		this.className = className;
	},
	test : function(v, elm) {
		return (this._test(v,elm) && this.options.all(function(p){
			return Validator.methods[p.key] ? Validator.methods[p.key](v,elm,p.value) : true;
		}));
	}
}
Validator.methods = {
	pattern : function(v,elm,opt) {return Validation.get('IsEmpty').test(v) || opt.test(v)},
	minLength : function(v,elm,opt) {return v.length >= opt},
	maxLength : function(v,elm,opt) {return v.length <= opt},
	min : function(v,elm,opt) {return v >= parseFloat(opt)},
	max : function(v,elm,opt) {return v <= parseFloat(opt)},
	notOneOf : function(v,elm,opt) {return $A(opt).all(function(value) {
		return v != value;
	})},
	oneOf : function(v,elm,opt) {return $A(opt).any(function(value) {
		return v == value;
	})},
	is : function(v,elm,opt) {return v == opt},
	isNot : function(v,elm,opt) {return v != opt},
	equalToField : function(v,elm,opt) {return v == $F(opt)},
	notEqualToField : function(v,elm,opt) {return v != $F(opt)},
	include : function(v,elm,opt) {return $A(opt).all(function(value) {
		return Validation.get(value).test(v,elm);
	})}
}

var Validation = Class.create();

Validation.prototype = {
	initialize : function(form, options){
		this.options = Object.extend({
			onSubmit : true,
			stopOnFirst : false,
			immediate : false,
			focusOnError : true,
			useTitles : false,
			onFormValidate : function(result, form) {},
			onElementValidate : function(result, elm) {}
		}, options || {});
		this.form = $(form);
		if(this.options.onSubmit) Event.observe(this.form,'submit',this.onSubmit.bind(this),false);
		if(this.options.immediate) {
			var useTitles = this.options.useTitles;
			var callback = this.options.onElementValidate;
			Form.getElements(this.form).each(function(input) { // Thanks Mike!
				Event.observe(input, 'blur', function(ev) { Validation.validate(Event.element(ev),{useTitle : useTitles, onElementValidate : callback}); });
			});
		}
	},
	onSubmit :  function(ev){
		if(!this.validate()) Event.stop(ev);
	},
	validate : function() {
		var result = false;
		var useTitles = this.options.useTitles;
		var callback = this.options.onElementValidate;
		if(this.options.stopOnFirst) {
			result = Form.getElements(this.form).all(function(elm) { return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback}); });
		} else {
			result = Form.getElements(this.form).collect(function(elm) { return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback}); }).all();
		}
		if(!result && this.options.focusOnError) {
			Form.getElements(this.form).findAll(function(elm){return $(elm).hasClassName('validation-failed')}).first().focus()
		}
		this.options.onFormValidate(result, this.form);
		return result;
	},
	reset : function() {
		Form.getElements(this.form).each(Validation.reset);
	}
}

Object.extend(Validation, {
	validate : function(elm, options){
		options = Object.extend({
			useTitle : false,
			onElementValidate : function(result, elm) {}
		}, options || {});
		elm = $(elm);
		var cn = elm.classNames();
		return result = cn.all(function(value) {
			var test = Validation.test(value,elm,options.useTitle);
			options.onElementValidate(test, elm);
			return test;
		});
	},
	test : function(name, elm, useTitle) {
		var v = Validation.get(name);
		var prop = '__advice'+name.camelize();
		try {
		if(Validation.isVisible(elm) && !v.test($F(elm), elm)) {
			if(!elm[prop]) {
				var advice = Validation.getAdvice(name, elm);
				if(advice == null) {
					var errorMsg = useTitle ? ((elm && elm.title) ? elm.title : v.error) : v.error;
					advice = '<span class="validation-advice" id="advice-' + name + '-' + Validation.getElmID(elm) +'" style="display:none;">' + errorMsg + '</span>'
					switch (elm.type.toLowerCase()) {
						case 'checkbox':
						case 'radio':
							var p = elm.parentNode;
							if(p) {
								new Insertion.Bottom(p, advice);
							} else {
								new Insertion.After(elm, advice);
							}
							break;
						default:
							new Insertion.After(elm, advice);
				    }
					advice = Validation.getAdvice(name, elm);
				}
				if(typeof Effect == 'undefined') {
					advice.style.display = 'block';
				} else {
					new Effect.Appear(advice, {duration : 1 });
				}
			}
			elm[prop] = true;
			elm.removeClassName('validation-passed');
			elm.addClassName('validation-failed');
			return false;
		} else {
			var advice = Validation.getAdvice(name, elm);
			if(advice != null) { advice.hide(); }
			elm[prop] = '';
			elm.removeClassName('validation-failed');
			elm.addClassName('validation-passed');
			return true;
		}
		} catch(e) {
			throw(e)
		}
	},
	isVisible : function(elm) {
		while(elm.tagName != 'BODY') {
			if(!$(elm).visible()) return false;
			elm = elm.parentNode;
		}
		return true;
	},
	getAdvice : function(name, elm) {
		return $('advice-' + name + '-' + Validation.getElmID(elm)) || $('advice-' + Validation.getElmID(elm));
	},
	getElmID : function(elm) {
		return elm.id ? elm.id : elm.name;
	},
	reset : function(elm) {
		elm = $(elm);
		var cn = elm.classNames();
		cn.each(function(value) {
			var prop = '__advice'+value.camelize();
			if(elm[prop]) {
				var advice = Validation.getAdvice(value, elm);
				advice.hide();
				elm[prop] = '';
			}
			elm.removeClassName('validation-failed');
			elm.removeClassName('validation-passed');
		});
	},
	add : function(className, error, test, options) {
		var nv = {};
		nv[className] = new Validator(className, error, test, options);
		Object.extend(Validation.methods, nv);
	},
	addAllThese : function(validators) {
		var nv = {};
		$A(validators).each(function(value) {
				nv[value[0]] = new Validator(value[0], value[1], value[2], (value.length > 3 ? value[3] : {}));
			});
		Object.extend(Validation.methods, nv);
	},
	get : function(name) {
		return  Validation.methods[name] ? Validation.methods[name] : Validation.methods['_LikeNoIDIEverSaw_'];
	},
	methods : {
		'_LikeNoIDIEverSaw_' : new Validator('_LikeNoIDIEverSaw_','',{})
	}
});

Validation.add('IsEmpty', '', function(v) {
				return  ((v == null) || (v.length == 0)); // || /^\s+$/.test(v));
			});

Validation.addAllThese([
	['required', 'Required.', function(v) {
				return !Validation.get('IsEmpty').test(v);
			}],
	['validate-number', 'Please enter a valid number in this field.', function(v) {
				return Validation.get('IsEmpty').test(v) || (!isNaN(v) && !/^\s+$/.test(v));
			}],
	['validate-digits', 'Numbers only.', function(v) {
				return Validation.get('IsEmpty').test(v) ||  !/[^\d]/.test(v);
			}],
	['validate-alpha', 'Letters only.', function (v) {
				return Validation.get('IsEmpty').test(v) ||  /^[a-zA-Z]+$/.test(v)
			}],
	['validate-alphanum', 'Letters & numbers only.', function(v) {
				return Validation.get('IsEmpty').test(v) ||  !/\W/.test(v)
			}],
	['validate-date', 'Please enter a valid date.', function(v) {
				var test = new Date(v);
				return Validation.get('IsEmpty').test(v) || !isNaN(test);
			}],
	['validate-email', 'Incomplete.', function (v) {
				return Validation.get('IsEmpty').test(v) || /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(v)
			}],
	['validate-url', 'Please enter a valid URL.', function (v) {
				return Validation.get('IsEmpty').test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(v)
			}],
	['validate-date-au', 'Please use this date format: dd/mm/yyyy. For example 17/03/2006 for the 17th of March, 2006.', function(v) {
				if(Validation.get('IsEmpty').test(v)) return true;
				var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
				if(!regex.test(v)) return false;
				var d = new Date(v.replace(regex, '$2/$1/$3'));
				return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) &&
							(parseInt(RegExp.$1, 10) == d.getDate()) &&
							(parseInt(RegExp.$3, 10) == d.getFullYear() );
			}],
	['validate-currency-dollar', 'Please enter a valid $ amount. For example $100.00 .', function(v) {
				// [$]1[##][,###]+[.##]
				// [$]1###+[.##]
				// [$]0.##
				// [$].##
				return Validation.get('IsEmpty').test(v) ||  /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v)
			}],
	['validate-selection', '*', function(v,elm){
				return elm.options ? elm.selectedIndex > 0 : !Validation.get('IsEmpty').test(v);
			}],
	['validate-one-required', 'Please select one of the above options.', function (v,elm) {
				var p = elm.parentNode;
				var options = p.getElementsByTagName('INPUT');
				return $A(options).any(function(elm) {
					return $F(elm);
				});
			}],

	['validate-us-ca-postal', 'Invalid.',
		function(v,elm) {
	    	v = v.toUpperCase();
	    	var regex = /^((\d{5}([- ])\d{4})|(\d{5})|([A-Za-z]\d[A-Za-z]([- |])?\d[A-Za-z]\d))$/;
			if(Validation.get('IsEmpty').test(v) ||  regex.test(v)){
        		$(elm).value = v;
            	return true;
            } else {
            	return false;
            }
       }]
]);

/*=sd_carddefinitions.js */

var CardDefinitions = (function() {
	var illegalCharsRE = /[^0-9]/g;

	var CardType = function(lengths, prefixes, csclength) {
		this.lengths = lengths;
		this.prefixes = prefixes;
		this.csclength = csclength;
		this.checkNumber = function(ccn) {
			return this.checkPrefix(ccn) && this.checkLength(ccn) && this.checkCCN(ccn);
		};

		this.cleanNumber = function(ccn) {
			return ccn.replace(illegalCharsRE, '');
		};
		this.checkCSCNumber = function(csc) {
		  return this.csclength == csc.length && !(/[^\d]/).match(csc);
		};
		this.checkPrefix = function(ccn) {
		  for (var i=0; i < this.prefixes.length; i++) {
		      var prefix = this.prefixes[i] ;
		      if (ccn.startsWith(prefix)) {
		          return true;
		      }
		  }
		  return false;
		};
		this.checkLength = function(ccn) {
		  for (var i=0; i < this.lengths.length; i++) {
		      if (this.lengths[i] == ccn.length) {
		          return true;
		      }
		  }
		  return false;
		};

		this.checkCCN = function(ccn) {
		  var prod = 1;
		  var acc = 0;
		  for (var i=ccn.length-1; i >= 0 ; i--) {
		      var n = Number(ccn.charAt(i)) * prod;
		      acc +=  (n > 9) ? (n - 9) : n;
		      prod = 3 - prod;
		  }
		  return acc % 10 === 0;
		};

	};

	var jcbPrefixRange = $A($R(3528,3589)).map(function(n) { return n.toString(); });

	return {
		MASTERCARD 	: new CardType([ 16 ], [ '51', '52', '53', '54', '55' ], 3),
		VISA 		: new CardType([ 13, 16 ], [ '4' ], 3),
		AMEX 		: new CardType([ 15 ], [ '34', '37' ], 4),
		DISCOVER 	: new CardType([ 16 ], [ '6011' ], 3),
		JCB 		: new CardType([ 16 ], jcbPrefixRange, 3)
	};
})();

/* =premium_membership */

SD.PremiumMembership = {
		Events : {"PROCESS_PAYMENT" : "process:payment"},
        discountFlag : false,
      	init : function() {
      		var valid = new Validation('payment-form',{immediate : true});
			Validation.addAllThese([
			    ['validate-card-security-code', 'Incorrect length.', function(v,elm) {
						var cardtypeElem = $("p-card-type");
						return Validation.get('IsEmpty').test(v) || CardDefinitions[$F(cardtypeElem).toUpperCase()].checkCSCNumber(v);
			       }],
				['validate-credit-card', 'Invalid.',
					function(v,elm) {
						var cardtypeElem = $("p-card-type");
						return Validation.get('IsEmpty').test(v) || CardDefinitions[$F(cardtypeElem).toUpperCase()].checkNumber(v);
			       }],
			    ['validate-postal-code', 'Invalid.',
					function(v,elm) {
						var countryTypeElem = $("p-country");
						var countryVal = $F(countryTypeElem);
						var regexType = /^(\S+)$/;
						if(countryVal == "US"){
							regexType = /^((\d{5}([- ])\d{4})|(\d{5}))$/;
						} else if(countryVal == "CA"){
							regexType = /^([A-Za-z]\d[A-Za-z]([- |])?\d[A-Za-z]\d)$/;
						}

						return Validation.get('IsEmpty').test(v) || regexType.test(v);
			    	}]
			]);

			$('expressCheckout').observe('click', function(evt) {
				if (!SD.PremiumMembership.isPlanSelected()) {
				    return;
				}
				evt.stop();

				var urlParams = window.location.search.gsub("signup","payment_success");
                urlParams = urlParams.parseQuery();
                urlParams['dc'] = (SD.PremiumMembership.discountFlag) ? '1' : ((urlParams['dc']) ? urlParams['dc'] : '0' );
                urlParams = $H(urlParams).toQueryString();

				var params = {
					"p-plan" : $('payment-form').serialize(true)["p-plan"],
                    "brand" : $('payment-form').serialize(true)["brand"],
					"getparams" : urlParams
				};

                Form.disable('payment-form');

                $('expressCheckout').hide();
				$('processExpressCheckout').show();
                new Ajax.Request(SD.NavUtils.linkSecure('ajax','startexpresscheckout'),
                 {
                    method: 'get',
                    evalJSON: true,
                    parameters: params,
                    onSuccess: function(result) {
                        window.onbeforeunload = null;
                        if (result.responseJSON.success) {
							$('processExpressCheckout').hide();
                            window.location.href = result.responseJSON.url;
                        }
                        else {
                            $("payment-error").update(result.responseJSON.error_message).show();
                            Form.enable('payment-form');
							$('expressCheckout').show();
							$('processExpressCheckout').hide();
                        }
                    }
                 });
            });

			SD.Event.observe(null,SD.PremiumMembership.Events.PROCESS_PAYMENT,function(evt){
				if(SD.PremiumMembership.isPlanSelected() && valid.validate()) {
					$("submitDiv").hide();
	            	var params = $('payment-form').serialize(true);
                    var trial_id = (window.location.search.parseQuery().td || SD.Constants.trialPeriods.free_seven_day);
                    var discount_id = (SD.PremiumMembership.discountFlag) ? '1' : window.location.search.parseQuery().dc;
                    var tracking_code = (window.location.search.parseQuery().tc);
                    params['p-trialid'] = trial_id;
                    params['p-discountid'] = discount_id;
                    params['p-tracking-code'] = tracking_code;
	            	Form.disable('payment-form');
					$("proccessMessage").show();
       	 	        $("payment-error").hide();
					new Ajax.Request(SD.NavUtils.linkSecure('ajax','subscribepremiummembership'),
            	     {
        	             method: 'get',
    	                 evalJSON : true,
	                     parameters : params,
                    	 onSuccess: function(result) {
                            window.onbeforeunload = null;
            	            $("proccessMessage").hide();
                    	 	if(result.responseJSON.success){
                   	 	        $("payment-error").update("").hide();
                   	 	        var urlParams = window.location.search.parseQuery();
                   	 	        urlParams.action = "payment_success";
                                urlParams.tid = undefined;
                                urlParams.tobj = undefined;
								SD.Nav.redirectTo("?" + Object.toQueryString(urlParams));
                    	 	} else {
                    	 		$("payment-error").update(result.responseJSON.error_message).show();
                    	 		Form.enable('payment-form');
                    	 		SD.PremiumMembership.countryChange();
   	 							$("submitDiv").show();
                    	 	}
    	                 },
                       	 onFailure: function(result) {
   	 		            	window.onbeforeunload = null;
                            $("proccessMessage").hide();
                    	 	$("payment-error").update("Process Failure. Try again, if not contact Speeddate.com").show();
                    	 	Form.enable('payment-form');
                    	 	SD.PremiumMembership.countryChange();
 							$("submitDiv").show();
                    	 }
    	             }
            		);
            	}
			});

		$("state-select").update(SD.PremiumMembership.buildStateList());
	       	$("country-select").update(SD.PremiumMembership.buildCountryList());
		$("expiration-date-select").insert(SD.PremiumMembership.buildExpirationYears());

	        SD.PremiumMembership.sectionWidth = $('payment-form').getWidth() + 20;

	        //this.prefillPaymentForm(SD.Model.getMyself());

		$('p-country').observe('change', SD.PremiumMembership.countryChange.bind(this));
		$('p-card-type').observe('change', SD.PremiumMembership.cardTypeChange.bind(this));

			$('trigger-cvc3').observe('click',function(evt){
				evt.stop();
				var win = SD.UIController.standardPopup({title: "Credit Card Security Code",draggable : true, width: 400,height: 375, top: 200, left: 450});
				win.getContent().insert($('cvc3-info').innerHTML);
				win.show();

			});
        },

        prefillPaymentForm : function(user){
        	if(typeof user != "undefined"){
				$("p-name").value = user.name;
				$("p-city").value = user.city_name;

				if(user.last_name != ""){
					$("p-name").value = user.name + " " + user.last_name;
				}
				if(user.statecode != ""){
					$("p-state").value = user.statecode;
				}
				if(user.country != ""){
					$("p-country").value = user.country;
					this.countryChange();
				}

	        }
        },

        buildStateList : function() {
            var stateSelector = SELECT({id:"p-state",name:"p-state"});
      		SD.geography.StateList.each(function(state){
	        	stateSelector.insert(OPTION({ value : state}, state));
    	    });
    	    return stateSelector;
        },

        buildCountryList : function(){
           	var countrySelector = SELECT({id:"p-country",name:"p-country"});
	        SD.geography.CountryList.each(function(country){
	        	countrySelector.insert(OPTION({ value : country.code}, country.name));
    	    });
    	    return countrySelector;
        },

        buildExpirationYears : function(){
	        var d = new Date();
			var currentYear = d.getFullYear();

    	    var expireYearSelector = SELECT({id:"p-expire-year",name:"p-expire-year"});
        	$R(0,12).each(function(index) {
				  expireYearSelector.insert(OPTION({ value : currentYear + index}, currentYear + index));
			});
        	return expireYearSelector;
        },

        countryChange : function(evt){
        	if($F($("p-country")) == "US"){
        		$("p-state").disabled = false;
        		$("p-zipcode-label").update("&nbsp;&nbsp;ZIP Code&nbsp;&nbsp;");
        	} else{
        		$("p-state").disabled = true;
        		$("p-zipcode-label").update("&nbsp;&nbsp;Postal Code&nbsp;&nbsp;");
        	}
        },

        isPlanSelected : function() {
            var oForm = $('form-subscription-plans');
            if (oForm) {
	            var aRadioButtons = oForm['p-plan-select'];
	            if (typeof aRadioButtons.length == 'undefined') {
	            	if (aRadioButtons.checked) {
                        return true; // one is checked
                    }
	            } else {
		            for (var i=0; i<aRadioButtons.length; i++) {
		                if (aRadioButtons[i].checked) {
		                    return true; // one is checked
		                }
		            }
	            }
            	alert('Please select a plan');
	            return false; // non checked
            }
            return true; // on some subscription pages form might not have been implemented

	},

	cardTypeChange : function() {
		if ( $F("p-cardno") =="") {
			return;
		} else {
			Validation.validate($("p-cardno"));
		}
	}

};
Event.observe(document,"dom:loaded",SD.PremiumMembership.init.bind(SD.PremiumMembership));

/*= sd_nav.js  SIMPLIFIED */

SD.Nav = {
    redirectTo : function(url) {
        self.location.href = url;
    }
};

/*= sd_navutils.js  SIMPLIFIED*/

SD.NavUtils = new function() {
    this.link = function (controller, action, params) {
        var baseUrl = SD.Config.getLinkBase(controller, action);
        return !params ? baseUrl : baseUrl + '&' + this.queryString(params);
    };
    this.linkSecure = function (controller, action, params) {
        var baseUrl = SD.Config.getLinkBase(controller, action).replace(/http:\/\/[^\/]+\//i,'/');
        return !params ? baseUrl : baseUrl + '&' + this.queryString(params);
    };
};


if (self == top) {
    SD.WindowManager.init();
}
var targetWindow = self == top ? self : parent;

function onSubscriptionInfoClick () {
    var win = targetWindow.SD.UIController.standardPopup({
        groupId: 'group4',
        title: "Policy For All Billing Plans",
        draggable: true,
        width: 400,
        height: 375
    });
    win.getContent().insert($('rebill-info').innerHTML);
    win.showCenter();
}
function showPrivacyPolicy () {
    var win = targetWindow.SD.UIController.standardPopup({
        groupId: 'group4',
        title: "Privacy Policy",
        draggable: true,
        width: 400,
        height: 375
    });
    win.getContent().insert($('privacy-policy').innerHTML);
    win.showCenter();
}


function toMinuteAndSecond( x ) {
    var min=(x/60);
    var sec=(x%60);
    return "0" + Math.floor(min) + ":" + (sec<10?"0":"") + sec;
}

function changeImages( x ) {
    var min=(x/60);
    var sec=(x%60);
    var position1 = 0;
    var position2 = Math.floor(min);
    var position3 = (sec < 10) ? 0 : Math.floor(sec/10);
    var position4 = sec % 10;

    $("position1").className = "dig" + position1;
    $("position2").className = "dig" + position2;
    $("position3").className = "dig" + position3;
    $("position4").className = "dig" + position4;
}

function setTimer( remain, actions ) {
    (function countdown() {
       changeImages(remain);
       actions[remain] && actions[remain]();
       (remain -= 1) >= 0 && setTimeout(arguments.callee, 1000);
    })();
}

$("position1") && document.observe("dom:loaded", setTimer.bind(null, 120, {}));


/*= sd_tooltip.js */
SD.Tooltip = function() {
	var id = 'tt';
	var top = 3;
	var left = 18;
	var maxw = 300;
	var speed = 10;
	var timer = 20;
	var endalpha = 95;
	var alpha = 0;
	var tt,t,c,b,h;
	var ie = document.all ? true : false;
	return{
		show:function(v,w){
			if (!tt) {
				tt = document.createElement('div');
				tt.setAttribute('id',id);
				t = document.createElement('div');
				t.setAttribute('id',id + 'top');
				c = document.createElement('div');
				c.setAttribute('id',id + 'cont');
				b = document.createElement('div');
				b.setAttribute('id',id + 'bot');
				tt.appendChild(t);
				tt.appendChild(c);
				tt.appendChild(b);
				document.body.appendChild(tt);
				tt.style.opacity = 0;
				tt.style.filter = 'alpha(opacity=0)';
				document.onmousemove = this.pos;
			}
			tt.style.display = 'block';
			c.innerHTML = v;
			tt.style.width = w ? w + 'px' : 'auto';
			if(!w && ie){
				t.style.display = 'none';
				b.style.display = 'none';
				tt.style.width = tt.offsetWidth;
				t.style.display = 'block';
				b.style.display = 'block';
			}
			if (tt.offsetWidth > maxw) {
                tt.style.width = maxw + 'px';
            }
			h = parseInt(tt.offsetHeight, 10) + top;
			clearInterval(tt.timer);
			tt.timer = setInterval(function(){SD.Tooltip.fade(1);}, timer);
		},
		pos:function(e){
            if (!tt) {
                return;
            }
			var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY;
			var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX;
			tt.style.top = u + 'px';
			tt.style.left = (l + left) + 'px';
		},
		fade:function(d){
            if (!tt) {
                return;
            }			var a = alpha;
			if((a != endalpha && d == 1) || (a !== 0 && d == -1)){
				var i = speed;
				if(endalpha - a < speed && d == 1){
					i = endalpha - a;
				}else if(alpha < speed && d == -1){
					i = a;
				}
				alpha = a + (i * d);
				tt.style.opacity = alpha * 0.01;
				tt.style.filter = 'alpha(opacity=' + alpha + ')';
			}else{
				clearInterval(tt.timer);
				if (d == -1) {
                    tt.style.display = 'none';
                }
			}
		},
		hide:function(){
            if (!tt) {
                return;
            }
			clearInterval(tt.timer);
			tt.timer = setInterval(function(){SD.Tooltip.fade(-1);},timer);
		}
	};
}();

SD.Tooltip.init = function(){
    var bases = arguments[0] ? arguments[0].select('.tooltip-base') : $$('.tooltip-base');
    bases.each( function(base) { (new SD.Tooltip.Signup(base)); } );
    if ( bases.first() ) {
        var firstInput = bases.first().select('input, select, textarea').first();
        if ( firstInput ){ firstInput.focus(); }
    }
}

SD.Tooltip.Signup = Class.create( {
	baseElement: null,
	focusCounter: 0,
	iframe: null,
	tooltipDiv: null,
	isShown: false,

	initialize: function(base){
		this.baseElement = $(base);

		this.baseElement.select('input, select, textarea').each( function(e)
				{
					e.observe('focus', this.onFocus.bindAsEventListener(this) );
					e.observe('blur', this.onBlur.bindAsEventListener(this) );
				}.bind(this)
			);

		this.tooltipDiv = $(document.createElement('DIV'));
		this.tooltipDiv.addClassName('tooltip');
		var divB = $(document.createElement('DIV'));
		divB.addClassName('b');
		this.tooltipDiv.appendChild( divB );
		var divC = $(document.createElement('DIV'));
		divC.addClassName('c');
		divB.appendChild( divC );

		var tip = this.baseElement.select('div.tooltip-text').first();
        if(!tip) return;
		tip.parentNode.removeChild( tip );
		divC.appendChild( tip );

		if (Prototype.Browser.IE){
			this.iframe = $(document.createElement('IFRAME'));
			this.iframe.addClassName('menu-iframe');
			this.iframe.style.display = 'none';
			$(document.body).appendChild( this.iframe );
		}
		this.tooltipDiv.style.display = 'none';
		$(document.body).appendChild( this.tooltipDiv );

		(new PeriodicalExecuter(this.onTimer.bind(this), 0.1 ));
	},

	onFocus: function(ev){
		SD.log("onFocus()");
		this.focusCounter = 1;
		ev.stop();
	},

	onBlur: function(ev){
		SD.log("onBlur()");
		this.focusCounter = 0;
		ev.stop();
	},

	onTimer: function( pe ){
		if ( this.focusCounter > 0 ) {
			if ( this.isShown ) { return; }
			this.isShown = true;

			if(this.iframe){ this.iframe.style.display = 'block'; }
			this.tooltipDiv.style.display = 'block';

			this.tooltipDiv.clonePosition(
				this.baseElement,
					{
						setWidth: false,
						setHeight: false,
						offsetLeft: this.getInternalEdge(this.baseElement)-this.baseElement.cumulativeOffset().left
						/*this.baseElement.getWidth()*/
					}
				);
			if (this.iframe){ this.iframe.clonePosition( this.tooltipDiv );	}

			// IE has problems in the initial clonePosition(), so just make this run constantly if it's not OK yet
			if (!this.tooltipDiv.visible()){
				SD.log("Sd.Tooltip.Signup::onTimer(), tooltip is not visible yet: this.isShown=false");
				this.isShown = false;
			}
		} else {
			if (!this.isShown){	return; }
			this.isShown = false;

			if (this.iframe){ this.iframe.style.display = 'none'; }
			this.tooltipDiv.style.display = 'none';
		}
	},

	getInternalEdge: function(e) {
		var node;
		var rightmost_edge = -1;
		// "Note that all of Prototype's DOM traversal methods ignore text nodes and return element nodes only."
		$(e).childElements().each( function(c) {
				var x = c.cumulativeOffset().left + c.getWidth();

				if ( c.tagName == 'INPUT' && c.type == 'file' ) {
					if ( SD.BrowserDetect && SD.BrowserDetect.OS == 'Mac' && SD.BrowserDetect.browser == 'Firefox' )
						{ x += 60; }
				}

				if ( x > rightmost_edge ){ rightmost_edge = x; }
			} );

		return rightmost_edge;
	}
} );

document.observe('dom:loaded', function(ev){SD.Tooltip.init();});