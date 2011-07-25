// CSS Query - Cross browser library that selects DOM elements via CSS query string
// Copyright (C) 2011 Todd Wolfson, Ensighten LLC

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, version 3 of the License.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// Available at: http://www.gnu.org/licenses/gpl-3.0.txt
(function (win, doc) {
  // There are four config points for CSS unobtrusiveness
  // They can be found via a search for 'CONFIGURE POINT'
  var CSSQuery,
      getZIndex,
      body = doc.body;

  /**
   * Traverse DOM top-down running a function on each node, if true return in the end
   * @param {Node}     node Node to run function on and traverse children of
   * @param {Function} fn   Boolean function that tells to return at the end or not
   * @param {Array<Node>} arr Array of elements that returned true during traversal
   * @returns arr
   */
  function walkNodeFn(node, fn, arr) {
    var result = fn(node),
        i,
        len,
        childNodes;
    if( result ) {
      // jGoods you are welcome for characters over performance
      arr.push( node );
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
          // CONFIGURE POINT 1
          ret = style.getPropertyValue('z-index');
        }
        else {
          style = node.currentStyle;
          // CONFIGURE POINT 2
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
   * @returns {Array<HTMLElement>} HTMLElements that are node and/or its children that match the CSS Query
   */
  CSSQuery = function ( node, query ) {
    var head,
        styleElt,
        styleSheet,
        cssRule,
        rules,
        arr = [],
        ruleIndex,
        R  = 'Rule',
        iR = 'insert' + R,
        aR = 'add'    + R,
        dR = 'delete' + R,
        rR = 'remove' + R;

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
    // CONFIGURE POINT 3
    ruleIndex  = -1;

    // Chrome is quirky so we will do the counting out here
    rules = styleSheet.rules;
    if( !rules ) {
      rules = styleSheet.cssRules;
    }

    // If we cannot delete the rule later, it should not be added
    if( !rules ) {
      return arr;
    }

    cssRule   = 'position: relative; z-index: 1;';
    ruleIndex = rules.length;

    // Add the rule to the stylesheet
    if ( styleSheet[iR] ) {
      styleSheet[iR]( query + '{' + cssRule + '}', ruleIndex );
    }
    else if( styleSheet[aR] ) {
      styleSheet[aR]( query, cssRule );
    }

    // Traverse the DOM searching for our unique style
    arr = walkNodeFn(
      node,
      function (node) {
        var val = getZIndex(node);
        // CONFIGURE POINT 4
        return val === '1';
      },
      [] );

    // Remove the rule for future searches
    if ( styleSheet[dR] ) {
      styleSheet[dR]( ruleIndex );
    }
    else if( styleSheet[rR] ) {
      styleSheet[rR]( ruleIndex );
    }

    return arr;
  };

  // Bind to the outside
  win.CSSQuery = CSSQuery;

}(window, document));