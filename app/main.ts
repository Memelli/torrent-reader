import * as console from "node:console";
import * as fs from "node:fs";
import {dictEncoder, intEncoder, stringEncoder} from "./encoders.ts";
import {dictDecoder, intDecoder, listDecoder, stringDecoder} from "./decoders.ts";
import {convertToHash} from "./convert-to-hash.ts";

export type TBencondedValue = string | number | Array<TBencondedValue> | { [key: string]: TBencondedValue }

export function decodeBencode(bencodedValue: string): [TBencondedValue, number] {
   const isString = (val: string): boolean => {
       return !isNaN(parseInt(val.split(":")[0]))
   }

   const isInt = (val: string): boolean => {
       return val[0] === "i"
   }

   const isList = (val: string): boolean => val[0] === "l";
   const isDictionary = (val: string): boolean => val[0] === "d";

    // IF is string
    if (isString(bencodedValue)) {
        return stringDecoder(bencodedValue);
    }

    // IF is number
    if (isInt(bencodedValue)) {
        return intDecoder(bencodedValue);
    }

    // IF is list
    if (isList(bencodedValue)) {
        return listDecoder(bencodedValue);
    }

    // IF is dictionary
    if (isDictionary(bencodedValue)) {
        return dictDecoder(bencodedValue);
    }

    throw new Error("Only strings are supported at the moment");
}

function encodeBencode(data: any): string {
    return dictEncoder(data);
}

type TorrenData = {
    trackerUrl: string,
    infoHash: string,
    length: number,
    pieceLength: number,
    pieceHashes: string
}
function getInfoFromTorrent(fileName: string): TorrenData {
    const bencodedValue = fs.readFileSync(fileName, {
        encoding: "binary",
        flag: "r"
    });

    const decodedDictionary = dictDecoder(bencodedValue)[0] as {
        announce: string,
        info: {
            length: number,
            name: string,
            "piece length": number,
            pieces: string
        }
    };

    const encodedInfoDict = encodeBencode(decodedDictionary.info);
    const infoHexString = convertToHash(encodedInfoDict);

       return {
        trackerUrl: decodedDictionary.announce,
        infoHash: infoHexString,
        length: decodedDictionary.info.length,
        pieceLength: decodedDictionary.info["piece length"],
        pieceHashes: decodedDictionary.info.pieces
    }
}

const args = process.argv;
const bencodedValue = args[3];

if (args[2] === "decode") {
    try {
        const [decoded, decodedLength] = decodeBencode(bencodedValue);
        console.log(JSON.stringify(decoded));
    } catch (error: Error | any) {
        console.error(error.message);
    }
}

if (args[2] === "info") {
    try {
        const info = getInfoFromTorrent(bencodedValue);
        console.log(`Tracker URL: ${info.trackerUrl}`)
        console.log(`Length: ${info.length}`)
        console.log(`Info Hash: ${info.infoHash}`)
        console.log(`Piece Length: ${info.pieceLength}`)
        console.log(`Piece Hashes:`);
        const pieceHashes = Buffer.from(info.pieceHashes, "binary");
        const pieceCount = pieceHashes.length / 20;
        for (let i = 0; i < pieceCount; i++) {
            const pieceHash = pieceHashes.slice(i * 20, (i + 1) * 20)
            console.log(`${pieceHash.toString('hex')}`)
        }

    } catch (error: Error | any) {
        console.error(error.message);
    }
}
