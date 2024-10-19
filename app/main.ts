// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"

type TBencondedValue = string | number | Array<TBencondedValue>

function decodeBencode(bencodedValue: string): [TBencondedValue, number] {
   const isString = (val: string): boolean => {
       return !isNaN(parseInt(val.split(":")[0]))
   }

   const isInt = (val: string): boolean => {
       return val[0] === "i"
   }

   const isList = (val: string): boolean => val[0] === "l";

    // IF is string
    if (isString(bencodedValue)) {
        const length = parseInt(bencodedValue.split(":")[0]);
        const firstColonIndex = bencodedValue.indexOf(":");
        if (firstColonIndex === -1) {
            throw new Error("Invalid encoded value");
        }

        return [bencodedValue.substring(firstColonIndex + 1, firstColonIndex + 1 + length), firstColonIndex + 1 +  length];
    }

    // IF is number
    if (isInt(bencodedValue)) {
        const endIndex = bencodedValue.indexOf("e");
        if (endIndex === -1) {
            throw new Error("Invalid encoded value");
        }

        return [parseInt(bencodedValue.substring(1, endIndex)), endIndex + 1];
    }

    // IF is list
    if (isList(bencodedValue)) {
        const endIndex = bencodedValue.indexOf("e");
        if (endIndex === -1) {
            throw new Error("Invalid encoded value");
        }
        const decodedList: TBencondedValue[] = [];
        let offset = 1;
        while(offset < bencodedValue.length) {
            if(bencodedValue[offset] === "e") {
                break;
            }

            const [decodedValue, encodedLength] = decodeBencode(bencodedValue.substring(offset));
            decodedList.push(decodedValue);
            offset += encodedLength;
        }

        return [decodedList, offset + 1];
    }

    throw new Error("Only strings are supported at the moment");
}

const args = process.argv;
const bencodedValue = args[3];

if (args[2] === "decode") {
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    // Uncomment this block to pass the first stage
    try {
        const [decoded, decodedLength] = decodeBencode(bencodedValue);
        console.log(JSON.stringify(decoded));
    } catch (error: Error | any) {
        console.error(error.message);
    }
}
