# sm-transcoder

PoC on-the-fly transcoding audio server for StreamMachine prerolls.

Currently just hardcoded to port 3333.

Run with:

`DEBUG=sm-transcoder:* node ./index.js`

Then hit:

`curl http://localhost:3333/encoding?uri=<URI>&key=<KEY>`

URI is the audio creative to grab for transcoding.

KEY specifies the output encoding. Currently just mp3 is supported. See the [stream key generation in sm-parsers](https://github.com/StreamMachine/sm-parsers/blob/5c5f5df032918f813b8fa4bb94f2f08aa7a5f3aa/src/mp3.coffee#L391) for more context.

The last 100 transcoded outputs are currently cached in memory for faster repeat deliveries.
