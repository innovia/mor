if (!('console' in window) || !('firebug' in console)) {
(function() {

  /* Firebug console object */
  window.console = {
    frame: undefined,
    body:  undefined,
    cli:   undefined,
    cliPS: '>>> ',

    messageQueue: [],
    groupStack:   [],
    timeMap:      {},

    log:   function() { this.logFormatted(arguments) },
    debug: function() { this.logFormatted(arguments, 'debug') },
    info:  function() { this.logFormatted(arguments, 'info') },
    warn:  function() { this.logFormatted(arguments, 'warning') },
    error: function() { this.logFormatted(arguments, 'error') },

    count:      function() { this.warn(['count() not supported.']) },
    trace:      function() { this.warn(['trace() not supported.']) },
    profile:    function() { this.warn(['profile() not supported.']) },
    profileEnd: function() {},

    clear:    function() { this.body.innerHTML = '' },
    open:     function() { this.frame.style.display = '' },
    close:    function() { this.frame.style.display = 'none' },
    activate: function() { this.open(); this.cli.focus(); },
    toggle:   function() {
      this.frame.style.display
        = this.frame.style.display != 'none' ? 'none' : '';
    },
    
    assert: function(truth, message) {
      if (!truth) {
        var args = Array.prototype.slice.apply(arguments, [1]);
        this.logFormatted(args.length ? args : ['Assertion Failure'], 'error');
        throw message ? message : 'Assertion Failure';
      }
    },

    dir: function(object) {
      var html = [];
      var pairs = [];
      for (var name in object) {
        try {
          pairs.push([name, object[name]]);
        } catch (exc) {};
      }
      pairs.sort(function(a, b) { return a[0] < b[0] ? -1 : 1; });
      html.push('<table>');
      for (var i = 0; i < pairs.length; ++i) {
        var name = pairs[i][0], value = pairs[i][1];
        html.push('<tr>',
          '<td class="propertyNameCell"><span class="propertyName">',
          escapeHTML(name),
          '</span></td>',
          '<td><span class="propertyValue">'
        );
        this.appendObject(value, html);
        html.push('</span></td></tr>');
      }
      html.push('</table>');
      this.logRow(html, 'dir');
    },

    dirxml: function(node) {
      var html = [];
      this.appendNode(node, html);
      this.logRow(html, 'dirxml');
    },
    
    group: function() {
      this.logRow(arguments, 'group', 'pushGroup');
    },
    groupEnd: function() {
      this.logRow(arguments, '', 'popGroup');
    },

    time: function(name) {
      this.timeMap[name] = (new Date()).getTime();
    },
    timeEnd: function(name) {
      if (name in this.timeMap) {
        var delta = (new Date()).getTime() - this.timeMap[name];
        this.logFormatted([name+ ":", delta+"ms"]);
        delete this.timeMap[name];
      }
    },

    appendRow: function(row) {
      ( this.groupStack.length
          ? this.groupStack[ this.groupStack.length - 1 ]
          : this.body
      ).appendChild(row);
    },

    writeRow: function(message, className) {
        var row = document.createElement("div");
        row.className = 'logRow' + (className ? ' logRow-' + className : '');
        row.innerHTML = message.join('');
        this.appendRow(row);
    },

    logRow: function(message, className, handler) {
      if (this.body)
        this.writeMessage(message, className, handler);
      else
        this.messageQueue.push([message, className, handler]);
    },

    writeMessage: function(message, className, handler) {
      var isScrollToBottom
        = this.body.scrollTop + this.body.offsetHeight >= this.body.scrollHeight
      this[ handler || 'writeRow'](message, className);
      if (isScrollToBottom)
        this.body.scrollTop = this.body.scrollHeight - this.body.offsetHeight;
    },

    evalCommandLine: function() {
      var text = this.cli.value;
      this.cli.value = '';
      this.logRow([this.cliPS, text], 'command');
      var value;
      try {
        value = eval(text);
      } catch (exc) {};
      this.log(value);
    },

    flush: function() {
      var queue = this.messageQueue;
      this.messageQueue = [];
      for (var i = 0; i < queue.length; ++i)
        this.writeMessage(queue[i][0], queue[i][1], queue[i][2]);
    },

    pushGroup: function(message, className) {
      this.logFormatted(message, className);
      var groupRow = document.createElement('div');
      groupRow.className = 'logGroup';
      var groupRowBox = document.createElement('div');
      groupRowBox.className = 'logGroupBox';
      groupRow.appendChild(groupRowBox);
      this.appendRow(groupRowBox);
      this.groupStack.push(groupRowBox);
    },
    popGroup: function() {
      this.groupStack.pop();
    },

    logFormatted: function(objects, className) {
      var html = [], format = objects[0], objIndex = 0;
      if (typeof format !== 'string')
        format = '', objIndex = -1;
      var parts = this.parseFormat(format);
      for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        if (part && typeof part === 'object') {
          var object = objects[++objIndex];
          this[part.appender](object, html);
        } else {
          this.appendText(part, html);
        }
      }
      for (var i = objIndex+1; i < objects.length; ++i) {
        this.appendText(' ', html);
        var object = objects[i];
        this[typeof object === 'string' ? 'appendText' : 'appendObject'](object, html);
      }
      this.logRow(html, className);
    },

    parseRE: /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/,
    parseMap: {
      s: 'appendText',
      d: 'appendInteger',
      i: 'appendInteger',
      f: 'appendFloat'
    },
    parseFormat: function(format) {
      var parts = [];
      for (var m = this.parseRE.exec(format); m; m = this.parseRE.exec(format)) {
        var type = m[8] ? m[8] : m[5];
        parts.push( format.substr(0, m[0][0] === '%' ? m.index : m.index+1) );
        parts.push({
          appender:  this.parseMap[type] || 'appendObject',
          precision: m[3] ? parseInt(m[3]) : (m[4] === '.' ? -1 : 0)
        });
        format = format.substr(m.index+m[0].length);
      }
      parts.push(format);
      return parts;
    },

    objectToString: function(object) {
      try {
        return object + '';
      } catch (exc) {
        return null;
      }
    },

    escapeHTML: function(value) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(value));
      return div.innerHTML;
    },

    escapeObject: function(object) {
      return this.escapeHTML(this.objectToString(object));
    },

    appendText: function(object, html) {
      html.push(this.escapeObject(object));
    },

    appendNull: function(object, html) {
      html.push( '<span class="objectBox-null">',
        this.escapeObject(object), '</span>');
    },

    appendString: function(object, html) {
      html.push('<span class="objectBox-string">&quot;',
        this.escapeObject(object), '&quot;</span>');
    },

    appendInteger: function(object, html) {
      html.push('<span class="objectBox-number">',
        this.escapeObject(object), '</span>');
    },

    appendFloat: function(object, html) {
      html.push('<span class="objectBox-number">',
        this.escapeObject(object), '</span>');
    },

    appendFunctionRE: /function ?(.*?)\(/,
    appendFunction: function(object, html) {
      var m = this.appendFunctionRE.exec(this.objectToString(object));
      var name = m ? m[1] : 'function';
      html.push('<span class="objectBox-function">',
        this.escapeHTML(name), '()</span>');
    },

    appendObject: function(object, html) {
      try {
        var type = 'Text';
        if (object == undefined)
          type = 'Null', object = 'undefined';
        else if (object == null)
          type = 'Null', object = 'null';
        else if (typeof object === 'string')
          type = 'String';
        else if (typeof object === 'number')
          type = 'Integer';
        else if (typeof object === 'function')
          type = 'Function';
        else if (object.nodeType === 1)
          type = 'Selector';
        else if (typeof object === 'object')
          type = 'ObjectFormatted';
        this['append' + type](object, html);
      } catch (exc) {};
    },

    appendObjectRE: /\[object (.*?)\]/,
    appendObjectFormatted: function(object, html) {
      var text = this.objectToString(object);
      var m = this.appendObjectRE.exec(text);
      html.push('<span class="objectBox-object">', m ? m[1] : text, '</span>');
    },

    appendSelector: function(object, html) {
      html.push('<span class="objectBox-selector">');
      html.push('<span class="selectorTag">',
        this.escapeHTML(object.nodeName.toLowerCase()), '</span>');
      if (object.id)
        html.push('<span class="selectorId">#',
          this.escapeHTML(object.id), '</span>');
      if (object.className)
        html.push('<span class="selectorClass">.',
          this.escapeHTML(object.className), '</span>');
      html.push('</span>');
    },

    appendNode: function(node, html) {
      if (node.nodeType === 1) {
        html.push('<div class="objectBox-element">&lt;<span class="nodeTag">',
          node.nodeName.toLowerCase(), '</span>');
        for (var i = 0; i < node.attributes.length; ++i) {
          var attr = node.attributes[i];
            if (!attr.specified) continue;
            html.push(
              '&nbsp;<span class="nodeName">',
              attr.nodeName.toLowerCase(),
              '</span>=&quot;<span class="nodeValue">',
              this.escapeHTML(attr.nodeValue),
              '</span>&quot;'
            );
        }
        if (node.firstChild) {
          html.push('&gt;</div><div class="nodeChildren">');
          for (var child = node.firstChild; child; child = child.nextSibling)
            this.appendNode(child, html);
          html.push(
            '</div><div class="objectBox-element">&lt;/<span class="nodeTag">', 
            node.nodeName.toLowerCase(),
            '&gt;</span></div>'
          );
        } else {
          html.push('/&gt;</div>');
        }
      } else if (node.nodeType === 3) {
        html.push('<div class="nodeText">',
          this.escapeHTML(node.nodeValue), '</div>');
      }
    },

    onKeyDown: function(event) {
      if (event.keyCode == 123)
        this.toggle();
      else if ((event.keyCode == 108 || event.keyCode == 76) && event.shiftKey
                 && (event.metaKey || event.ctrlKey))
        this.activate();
      else
        return;
      this.cancelEvent(event);
    },

    onCommandLineKeyDown: function(event) {
      if (event.keyCode == 13)
        this.evalCommandLine();
      else if (event.keyCode == 27)
        this.cli.value = '';
    },

    create: function() {
      if (this.frame) return;

      this.frame = document.createElement('div');
      this.frame.id = 'firebug';
      if (document.documentElement.getAttribute('debug') !== 'true')
        this.frame.style.display = 'none';
      document.body.appendChild(this.frame);

      var tb = document.createElement('div');
      tb.className = 'toolbar';
      this.frame.appendChild(tb);

      var clr = document.createElement('a');
      clr.href = '#';
      clr.className = 'clear';
      clr.innerHTML = 'clear';
      this.addListener(clr, 'click', 'clear');
      tb.appendChild(clr);

      var clz = document.createElement('a');
      clz.href = '#';
      clz.className = 'close';
      clz.innerHTML = 'close';
      this.addListener(clz, 'click', 'close');
      tb.appendChild(clz);

      this.body  = document.createElement('div');
      this.body.className = 'log';
      this.frame.appendChild(this.body);

      this.cli   = document.createElement('input');
      this.cli.type = 'text';
      this.cli.className = 'cli';
      this.addListener(this.cli, 'keydown', 'onCommandLineKeyDown');
      this.frame.appendChild(this.cli);

      this.flush();
    },

    addListener: function(element, name, handler) {
      if (name == 'keypress' &&
          (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
          || element.attachEvent))
        name = 'keydown';

      var listener = function() {
        window.console[handler](event || window.event);
      };

      if (element.addEventListener) {
        element.addEventListener(name, listener, false);
      } else if (element.attachEvent) {
        element.attachEvent('on' + name, listener);
      }
    },

    cancelEvent: function(event) {
      if (event.preventDefault) { 
        event.preventDefault(); 
        event.stopPropagation(); 
      } else {
        event.returnValue = false;
        event.cancelBubble = true;
      }
    }

  };

  /* plug Firebug console CSS rules - dumb and rough */ 
  var scripts = document.getElementsByTagName('script'), baseURL, idx = scripts.length;
  while (!baseURL && idx-- > 0) {
    var match = scripts[idx].src.indexOf('firebug.js');
    if (match > -1)
      baseURL = scripts[idx].src.substring(0,match);
  }
  document.write('<link type="text/css" rel="stylesheet" href="' + baseURL, 'firebug.css" />');

  /* log window errors to console too */
  window.onerror = function(msg, href, lineNo) {
    var html = [];
    var lastSlash = href.lastIndexOf('/');
    var fileName = lastSlash == -1 ? href : href.substr(lastSlash+1);
    html.push(
      '<span class="errorMessage">', msg, '</span>',
      '<div class="objectBox-sourceLink">', fileName, ' (line ', lineNo, ')</div>'
    );
    console.logRow(html, 'error');
  };

  /* prepare console */
  window.console.addListener(document, 'keypress', 'onKeyDown');
  window.console.addListener(window, 'load', 'create');

})();
}
