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

describe('github-content', function() {
  it('should create an instance with default options', function() {
    var gc = new GithubContent();
    assert(gc instanceof GithubContent);
    assert.equal(gc.options.json, false);
    assert.equal(gc.options.apiurl, 'https://raw.githubusercontent.com');
  });

  it('should create an instance with default options without using new', function() {
    var gc = GithubContent();
    assert(gc instanceof GithubContent);
    assert.equal(gc.options.json, false);
    assert.equal(gc.options.apiurl, 'https://raw.githubusercontent.com');
  });

  it('should create an instance with specified option values', function() {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    assert.equal(gc.options.owner, 'doowb');
    assert.equal(gc.options.repo, 'github-content');
    assert.equal(gc.options.branch, 'master');
  });

  it('should throw an error when callback is not specified', function() {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    assert.throws(function() {
      gc.file('package.json');
    });
  });

  it('should return an error when the repo is not specified', function(cb) {
    var gc = new GithubContent({
      owner: 'doowb',
      branch: 'master'
    });

    gc.file('package.json', function(err, file) {
      if (!err) {
        cb(new Error('expected an error to be returned'));
        return;
      }
      assert.equal(err.message, 'expected "options.repo" to be specified');
      cb();
    })
  });

  it('should download a file', function(cb) {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    gc.file('package.json', function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(file.path, 'package.json');
      cb();
    });
  });

  it('should allow passing repo in :owner/:name format', function(cb) {
    var gc = new GithubContent({repo: 'doowb/github-content'});

    gc.file('package.json', function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(file.path, 'package.json');
      cb();
    });
  });

  it('should not download a file', function(cb) {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    // false is just to get code coverage
    gc.file('notfound.json', false, function(err, file) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(file.path, 'notfound.json');
      assert.equal(file.contents, '404: Not Found\n');
      cb();
    });
  });

  it('should download a single file as an array of files', function(cb) {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    // false is just to get code coverage
    gc.files('package.json', false, function(err, files) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(files.length, 1);
      assert.equal(files[0].path, 'package.json');
      cb();
    });
  });

  it('should download an array of files', function(cb) {
    var gc = new GithubContent({
      owner: 'doowb',
      repo: 'github-content',
      branch: 'master'
    });

    gc.files(['package.json', 'index.js'], function(err, files) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(files.length, 2);
      files.forEach(function(file) {
        assert(file.path === 'package.json' || file.path === 'index.js');
      });
      cb();
    });
  });

  it('should not download null files', function(cb) {
    var gc = new GithubContent();
    gc.files(null, function(err, files) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(files.length, 0);
      cb();
    });
  });

  it('should not download undefined files', function(cb) {
    var gc = new GithubContent();
    gc.files(undefined, function(err, files) {
      if (err) {
        cb(err);
        return;
      }
      assert.equal(files.length, 0);
      cb();
    });
  });

  describe('errors', function() {
    var gc = null;
    before(function(){
      gc = new GithubContent({owner: 'doowb', repo: 'github-content'});
      sinon
        .stub(gc, 'get')
        .yields(new Error('Fake Error'), null);
    });

    after(function(){
      gc.get.restore();
    });

    it('should error on invalid owner and repo', function(cb) {
      gc.files(['package.json'], function(err, files) {
        assert(err);
        cb();
      });
    });
  });
});
