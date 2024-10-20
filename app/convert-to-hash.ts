import * as crypto from "node:crypto";
const convertToHash = (str: string): string => {
    const buffer = Buffer.from(str, 'binary');

    const hash = crypto.createHash("sha1");
    hash.update(buffer);
    return hash.digest('hex');
}

export { convertToHash };
