var Cache, StreamKeyOpts, Transcoder, WorkerPool, debug, express, t;

express = require("express");

WorkerPool = require("./worker_pool");

Cache = require("./cache");

StreamKeyOpts = require("./stream_key_opts");

debug = require("debug")("sm-transcoder:runner");

module.exports = Transcoder = (function() {
  function Transcoder(config) {
    this.config = config;
    this.pool = WorkerPool.shared();
    this.cache = new Cache();
    this.server = express();
    this.server.get("/", (function(_this) {
      return function(req, res) {};
    })(this));
    this.server.get("/encoding", (function(_this) {
      return function(req, res) {
        debug("URI: " + req.query["uri"]);
        debug("Key: " + req.query["key"]);
        return new StreamKeyOpts(req.query["key"], function(err, sko) {
          if (err) {
            res.status(400).end(err);
            return;
          }
          return _this.cache.fetch(req.query["uri"], sko, function(err, output) {
            if (err) {
              res.status(500).end(err);
              return;
            }
            res.writeHead(200, {
              "Content-type": output.content_type,
              "Content-length": output.length
            });
            return output.pipe(res);
          });
        });
      };
    })(this));
    this.server.listen(3333);
  }

  return Transcoder;

})();

t = new Transcoder();

//# sourceMappingURL=runner.js.map
