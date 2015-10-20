var WorkerCluster, WorkerPool, debug, fs, net, os, path, shared_pool, temp,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WorkerCluster = (function(_super) {
  __extends(WorkerCluster, _super);

  function WorkerCluster() {
    return WorkerCluster.__super__.constructor.apply(this, arguments);
  }

  return WorkerCluster;

})(require("compute-cluster"));

debug = require("debug")("sm-transcoder:worker_pool");

os = require("os");

path = require("path");

net = require("net");

temp = require("temp");

fs = require("fs");

shared_pool = null;

module.exports = WorkerPool = (function() {
  WorkerPool.shared = function() {
    return shared_pool || (shared_pool = new WorkerPool());
  };

  function WorkerPool() {
    var js, p, worker, _i, _len, _ref;
    worker = null;
    _ref = ["worker.js", "worker_js.js"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      js = _ref[_i];
      p = path.join(__dirname, js);
      try {
        fs.statSync(p);
        worker = p;
        break;
      } catch (_error) {

      }
    }
    this.cluster = new WorkerCluster({
      module: worker,
      max_processes: os.cpus().length - 1 || 1,
      max_backlog: -1
    });
    this.cluster.on("error", (function(_this) {
      return function(err) {
        return debug("WorkerCluster error: " + err);
      };
    })(this));
  }

  WorkerPool.prototype.encode = function(uri, sko, cb) {
    var sock, spath;
    spath = temp.path({
      suffix: ".sock"
    });
    debug("Asking for encoded response over " + spath);
    sock = net.createServer();
    return sock.listen(spath, (function(_this) {
      return function() {
        var bufs;
        bufs = [];
        sock.once("connection", function(c) {
          c.on("readable", function() {
            var b, _results;
            _results = [];
            while (b = c.read()) {
              _results.push(bufs.push(b));
            }
            return _results;
          });
          return c.once("end", function() {
            return debug("Encoding stream ended.");
          });
        });
        return _this.cluster.enqueue({
          uri: uri,
          opts: sko,
          sock: spath
        }, function(err, obj) {
          var buf;
          if (err) {
            cb(err);
            return;
          }
          buf = Buffer.concat(bufs, obj.length);
          return cb(null, {
            buffer: buf,
            content_type: sko.content_type,
            length: obj.length
          });
        });
      };
    })(this));
  };

  return WorkerPool;

})();

//# sourceMappingURL=worker_pool.js.map
