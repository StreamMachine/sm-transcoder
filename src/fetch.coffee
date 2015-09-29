request = require "request"
debug = require("debug")("sm-transcoder:fetch")

module.exports = class Fetch extends require("stream").Transform
    constructor: (@uri) ->
        super()

        @_bytes = 0
        @fetch()

        @once "end", =>
            debug "Fetch finished after #{@_bytes}"

    #----------

    fetch: ->
        request.get(@uri)
            .on "error", (err) =>
                debug "request error: #{err}"
                @emit "error", err
            .pipe(@)

    #----------

    _transform: (chunk,encoding,cb) ->
        @_bytes += chunk.length
        @push chunk
        cb()