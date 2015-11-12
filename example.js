'use strict';

var GithubContent = require('./');
var gc = new GithubContent();

gc.owner('doowb')
  .repo('handlebars-helpers')
  .branch('docs');

gc.files(['scaffolds.json', 'package.json'], function(err, results) {
  if (err) return console.error(err);
  results.forEach(function(file) {
    console.log('----', file.path, '----');
    console.log(file.content);
    console.log();
  });
});
