(function (win, doc) {
  var CSSQuery,
      qS  = 'querySelector',
      qSA = qS + 'All',
      QuerySelector    = doc[qS],
      QuerySelectorAll = doc[qSA],
      getZIndex,
      body = doc.body;
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
   * z-index fetcher (though you can change manually to anything else; see CONFIGURE POINTS)
   * @param {HTMLElement} node Node to return z-index of
   * @returns {String} Z-index of node
   */
  getZIndex = (function (win) {
    var gCS = win.getComputedStyle;
    return function (node) {
      // Initially supported any key, but due to browser wars and size-first changed to fixed
      var ret = '',
          style;
      // Skip over text nodes
      if( node.nodeType !== 3 ) {
        if(gCS) {
          // Second parameter is for pseudo element (we never use it but FF complains otherwise)
          style = gCS(node, null);
          // CONFIGURE POINT 3
          ret = style.getPropertyValue('z-index');
        }
        else {
          style = node.currentStyle;
          // CONFIGURE POINT 4
          if( style ) { 
            // Reference for proper keys: http://msdn.microsoft.com/en-us/library/ms535231%28v=vs.85%29.aspx
            ret = style.zIndex;
          }
        }
      }
      ret += '';
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
        rules,
        arr = [],
        ruleIndex;

    // Create a stylesheet if one does not exist
    // TODO: Could create a Stylesheet Object which has creation/deletion methods but that is overengineering at this point
    // TODO: Use stylesheet.disabled if there is a flicker
    if( document.styleSheets.length < 1 ) {
      // FF does not support IE's createStyleSheet
      styleElt = document.createElement('style');
      // TODO: Bullet proof append
      head = document.getElementsByTagName('head');
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
    node  = node  || body;
    query = query || '*';

    // Grab the first styleSheet
    styleSheet = document.styleSheets[0];
    // CONFIGURE POINT 1
    cssRule    = 'position: relative; z-index: 1;';
    ruleIndex  = -1;

    // Chrome is quirky so we will do the counting out here
    rules = styleSheet.rules;
    if( !rules ) {
      rules = styleSheet.cssRules;
    }

    if( rules ) {
      ruleIndex = rules.length;
    }

    // TODO: Compress accessor strings (ie aR = 'addRule')
    // Add the rule to the stylesheet
    if ( styleSheet.insertRule ) {
      styleSheet.insertRule( query + '{' + cssRule + '}', ruleIndex );
    }
    else if( styleSheet.addRule ) {
      styleSheet.addRule( query, cssRule );
    }

    // Traverse the DOM searching for our unique style
    arr = walkNodeFn(
      node,
      function (node) {
        var val = getZIndex(node);
        // CONFIGURE POINT 2
        return val === '1';
      },
      [] );

    // Remove the rule for future searches
    if ( styleSheet.deleteRule ) {
      styleSheet.deleteRule( ruleIndex );
    }
    else if( styleSheet.removeRule ) {
      styleSheet.removeRule( ruleIndex );
    }

    return arr;
  };

  // Bind to the outside
  win.CSSQuery = CSSQuery;

}(window, document));