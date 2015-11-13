/*!
 * github-content <https://github.com/doowb/github-content>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var GithubBase = require('github-base');
var utils = require('./utils');

/**
 * Create an instance of GithubContent to setup downloading of files.
 *
 * ```js
 * var options = {
 *   owner: 'doowb',
 *   repo: 'github-content',
 *   branch: 'master' // defaults to master
 * };
 *
 * var gc = new GithubContent(options);
 * ```
 * @param {Object} `options` Options to set on instance. Additional options passed to [github-base]
 * @param {String} `options.owner` Set the owner to be used for each file.
 * @param {String} `options.repo` Set the repository to be used for each file.
 * @param {String} `options.branch` Set the branch to be used for each file. Defaults to `master`
 * @api public
 */

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

/**
 * Set the `owner` to be used when downloading a file.
 *
 * ```js
 * gc.owner('doowb');
 * ```
 *
 * @param  {String} `owner` Github owner (user or organization)
 * @return {Object} `this` to enable chaining
 * @api public
 */

GithubContent.prototype.owner = function(owner) {
  this.cache.owner = owner;
  return this;
};

/**
 * Set the `repo` to be used when downloading a file.
 *
 * ```js
 * gc.repo('github-content');
 * ```
 *
 * @param  {String} `repo` Github repoistory
 * @return {Object} `this` to enable chaining
 * @api public
 */

GithubContent.prototype.repo = function(repo) {
  this.cache.repo = repo;
  return this;
};

/**
 * Set the `branch` to be used when downloading a file.
 *
 * ```js
 * gc.branch('dev');
 * ```
 *
 * @param  {String} `branch` Github branch
 * @return {Object} `this` to enable chaining
 * @api public
 */

GithubContent.prototype.branch = function(branch) {
  this.cache.branch = branch;
  return this;
};

/**
 * Download a single file using the previous settings and the passed in file name.
 * File object returned will contain a `.path` property with the file path passed in
 * and a `.content` property with the contents of the downloaded file.
 *
 * ```js
 * gc.file('package.json', function(err, file) {
 *   if (err) return console.log(err);
 *   console.log(file.path);
 *   console.log(file.contents);
 * });
 * //=> package.json
 * //=> {
 * //=>   "name": "github-content"
 * //=>   ...
 * //=> }
 * ```
 *
 * @param  {String} `fp` file to download
 * @param  {Object} `options` Additional options to base to [github-base] `.get` method.
 * @param  {Function} `cb` Callback function taking `err` and `file`
 * @return {Object} `this` to enable chaining
 * @api public
 */

GithubContent.prototype.file = function(fp, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};

  var url = '/';
  if (this.cache.owner) url += this.cache.owner + '/';
  if (this.cache.repo) url += this.cache.repo + '/';
  url += (this.cache.branch ? this.cache.branch : 'master') + '/';
  url += fp;
  this.get(url, options, function(err, content) {
    if (err) return cb(err);
    cb(null, {path: fp, content: content});
  });
  return this;
};

/**
 * Download an array of files using the previous settings and the passed in file names.
 * File objects returned will contain a `.path` property with the file path passed in
 * and a `.content` property with the contents of the downloaded file.
 *
 * ```js
 * gc.files(['package.json', 'index.js'], function(err, files) {
 *   if (err) return console.log(err);
 *   console.log(files.length);
 *   console.log(files[0].path);
 *   console.log(files[0].contents);
 * });
 * //=> 2
 * //=> package.json
 * //=> {
 * //=>   "name": "github-content"
 * //=>   ...
 * //=> }
 * ```
 *
 * @param  {String|Array} `files` files to download
 * @param  {Object} `options` Additional options to base to [github-base] `.get` method.
 * @param  {Function} `cb` Callback function taking `err` and `files`
 * @return {Object} `this` to enable chaining
 * @api public
 */

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

/**
 * Exposes `GithubContent`
 */

module.exports = GithubContent;
