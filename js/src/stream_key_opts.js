var StreamKeyOpts;

module.exports = StreamKeyOpts = (function() {
  function StreamKeyOpts(stream_key, cb) {
    var channels, parts;
    this.stream_key = stream_key;
    this.content_type = null;
    parts = this.stream_key.split("-");
    this.opts = [];
    switch (parts[0]) {
      case "mp3":
        this.content_type = "audio/mp3";
        this.opts.push("-f mp3");
        this.opts.push("-c:a libmp3lame");
        this.opts.push("-ar " + parts[1]);
        this.opts.push("-b:a " + parts[2] + "k");
        channels = (function() {
          switch (parts[3]) {
            case "s":
              return 2;
            case "m":
              return 1;
          }
        })();
        if (!channels) {
          return cb("Invalid mp3 channel spec");
        }
        this.opts.push("-ac " + channels);
        break;
      case "aac":
        this.content_type = "audio/aac";
        this.opts.push("-f aac");
        this.opts.push("-c:a libfdk_aac");
        this.opts.push("-ar " + parts[1]);
        break;
      default:
        return cb("Invalid stream key.");
    }
    cb(null, this);
  }

  return StreamKeyOpts;

})();

//# sourceMappingURL=stream_key_opts.js.map
