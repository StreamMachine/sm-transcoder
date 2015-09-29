var OutputLength, Transcode, WorkerTask, debug, net,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

net = require("net");

debug = require('debug')('sm-transcoder:worker');

Transcode = require("./transcode");

OutputLength = (function(_super) {
  __extends(OutputLength, _super);

  function OutputLength() {
    this._length = 0;
    OutputLength.__super__.constructor.call(this);
  }

  OutputLength.prototype._transform = function(chunk, encoding, cb) {
    this._length += chunk.length;
    this.push(chunk);
    return cb();
  };

  return OutputLength;

})(require("stream").Transform);

module.exports = WorkerTask = (function() {
  function WorkerTask(args, cb) {
    var l, sock, t;
    t = new Transcode(args.uri, args.opts);
    l = new OutputLength();
    sock = net.connect(args.sock, (function(_this) {
      return function(err) {
        if (err) {
          return cb(err);
        }
        t.pipe(l).pipe(sock);
        return t.once("end", function() {
          return cb(null, {
            length: l._length
          });
        });
      };
    })(this));
  }

  return WorkerTask;

})();

process.on("message", function(args) {
  debug("Incoming transcoder worker job.");
  return new WorkerTask(args, function(err, obj) {
    debug("Sending transcoder job results back.");
    return process.send({
      err: err,
      obj: obj
    });
  });
});

//# sourceMappingURL=worker.js.map
