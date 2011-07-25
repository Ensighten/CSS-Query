var mainTest = TestCase("CSS Query test suite");

mainTest.prototype.setUp = function(){};
mainTest.prototype.tearDown = function(){};

mainTest.prototype.testQuery = function () {
/*:DOC += <div id="myDiv">
    <p class="one">
      <a href="http://www.google.com/">
        This is a link
      </a>
    </p>
  </div> */
/*:DOC += <div>
    <p class="two dos">
      <a href="#">
        Another link
      </a>
    </p>
  </div> */
/*:DOC += <span>
    <p class="third">
      <a href="#">
        Third link
      </a>
    </p>
  </span> */

  var doc  = document,
      body = doc.body,
      allNodes = [body];

  var allDivs = doc.getElementsByTagName('div'),
      allP  = doc.getElementsByTagName('p'),
      allA  = doc.getElementsByTagName('a'),
      myDiv = doc.getElementById('myDiv'),
      secondLink = allDivs[1].getElementsByTagName('a')[0],
      firstSpan  = doc.getElementsByTagName('span')[0];

  allNodes.push( allDivs[0], allP[0], allA[0] );
  allNodes.push( allDivs[1], allP[1], allA[1] );
  allNodes.push( firstSpan,  allP[2], allA[2] );

  // No parameters
  assertEquals( "CSS Query: No params (everything top-down)", allNodes, CSSQuery() );

  // First param only
  assertEquals( "CSS Query: First param only", allNodes.slice(allNodes.length - 3), CSSQuery(firstSpan) );

  // Second param only
  assertEquals( "CSS Query: Second param only", [allDivs[0], allDivs[1]], CSSQuery(null, 'div') );

  // Both params, remaining functionality
  assertEquals( "CSS Query: #myDiv",      [myDiv],      CSSQuery(body, '#myDiv') );
  assertEquals( "CSS Query: Second link", [secondLink], CSSQuery(body, '.two a') );
  assertEquals( "CSS Query: Bad query (a p span)", [],  CSSQuery(body, 'a p span') );
};