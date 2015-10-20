express = require "express"

WorkerPool = require "./worker_pool"
Cache = require "./cache"
StreamKeyOpts = require "./stream_key_opts"

debug = require("debug")("sm-transcoder:runner")

module.exports = class Transcoder
    constructor: (@config) ->
        @count = 0

        # set up/get our worker pool
        @pool = WorkerPool.shared()

        # set up our cache
        @cache = new Cache()

        # set up our server
        @server = express()

        @server.get "/", (req,res) =>

        @server.get "/encoding", (req,res) =>
            count = @count++

            pdebug = (msg,args...) ->
                debug "#{count}: #{msg}", args...

            # uri and key are required
            pdebug "URI: #{ req.query["uri"] }"
            pdebug "Key: #{ req.query["key"] }"

            # valid stream key?
            new StreamKeyOpts req.query["key"], (err,sko) =>
                if err
                    pdebug "Invalid stream key."
                    res.status(400).end err
                    return

                @cache.fetch req.query["uri"], sko, (err,output) =>
                    if err
                        pdebug "Error fetching creative: #{err}"
                        res.status(500).end err
                        return

                    res.writeHead 200,
                        "Content-type":     output.content_type
                        "Content-length":   output.length

                    pdebug "Output length will be #{output.length}"

                    output.pipe(res)

                    output.once "finish", ->
                        pdebug "Pipe completed."

                    res.once "close", ->
                        pdebug "Socket closed."

        s = @server.listen @config.port
        debug "Transcoder listening on port #{s.address().port}"

t = new Transcoder(require("yargs")
    .usage("Usage: $0 --port 3333")
    .describe
        port:   "Port"
    .demand(['port'])
    .help('h')
    .alias('h','help')
    .default
        port:   0
    .argv
)