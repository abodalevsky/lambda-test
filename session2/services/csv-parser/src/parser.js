/**
 * The function parses CSV file into array of items
 * first line is assumed as caption and ignored
 * @param {String} content of CSV file
 * @returns Array of String (items)
 */
const parseContent = content => {
    if (!content) {
        return [];
    }

    const arr = content.split(/\r?\n/);
    arr.shift();
    return arr
        .map(i => toJson(i))
        .filter(i => i);
};

export default {
    parse: parseContent
};

/**
 * makes from 1 line of content JSON object
 */
const toJson = it => {
    const tokens = it.split(';');
    if (Array.isArray(tokens) && tokens.length > 1) {
        return `{"done": ${tokens[0].toLowerCase() === "true"}, "message": "${tokens[1]}"}`;
    } else {
        return null;
    }
};