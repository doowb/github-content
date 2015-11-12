'use strict';

var async = require('async');
var GithubContent = require('./');
var gc = new GithubContent();
console.log(gc);

gc.owner('doowb')
  .repo('handlebars-helpers')
  .branch('docs');

async.map(['scaffolds.json', 'package.json'], function(file, next) {
  gc.file(file, next);
}, function(err, results) {
  if (err) return console.error(err);
  results.forEach(function(file) {
    console.log('----', file.path, '----');
    console.log(file.content);
    console.log();
  });
});
