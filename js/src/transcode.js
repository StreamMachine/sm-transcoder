var FFmpeg, Fetch, Transcode, debug,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FFmpeg = require("fluent-ffmpeg");

Fetch = require("./fetch");

debug = require("debug")("sm-transcoder:transcode");

module.exports = Transcode = (function(_super) {
  __extends(Transcode, _super);

  function Transcode(uri, sko) {
    this.uri = uri;
    this.sko = sko;
    Transcode.__super__.constructor.call(this);
    this.source = new Fetch(this.uri);
    debug("Calling ffmpeg with " + (this.sko.opts.join(' ')));
    this.ffmpeg = new FFmpeg({
      source: this.source,
      captureStderr: false
    }).addOptions(this.sko.opts);
    this.ffmpeg.on("start", (function(_this) {
      return function(cmd) {
        return console.error("ffmpeg started with " + cmd);
      };
    })(this));
    this.ffmpeg.on("error", (function(_this) {
      return function(err) {
        if (err.code === "ENOENT") {
          console.error("ffmpeg failed to start.");
          throw "ffmpeg start error";
        } else {
          console.error("ffmpeg transcoding error: " + err);
          throw "encoding error";
        }
      };
    })(this));
    this.ffmpeg.writeToStream(this);
  }

  return Transcode;

})(require("stream").PassThrough);

//# sourceMappingURL=transcode.js.map
