import {decodeBencode, type TBencondedValue} from "./main.ts";

const stringDecoder = (value: string): [string, number] => {
    const length = parseInt(value.split(":")[0]);
    const firstColonIndex = value.indexOf(":");
    if (firstColonIndex === -1) {
        throw new Error("Invalid encoded value");
    }

    return [value.substring(firstColonIndex + 1, firstColonIndex + 1 + length), firstColonIndex + 1 +  length];
}

const intDecoder = (value: string): [number, number] => {
    const endIndex = value.indexOf("e");
    if (endIndex === -1) {
        throw new Error("Invalid encoded value");
    }

    return [parseInt(value.substring(1, endIndex)), endIndex + 1];
}

const listDecoder = (value: string): [Array<TBencondedValue>, number] => {
    const endIndex = value.indexOf("e");
    if (endIndex === -1) {
        throw new Error("Invalid encoded value");
    }
    const decodedList: TBencondedValue[] = [];
    let offset = 1;
    while(offset < value.length) {
        if(value[offset] === "e") {
            break;
        }

        const [decodedValue, encodedLength] = decodeBencode(value.substring(offset));
        decodedList.push(decodedValue);
        offset += encodedLength;
    }

    return [decodedList, offset + 1];
}

const dictDecoder = (value: string): [{ [key: string]: TBencondedValue}, number] => {
    const decodedDict: { [key: string]: TBencondedValue } = {};
    let offset = 1;
    while (offset < value.length) {
        if (value[offset] === "e") {
            break;
        }

        const [decodedKey, keyLength] = decodeBencode(value.substring(offset));
        offset += keyLength;
        const [decodedValue, valueLength] = decodeBencode(value.substring(offset));
        offset += valueLength;
        decodedDict[decodedKey as string] = decodedValue;
    }

    return [decodedDict, offset + 1];
}

export { stringDecoder, intDecoder, dictDecoder, listDecoder };