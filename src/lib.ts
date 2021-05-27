export function ab2str(buf: ArrayBuffer): string {
  return String.fromCharCode.apply(null, new Uint16Array(buf) as any);
}

export function str2ab(str: string): ArrayBuffer {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function b2ab(buf: Buffer): ArrayBuffer {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export function b2str(buf: Buffer): string {
  return ab2str(b2ab(buf));
}
