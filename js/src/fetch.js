var Fetch, debug, request,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

request = require("request");

debug = require("debug")("sm-transcoder:fetch");

module.exports = Fetch = (function(_super) {
  __extends(Fetch, _super);

  function Fetch(uri) {
    this.uri = uri;
    Fetch.__super__.constructor.call(this);
    this._bytes = 0;
    this.fetch();
    this.once("end", (function(_this) {
      return function() {
        return debug("Fetch finished after " + _this._bytes);
      };
    })(this));
  }

  Fetch.prototype.fetch = function() {
    return request.get(this.uri).on("error", (function(_this) {
      return function(err) {
        debug("request error: " + err);
        return _this.emit("error", err);
      };
    })(this)).pipe(this);
  };

  Fetch.prototype._transform = function(chunk, encoding, cb) {
    this._bytes += chunk.length;
    this.push(chunk);
    return cb();
  };

  return Fetch;

})(require("stream").Transform);

//# sourceMappingURL=fetch.js.map
