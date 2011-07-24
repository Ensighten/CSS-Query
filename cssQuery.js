(function (win, doc) {
  var CSSQuery,
      qS  = 'querySelector',
      qSA = qS + 'All',
      QuerySelector    = doc[qS],
      QuerySelectorAll = doc[qSA],
      getStyle;
      // There are two config points for CSS unobtrusiveness
      // They can be found via a search for 'CONFIGURE POINT'

  // TODO: JSDoc
  function walkNodeFn(node, fn, arr) {
    var result = fn(node),
        i,
        len,
        childNodes;
    if( result ) {
      // jGoods you are welcome for characters over performance
      arr.push( node );
    }
    // Using 0 as a hard stop constant
    else if( result === 0 ) {
      // TODO: This won't stop recursion from left to right though...
      return arr;
    }
    childNodes = node.childNodes;

    // Perform DFS (over BFS) since top down reading works that way
    for( i = 0, len = childNodes.length; i < len; i++ ) {
      walkNodeFn(childNodes[i], fn, arr);
    }
    return arr;
  }

  /**
   * Style Object constructor
   * @param {HTMLElement} node Node to return Style Object on
   * @returns {Object<Style>} Wrapper object with 'g' function to return style of node
   */
  Style = (function (win) {
    var gCS = win.getComputedStyle;
    return function (node) {
      var ret = { g: function () { return; } },
          style;
      // Skip over text nodes
      if( node.nodeType !== 3 ) {
        if( node.currentStyle ) {
          style = node.currentStyle;
          ret = { g: function (key) { return style[key] + ''; } };
        }
        else if(gCS) {
          // Second parameter is for pseudo element (we never use it)
          style = gCS(node);
          ret = { g: function (key) { return style.getPropertyValue(key); } };
        }
      }
      return ret;
    };
  }(win));

  /**
   * General purpose CSS Query function
   * @param {Node}    node      Node that will be searched on
   * @param {String}  query     CSS Query to find elements that match
   * @xParam {Object}  options   Object that holds additional options
   * @xParam {String}  options.r CSS rule to apply to CSS Query
   * @xParam {Boolean} options.s Stop on first item or not
   * Options have been nerfed to save on file size
   * @returns {Array.HTMLElement|HTMLElement} HTMLElement(s) that are either the node itself or children and match the CSS Query
   */
  CSSQuery = function ( node, query ) {
    var head,
        styleElt,
        styleSheet,
        cssRule,
        arr = [],
        ruleIndex;

    // Create a stylesheet if one does not exist
    // TODO: Could create a Stylesheet Object which has creation/deletion methods but that is overengineering at this point
    // TODO: Use stylesheet.disabled if there is a flicker
    if( document.styleSheets.length < 1 ) {
      // FF does not support IE's createStyleSheet
      styleElt = document.createElement('style');
      // TODO: Bullet proof append
      head = document.getElementsByTagName("head");
      if( head && head.length > 0 ) {
        head[0].appendChild(styleElt);
      }

      // Check and keep on trying
      if( document.styleSheets.length < 1 ) {
        // TODO: Use IE addStyleSheet method here (only if failures start happening here in testing)

        // If nothing works, return early
        return arr;
      }
    }

    // Place down fallbacks
    node  = node  || doc;
    query = query || '*';

    // Grab the first styleSheet
    styleSheet = document.styleSheets[0];
    // CONFIGURE POINT 1
    cssRule    = 'z-index: 1;';
    ruleIndex  = -1;

    // TODO: Compress accessor strings (ie aR = "addRule")
    // Add the rule to the stylesheet
    if( styleSheet.addRule ) {
      ruleIndex = styleSheet.rules.length;
      styleSheet.addRule( query, cssRule );
    }
    else if ( styleSheet.insertRule ) {
      ruleIndex = styleSheet.insertRule( query + '{' + cssRule + '}', styleSheet.cssRules.length );
    }

    // Traverse the DOM searching for our unique style
    arr = walkNodeFn(
      node,
      function (node) {
        var style = Style(node);
        // console.log(style.g('z-index') === '1');
        // CONFIGURE POINT 2
        return style.g('z-index') === '1';
      },
      [] );

    // Remove the rule for future searches
    if( styleSheet.removeRule ) {
      styleSheet.removeRule( ruleIndex );
    }
    else if ( styleSheet.deleteRule ) {
      styleSheet.deleteRule( ruleIndex );
    }

    return arr;
  };

  /**
   * Binding function for CSS Query to window
   * @param   {Node}   node  [Optional] Node to be searched on, if unspecified search on document
   * @param   {String} query CSS Query to find elements that match
   * @returns {HTMLElement} First HTMLElement that matches the CSS Query
   */
  win.CSSQuery = function (node, query) {
    node  = node  || doc;
    query = query || '*';

    // Use native code if existant
    if( QuerySelector ) {
      return node[qS](query);
    }

    return CSSQuery( node, query, {'s': 1} );
  };

  // TODO: One more JS Doc
  win.CSSQueryAll = function (node, query) {
    node  = node  || doc;
    query = query || '*';

    // Use native code if existant
    if( QuerySelectorAll ) {
      return node[qSA](query);
    }

    return CSSQuery( node, query, {'s': 0} );
  };

  win.CSSQuery = CSSQuery;

}(window, document));

// window.onload = function () {
  // var allDivs;
  // // TODO: Remove try catch
  // try {
    // allDivs = rawCSSQuery(document.body, 'div');
    // console.log(allDivs);
    // for( i in allDivs ) {
      // allDivs[i].setAttribute('style', 'margin: 100px;');
    // }
  // } catch(e) {
    // alert(e.message);
  // }
// }

// Final test
window.onload = function () {
  var myDiv   = rawCSSQuery(document.body, '#myDiv'),
      allDivs = rawCSSQuery(document.body, 'div'),
  // var myDiv   = CSSQuery(null, '#myDiv'),
      // allDivs = CSSQueryAll(null, 'div'),
      i,
      div,
      text;
  if( myDiv ) {
    text = document.createTextNode('text1')
    myDiv.appendChild(text);
  }

  if( allDivs ) {
    for( i = allDivs.length; i--; ) {
      text = document.createTextNode('text2');
      div = allDivs[i];
      div.appendChild(text);
    }
  }
};

