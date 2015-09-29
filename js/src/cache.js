var Cache, LRU, Output, Transcode, WorkerPool, debug,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

LRU = require("lru-cache");

Transcode = require("./transcode");

WorkerPool = require("./worker_pool");

debug = require("debug")("sm-transcoder:cache");

Output = (function(_super) {
  __extends(Output, _super);

  function Output(encoding) {
    Output.__super__.constructor.call(this);
    this._pos = 0;
    this._buf = encoding.buffer;
    this.content_type = encoding.content_type;
    this.length = encoding.buffer.length;
  }

  Output.prototype._read = function(size) {
    var epos, res, _results;
    _results = [];
    while (true) {
      epos = this._pos + size;
      if (epos > this.length) {
        epos = this.length;
      }
      res = this.push(this._buf.slice(this._pos, epos));
      this._pos = epos;
      if (res && this._pos < this.length) {

      } else {
        break;
      }
    }
    return _results;
  };

  return Output;

})(require("stream").Readable);

module.exports = Cache = (function() {
  function Cache(opts) {
    this.cache = LRU({
      max: 100
    });
    this.pool = WorkerPool.shared();
  }

  Cache.prototype.fetch = function(uri, sko, cb) {
    var cache_key, enc;
    cache_key = this.key(uri, sko);
    debug("Key is " + cache_key);
    if (enc = this.cache.get(cache_key)) {
      return this._buildOutput(enc, cb);
    } else {
      return this.pool.encode(uri, sko, (function(_this) {
        return function(err, enc) {
          if (err) {
            cb(err);
            return;
          }
          _this.cache.set(cache_key, enc);
          return _this._buildOutput(enc, cb);
        };
      })(this));
    }
  };

  Cache.prototype._buildOutput = function(encoding, cb) {
    var output;
    output = new Output(encoding);
    return cb(null, output);
  };

  Cache.prototype.key = function(uri, sko) {
    var opts;
    opts = sko.opts.slice().sort();
    return [uri].concat(__slice.call(opts)).join("|");
  };

  return Cache;

})();

//# sourceMappingURL=cache.js.map
