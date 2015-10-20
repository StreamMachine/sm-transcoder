var Cache, StreamKeyOpts, Transcoder, WorkerPool, debug, express, t,
  __slice = [].slice;

express = require("express");

WorkerPool = require("./worker_pool");

Cache = require("./cache");

StreamKeyOpts = require("./stream_key_opts");

debug = require("debug")("sm-transcoder:runner");

module.exports = Transcoder = (function() {
  function Transcoder(config) {
    var s;
    this.config = config;
    this.count = 0;
    this.pool = WorkerPool.shared();
    this.cache = new Cache();
    this.server = express();
    this.server.get("/", (function(_this) {
      return function(req, res) {};
    })(this));
    this.server.get("/encoding", (function(_this) {
      return function(req, res) {
        var count, pdebug;
        count = _this.count++;
        pdebug = function() {
          var args, msg;
          msg = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return debug.apply(null, ["" + count + ": " + msg].concat(__slice.call(args)));
        };
        pdebug("URI: " + req.query["uri"]);
        pdebug("Key: " + req.query["key"]);
        return new StreamKeyOpts(req.query["key"], function(err, sko) {
          if (err) {
            pdebug("Invalid stream key.");
            res.status(400).end(err);
            return;
          }
          return _this.cache.fetch(req.query["uri"], sko, function(err, output) {
            if (err) {
              pdebug("Error fetching creative: " + err);
              res.status(500).end(err);
              return;
            }
            res.writeHead(200, {
              "Content-type": output.content_type,
              "Content-length": output.length
            });
            pdebug("Output length will be " + output.length);
            output.pipe(res);
            output.once("finish", function() {
              return pdebug("Pipe completed.");
            });
            return res.once("close", function() {
              return pdebug("Socket closed.");
            });
          });
        });
      };
    })(this));
    s = this.server.listen(this.config.port);
    debug("Transcoder listening on port " + (s.address().port));
  }

  return Transcoder;

})();

t = new Transcoder(require("yargs").usage("Usage: $0 --port 3333").describe({
  port: "Port"
}).demand(['port']).help('h').alias('h', 'help')["default"]({
  port: 0
}).argv);

//# sourceMappingURL=runner.js.map
