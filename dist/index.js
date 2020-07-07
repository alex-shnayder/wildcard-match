"use strict";
function escapeRegExpString(str) {
    return str.replace(/[-^$+.()|[\]{}]/g, '\\$&');
}
function trimRight(str, substr) {
    if (str.substr(-substr.length) === substr) {
        return str.substr(0, str.length - substr.length);
    }
    return str;
}
function buildPatternWithSeparators(pattern, separator) {
    let segments = pattern.split(separator);
    return segments.reduce((result, segment, i) => {
        if (segment === '**') {
            if (i === 0) {
                return `(.*${separator})?`;
            }
            else if (i === segments.length - 1) {
                return `${trimRight(result, separator)}(${separator}.*)?`;
            }
            return `${trimRight(result, separator)}(${separator}.*)?${separator}`;
        }
        // The order of these replacements is important because the latter contains a ?
        segment = segment
            .replace(/(?<!\\)\?/g, `(?!${separator}).`)
            .replace(/(?<!\\)\*/g, `(((?!${separator}).)*|)`);
        if (i < segments.length - 1) {
            return `${result}${segment}${separator}`;
        }
        return `${result}${segment}`;
    }, '');
}
function buildRegExpPattern(pattern, separator) {
    if (Array.isArray(pattern)) {
        let regExpPatterns = pattern.map((p) => `^${buildRegExpPattern(p, separator)}$`);
        return `(${regExpPatterns.join('|')})`;
    }
    if (pattern === '**') {
        return '^.*$';
    }
    let regExpPattern;
    if (!separator) {
        regExpPattern = escapeRegExpString(pattern)
            .replace(/(?<!\\)\?/g, '.')
            .replace(/(?<!\\)\*/g, '.*');
    }
    else if (pattern === '*') {
        regExpPattern = `((?!${escapeRegExpString(separator)}).)*`;
    }
    else {
        regExpPattern = buildPatternWithSeparators(escapeRegExpString(pattern), escapeRegExpString(separator));
    }
    return `^${regExpPattern}$`;
}
function wildcardMatch(pattern, separator) {
    let options = typeof separator === 'object' ? separator : { separator };
    let regexpPattern = buildRegExpPattern(pattern, options.separator);
    let regExp = new RegExp(regexpPattern);
    regExp.pattern = pattern;
    regExp.options = options;
    return regExp;
}
// Support both CommonJS and ES6-like modules.
// Could be `wildcardMatch.default = wildcardMatch`, but TypeScript has a bug:
// https://github.com/microsoft/TypeScript/issues/32470
// eslint-disable-next-line dot-notation
wildcardMatch['default'] = wildcardMatch;
module.exports = wildcardMatch;
//# sourceMappingURL=index.js.map