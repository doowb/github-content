/*!
 * github-content <https://github.com/doowb/github-content>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var sinon = require('sinon');
var GithubContent = require('./');

describe('github-content', function () {
  it('should create an instance with default options', function () {
    var gc = new GithubContent();
    assert(gc instanceof GithubContent);
    assert.equal(gc.options.json, false);
    assert.equal(gc.options.apiurl, 'https://raw.githubusercontent.com');
  });

  it('should create an instance with default options without using new', function () {
    var gc = GithubContent();
    assert(gc instanceof GithubContent);
    assert.equal(gc.options.json, false);
    assert.equal(gc.options.apiurl, 'https://raw.githubusercontent.com');
  });

  it('should create an instance with specified cache values', function () {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    assert.equal(gc.cache.owner, 'doowb');
    assert.equal(gc.cache.repo, 'github-content');
    assert.equal(gc.cache.branch, 'master');
  });

  it('should set cache values through methods', function () {
    var gc = new GithubContent();
    gc.owner('doowb')
      .repo('github-content')
      .branch('master');

    assert.equal(gc.cache.owner, 'doowb');
    assert.equal(gc.cache.repo, 'github-content');
    assert.equal(gc.cache.branch, 'master');
  });

  it('should download a file', function (done) {
    var gc = new GithubContent();
    gc.owner('doowb')
      .repo('github-content')
      .branch('master');

    gc.file('package.json', function(err, file) {
      if (err) return done(err);
      assert.equal(file.path, 'package.json');
      done();
    });
  });

  it('should not download a file', function (done) {
    var gc = new GithubContent();
    gc.owner('doowb')
      .repo('github-content')
      .branch('master');

    // false is just to get code coverage
    gc.file('notfound.json', false, function(err, file) {
      if (err) return done(err);
      assert.equal(file.path, 'notfound.json');
      assert.equal(file.content, '404: Not Found\n');
      done();
    });
  });

  it('should download a single file as an array of files', function (done) {
    var gc = new GithubContent();
    gc.owner('doowb')
      .repo('github-content')
      .branch('master');

    // false is just to get code coverage
    gc.files('package.json', false, function(err, files) {
      if (err) return done(err);
      assert.equal(files.length, 1);
      assert.equal(files[0].path, 'package.json');
      done();
    });
  });

  it('should download an array of files', function (done) {
    var gc = new GithubContent();
    gc.owner('doowb')
      .repo('github-content')
      .branch('master');

    gc.files(['package.json', 'index.js'], function(err, files) {
      if (err) return done(err);
      assert.equal(files.length, 2);
      assert.equal(files[0].path, 'package.json');
      assert.equal(files[1].path, 'index.js');
      done();
    });
  });

  it('should not download null files', function (done) {
    var gc = new GithubContent();
    gc.files(null, function(err, files) {
      if (err) return done(err);
      assert.equal(files.length, 0);
      done();
    });
  });

  it('should not download undefined files', function (done) {
    var gc = new GithubContent();
    gc.files(undefined, function(err, files) {
      if (err) return done(err);
      assert.equal(files.length, 0);
      done();
    });
  });

  describe('errors', function() {
    var gc = null;
    before(function(){
      gc = new GithubContent();
      sinon
        .stub(gc, 'get')
        .yields(new Error('Fake Error'), null);
    });

    after(function(){
      gc.get.restore();
    });

    it('should error on invalid owner and repo', function (done) {
      gc.files(['package.json'], function(err, files) {
        assert(err);
        done();
      });
    });
  });
});
