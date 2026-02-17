// functions to format html

const replace_newlines = (string) => {
    if (!string) {
        return;
    }

    return string.replace(/\r\n/g, "<br>");
};

module.exports.replace_newlines = replace_newlines;
