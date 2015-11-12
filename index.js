/*!
 * github-content <https://github.com/doowb/github-content>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var GithubBase = require('github-base');
var utils = require('./utils');

function GithubContent(options) {
  if (!(this instanceof GithubContent)) {
    return new GithubContent(options);
  }

  // setup our specific options
  options = options || {};
  options.json = false;
  options.apiurl = 'https://raw.githubusercontent.com';
  GithubBase.call(this, options);
  utils.define(this, 'cache', {
    owner: this.options.owner,
    repo: this.options.repo,
    branch: this.options.branch
  });
}

GithubBase.extend(GithubContent);

GithubContent.prototype.owner = function(name) {
  this.cache.owner = name;
  return this;
};

GithubContent.prototype.repo = function(repo) {
  this.cache.repo = repo;
  return this;
};

GithubContent.prototype.branch = function(branch) {
  this.cache.branch = branch;
  return this;
};

GithubContent.prototype.file = function(fp, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};

  var url = '/';
  if (this.cache.owner) url += this.cache.owner + '/';
  if (this.cache.repo) url += this.cache.repo + '/';
  if (this.cache.branch) url += this.cache.branch + '/';
  url += fp;
  this.get(url, options, function(err, content) {
    if (err) return cb(err);
    cb(null, {path: fp, content: content});
  });
  return this;
};

GithubContent.prototype.files = function(files, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};
  files = arrayify(files);

  utils.async.map(files, function(file, next) {
    this.file(file, options, next);
  }.bind(this), cb);

  return this;
};

function arrayify(val) {
  if (val === null || typeof val === 'undefined') {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}

module.exports = GithubContent;
