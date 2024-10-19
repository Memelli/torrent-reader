import * as console from "node:console";
import * as fs from "node:fs";
import {dictEncoder, intEncoder, stringEncoder} from "./encoders.ts";
import {dictDecoder, intDecoder, listDecoder, stringDecoder} from "./decoders.ts";
import {convertToHash} from "./convert-to-hash.ts";
import * as console from "node:console";

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

    // return `
    //     Info Hash: ${infoHexString}\r\n
    //     Tracker URL: ${decodedDictionary["announce"]}}\r\n
    //     Length: ${infoDict["length"]}\r\n
    //     Piece Length: ${infoDict["pieceLength"]}\r\n
    //     Piece Hashes: ${infoDict["pieces"]}\r\n
    //     `

    return {
        trackerUrl: decodedDictionary.announce,
        infoHash: infoHexString,
        length: decodedDictionary.info.length,
        pieceLength: decodedDictionary.info["piece length"],
        pieceHashes: decodedDictionary.info.pieces
    }
}

function getHashes(v: string) {
    const result: string[] = [];
    for(let pos = 0; pos < v.length; pos += 20) {
        result.push(Buffer.from(v.slice(pos, pos + 20), "binary").toString())
    }

    return result;
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
        console.log(`Piece length: ${info.pieceLength}`)
        console.log(`Piece Hashes:`);
        const pieces = info.pieceHashes.toString() as string;

        let s = 0;

        while (s < pieces.length) {

            console.log(pieces.substring(s, s + 40));

            s += 40;

        }
        // const hashes = getHashes(info.pieceHashes);
        // hashes.forEach((h) => console.log(h));

    } catch (error: Error | any) {
        console.error(error.message);
    }
}
