express = require "express"

WorkerPool = require "./worker_pool"
Cache = require "./cache"
StreamKeyOpts = require "./stream_key_opts"

debug = require("debug")("sm-transcoder:runner")

module.exports = class Transcoder
    constructor: (@config) ->
        # set up/get our worker pool
        @pool = WorkerPool.shared()

        # set up our cache
        @cache = new Cache()

        # set up our server
        @server = express()

        @server.get "/", (req,res) =>

        @server.get "/encoding", (req,res) =>
            # uri and key are required
            debug "URI: #{ req.query["uri"] }"
            debug "Key: #{ req.query["key"] }"

            # valid stream key?
            new StreamKeyOpts req.query["key"], (err,sko) =>
                if err
                    res.status(400).end err
                    return

                @cache.fetch req.query["uri"], sko, (err,output) =>
                    if err
                        res.status(500).end err
                        return

                    res.writeHead 200,
                        "Content-type":     output.content_type
                        "Content-length":   output.length

                    output.pipe(res)

        @server.listen 3333


t = new Transcoder()