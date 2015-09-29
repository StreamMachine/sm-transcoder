FFmpeg = require "fluent-ffmpeg"

Fetch = require "./fetch"

debug = require("debug")("sm-transcoder:transcode")

module.exports = class Transcode extends require("stream").PassThrough
    constructor: (@uri,@sko) ->
        super()

        # -- fetch our source file -- #

        @source = new Fetch @uri

        debug "Calling ffmpeg with #{ @sko.opts.join(' ') }"
        @ffmpeg = new FFmpeg( source:@source, captureStderr:false ).addOptions @sko.opts

        @ffmpeg.on "start", (cmd) =>
            console.error "ffmpeg started with #{ cmd }"

        @ffmpeg.on "error", (err) =>
            if err.code == "ENOENT"
                console.error "ffmpeg failed to start."
                throw "ffmpeg start error"
            else
                console.error "ffmpeg transcoding error: #{ err }"
                throw "encoding error"

        @ffmpeg.writeToStream @

    #----------
