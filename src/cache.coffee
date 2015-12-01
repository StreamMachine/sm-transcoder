LRU = require "lru-cache"
Transcode = require "./transcode"
WorkerPool = require "./worker_pool"
debug = require("debug")("sm-transcoder:cache")

class Output extends require("stream").Readable
    constructor: (encoding) ->
        super()
        @_pos           = 0
        @_buf           = encoding.buffer
        @content_type   = encoding.content_type
        @length         = encoding.buffer.length

    _read: (size) ->
        loop
            epos = @_pos + size
            epos = @length if epos > @length

            res = @push @_buf.slice(@_pos,epos)

            @_pos = epos

            if res && @_pos < @length
                # loop again
            else
                @push null if @_pos == @length
                break

#----------

module.exports = class Cache
    constructor: (opts) ->
        @cache = LRU max:100

        # set up/get our worker pool
        @pool = WorkerPool.shared()

    #----------

    fetch: (uri,sko,cb) ->
        cache_key = @key uri, sko
        debug "Key is #{cache_key}"

        if enc = @cache.get(cache_key)
            @_buildOutput enc, cb
        else
            @pool.encode uri, sko, (err,enc) =>
                if err
                    cb err
                    return

                # cache the result
                @cache.set cache_key, enc

                @_buildOutput enc, cb

    #----------

    _buildOutput: (encoding, cb) ->
        output = new Output encoding
        cb null, output

    #----------

    key: (uri, sko) ->
        opts = sko.opts.slice().sort()
        return [uri,opts...].join("|")

    #----------


