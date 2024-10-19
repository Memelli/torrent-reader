import type {TBencondedValue} from "./main.ts";

const stringEncoder = (value: string): string => {
    const length = value.length;
    return `${length}:${value}`;
}

const intEncoder = (value: number): string => {
    return `i${value}e`;
}

const dictEncoder = (dict: { [key: string]: TBencondedValue}): string => {
    let encodedDict = "";

    for (let item in dict) {
        const key = stringEncoder(item);

        if (typeof dict[item] === "number") {
            encodedDict += `${key}${intEncoder(Number(dict[item]))}`;
        } else if (typeof dict[item] === "string") {
            encodedDict += `${key}${stringEncoder(String(dict[item]))}`;
        } else if (Array.isArray(dict[item])) {
            encodedDict += `${key}${listEncoder(dict[item])}`;
        } else if (typeof dict[item] === "object" && dict[item] !== null && !Array.isArray(dict[item])) {
            encodedDict += `${key}${dictEncoder(dict[item] as { [key: string]: TBencondedValue })}`;
        }
    }

    return `d${encodedDict}e`;
}

const listEncoder = (list: any): string => {
    let encodedList = "";

    for(let item of list) {
        switch(true) {
            case typeof item === "string":
                encodedList += stringEncoder(item)
                break;
            case typeof item === "number":
                encodedList += intEncoder(item);
                break;
            case Array.isArray(item):
                encodedList += listEncoder(item);
                break;
            case typeof item === "object" && item !== null && !Array.isArray(item):
                encodedList += dictEncoder(item);
                break;
            default:
                throw new Error(`Unknown item '${item}'`);
        }
    }

    return `l${encodedList}e`;
}

export { stringEncoder, intEncoder, listEncoder, dictEncoder }