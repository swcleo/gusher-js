function padLeft(input: string | number, totalWidth: number): string {
  const str = input.toString();
  return str.length >= totalWidth ? str : padLeft(`0${str}`, totalWidth);
}

export default function time() {
  let now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hour = padLeft(now.getHours(), 2);
  const minute = padLeft(now.getMinutes(), 2);
  const second = padLeft(now.getSeconds(), 2);
  const millisecond = now.getMilliseconds();

  return `${year}-${month}-${date} ${hour}:${minute}:${second}:${millisecond}`;
}