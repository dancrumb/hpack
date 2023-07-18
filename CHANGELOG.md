## 1.0.1 (2023-07-17)

### Refactor

- tighten up some typing
- **encoders/decoders**: move encoders and decoders into their own directories

## 1.0.0 (2023-07-17)

### Feat

- **module**: create exports for HPACK module
- **HPackDecoderStream**: create HPackDecoderStream
- **DecodingContext**: add support for incomplete codes
- **DecodingContext**: implement DecodingContext
- **huffman_decoder**: add Huffman Decoder
- **literal_string_decoder**: add the literal string decoder
- **prefix-decoder**: add prefix decoder
- 🎸 implement hpack encoding

### Refactor

- **HPackEncoderStream**: remove extraneous test code
- add DecodeResult to decoder functions
