function getScore(val) {
    return parseInt(val || "0");
}
console.log("undefined string:", getScore("undefined"));
console.log("NaN string:", getScore("NaN"));
console.log("null string:", getScore("null"));
