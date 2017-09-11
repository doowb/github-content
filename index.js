/*!
 * github-content <https://github.com/doowb/github-content>
 *
 * Copyright (c) 2015-2017, Brian Woodward.
 * Released under the MIT License.
 */

'use strict';

var GithubBase = require('github-base');
var extend = require('extend-shallow');
var each = require('each-parallel-async');

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
  var opts = extend({branch: 'master'}, options);
  opts.json = false;
  opts.apiurl = 'https://raw.githubusercontent.com';
  GithubBase.call(this, opts);
  this.options = extend({}, opts, this.options);
}

GithubBase.extend(GithubContent);

/**
 * Download a single file given the file name and repository options.
 * File object returned will contain a `.path` property with the file path passed in
 * and a `.contents` property with the contents of the downloaded file.
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
 * @param  {String} `path` file path to download
 * @param  {Object} `options` Additional options to base to [github-base] `.get` method.
 * @param  {Function} `cb` Callback function taking `err` and `file`
 * @return {Object} `this` to enable chaining
 * @api public
 */

GithubContent.prototype.file = function(path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var opts = extend({branch: 'master', path: path}, this.options, options);
  if (!opts.repo) {
    cb(new Error('expected "options.repo" to be specified'));
    return;
  }

  var segs = opts.repo.split('/');
  if (segs.length > 1) {
    opts.owner = segs[0];
    opts.repo = segs[1];
  }

  this.get('/:owner/:repo/:branch/:path', opts, function(err, contents) {
    if (err) return cb(err);
    cb(null, {path: path, contents: contents});
  });
  return this;
};

/**
 * Download an array of files using the previous settings and the passed in file names.
 * File objects returned will contain a `.path` property with the file path passed in
 * and a `.contents` property with the contents of the downloaded file.
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
  var opts = extend({}, options);
  files = arrayify(files);

  map(files, function(file, next) {
    this.file(file, opts, next);
  }.bind(this), cb);

  return this;
};

function arrayify(val) {
  if (val === null || typeof val === 'undefined') {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}

function map(arr, iterator, cb) {
  var i = 0;
  var res = new Array(arr.length);
  each(arr, function(ele, next) {
    iterator(ele, function(err, val) {
      if (err) {
        next(err);
        return err;
      }
      res[i++] = val;
      next();
    });
  }, function(err) {
    if (err) {
      cb(err);
      return;
    }
    cb(null, res);
  });
}

/**
 * Exposes `GithubContent`
 */

module.exports = GithubContent;
