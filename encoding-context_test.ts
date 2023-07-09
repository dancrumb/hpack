import { EncodingContext } from "./encoding-context.ts";

const processHeader = (context: EncodingContext) => (header: string) => {
  const [headerName, value] = header.split(": ");
  console.log(
    `${headerName}: ${value} => ${
      Array.from(context.encodeHeader(
        headerName,
        value,
        {
          huffman: true,
        },
      )).map((n) => n.toString(16)).join(":")
    }`,
  );
};

const rqContext = new EncodingContext();
[":method: GET", ":scheme: http", ":path: /", ":authority: www.example.com"]
  .forEach(processHeader(rqContext));

[
  ":method: GET",
  ":scheme: http",
  ":path: /",
  ":authority: www.example.com",
  "cache-control: no-cache",
]
  .forEach(processHeader(rqContext));

[
  ":method: GET",
  ":scheme: https",
  ":path: /index.html",
  ":authority: www.example.com",
  "custom-key: custom-value",
]
  .forEach(processHeader(rqContext));

const rsContext = new EncodingContext();
rsContext.setMaxTableSize(256);
[
  ":status: 302",
  "cache-control: private",
  "date: Mon, 21 Oct 2013 20:13:21 GMT",
  "location: https://www.example.com",
].forEach(processHeader(rsContext));

console.log(rsContext.dynamicTable);
console.log(rsContext.dynamicTableSize);

[
  ":status: 307",
  "cache-control: private",
  "date: Mon, 21 Oct 2013 20:13:21 GMT",
  "location: https://www.example.com",
].forEach(processHeader(rsContext));

console.log(rsContext.dynamicTable);
console.log(rsContext.dynamicTableSize);

[
  ":status: 200",
  "cache-control: private",
  "date: Mon, 21 Oct 2013 20:13:22 GMT",
  "location: https://www.example.com",
  "content-encoding: gzip",
  "set-cookie: foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1",
].forEach(processHeader(rsContext));

console.log(rsContext.dynamicTable);
console.log(rsContext.dynamicTableSize);
