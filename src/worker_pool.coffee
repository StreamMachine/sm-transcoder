
class WorkerCluster extends require("compute-cluster")

debug = require("debug")("sm-transcoder:worker_pool")
os = require "os"
path = require "path"
net = require "net"
temp = require "temp"
fs = require "fs"

shared_pool = null

module.exports = class WorkerPool
    @shared: ->
        shared_pool ||= new WorkerPool()

    constructor: () ->
        worker = null
        for js in ["worker.js","worker_js.js"]
            p = path.join(__dirname,js)
            try
                fs.statSync(p)
                worker = p
                break
            catch
                # no match...

        @cluster = new WorkerCluster
            module:         worker
            max_processes:  ( os.cpus().length - 1 || 1 )
            max_backlog:    -1

        @cluster.on "error", (err) =>
            debug "WorkerCluster error: #{err}"

    #----------

    encode: (uri,sko,cb) ->
        # create a socket for response
        spath = temp.path suffix:".sock"
        debug "Asking for encoded response over #{spath}"
        sock = net.createServer()
        sock.listen spath, =>
            bufs    = []

            sock.once "connection", (c) =>
                c.on "readable", =>
                    bufs.push b while b = c.read()

                c.once "end", =>
                    debug "Encoding stream ended."

            @cluster.enqueue uri:uri,opts:sko, sock:spath, (err,obj) =>
                if err
                    cb err
                    return

                # finalize bufs
                buf = Buffer.concat(bufs,obj.length)

                cb null, buffer:buf, content_type:sko.content_type, length:obj.length
