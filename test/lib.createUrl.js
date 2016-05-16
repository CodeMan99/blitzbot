var test = require('tape');
var qs = require('querystring');
var createUrl = require('../lib/createUrl.js');

// the permissions is the only thing that varies in createUrl at the moment
function parse(url) {
  var right = url.split('?')[1];

  return qs.parse(right).permissions;
}

test('createUrl', function t1(t) {
  'use strict';

  t.equal(parse(createUrl(5)), '5', 'single number argument');
  t.equal(parse(createUrl(1, 2)), '3', 'multiple number arguments');
  t.equal(parse(createUrl([2, 4])), '6', 'single array argument');
  t.ok(parse(createUrl()), 'no arguments, return default value');
  t.end();
});
