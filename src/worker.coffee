net = require "net"

debug = require('debug')('sm-transcoder:worker')

Transcode = require "./transcode"

class OutputLength extends require("stream").Transform
    constructor: ->
        @_length = 0
        super()

    _transform: (chunk,encoding,cb) ->
        @_length += chunk.length
        @push chunk
        cb()

module.exports = class WorkerTask
    constructor: (args,cb) ->
        t = new Transcode args.uri, args.opts

        l = new OutputLength()

        sock = net.connect args.sock, (err) =>
            return cb err if err
            t.pipe(l).pipe(sock)

            t.once "end", =>
                cb null, length:l._length

process.on "message", (args) ->
    debug "Incoming transcoder worker job."
    new WorkerTask args, (err,obj) ->
        debug "Sending transcoder job results back."
        process.send err:err, obj:obj
