Synopsis
========
Currently, there is no <u>lightweight</u> CSS selector library that supports legacy browsers such as IE 6 and 7. There are shims like Sizzle and YUI's DOM Collect but these are at best 15KB after minification.

CSS Query solves this problem by querying with actual CSS, meaning we can select as finely as we can style elements via CSS. The minified size is 899 bytes before gzipping and 512 bytes after.

How it works
============
CSS Query temporarily adds a style to the page using the query given. For example, to select all div's with the class green and the class banana, we would write:

    var greenBananaDivs = CSSQuery(document.body, 'div.green.banana');

CSS Query then adds a CSS rule to the page which references that query with a uniquely identifiable CSS property. Then, CSS Query searches all of the descendant nodes of document.body and saves each one that has the unique CSS identifier. Finally, it removes the rule and returns the matched elements.

Usage
=====
CSS Query does not currently support AMD and must be used as a traditional script tag. You can find a pre-minified version of the script in the /dist folder for self-hosting. Below is a snippet to use the GitHub hosted version which (not recommended).

    <script src="//raw.github.com/Ensighten/CSS-Query/master/dist/cssQuery.min.js"></script>

Shameless plug: We highly recommend using [Ensighten Manage](http://ensighten.com/) to host and serve your JavaScript files. One line of code on your website and all of your JavaScript will be ansychronously loaded and deployed via our global multi-cloud infrastructure which is designed for deploying JavaScript. To find out more, visit [http://ensighten.com/](http://ensighten.com/).

API
===

 - **CSSQuery**(container, query) - If a container is given, CSSQuery searches each of its descendants with to see if they match the query. If no container is given (e.g. null), CSSQuery uses document.body as the container. query is the CSS query that you would like to select elements by.

Tested and functional in
========================

- Firefox 2.0, 3.0, 3.6, 4.0, 5.0
- Chrome 8, 9, 10, 11, 12
- Opera 9.6, 10.63
- IE 6, 7, 8, 9
- Safari 3, 4, 5
 
License
=======

CSS Query - Cross browser library that selects DOM elements via CSS query string

Copyright (C) 2011 Todd Wolfson, Ensighten LLC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
Available at: http://www.gnu.org/licenses/gpl-3.0.txt