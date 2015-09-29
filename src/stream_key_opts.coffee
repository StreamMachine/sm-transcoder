
module.exports = class StreamKeyOpts
    constructor: (@stream_key,cb) ->
        @content_type = null

        parts = @stream_key.split("-")

        @opts = []

        # first part is format
        switch parts[0]
            when "mp3"
                # -c:a libmp3lame|-b:a 64k|-f:a adts|-ac 1
                @content_type = "audio/mp3"

                @opts.push "-f mp3"
                @opts.push "-c:a libmp3lame"

                # parts[1] is sample rate
                @opts.push "-ar #{parts[1]}"

                # parts[2] is bitrate
                @opts.push "-b:a #{parts[2]}k"

                # parts[3] is channels
                channels = switch parts[3]
                    when "s" then 2
                    when "m" then 1

                if !channels
                    return cb "Invalid mp3 channel spec"

                @opts.push "-ac #{channels}"

            when "aac"
                # -c:a libfdk_aac|-b:a 192k|-f:a adts
                @content_type = "audio/aac"

                @opts.push "-f aac"
                @opts.push "-c:a libfdk_aac"

                # parts[1] is sample rate
                @opts.push "-ar #{parts[1]}"

                # parts[2] is profile

                # parts[3] is channels

            else
                return cb "Invalid stream key."

        cb null, @