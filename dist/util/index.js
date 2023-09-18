"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = exports.formatTime = exports.escapeRegex = exports.cutoffText = exports.isEmpty = exports.iterateFolder = exports.wait = exports.IMAGE_ATTACHMENT_HOST = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
exports.IMAGE_ATTACHMENT_HOST = 'https://trello-attachments.s3.amazonaws.com/';
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.wait = wait;
async function iterateFolder(folderPath, callback, extension = '.js') {
    const files = await fs_1.promises.readdir(folderPath);
    await Promise.all(files.map(async (file) => {
        const filePath = path_1.default.join(folderPath, file);
        const stat = await fs_1.promises.lstat(filePath);
        if (stat.isSymbolicLink()) {
            const realPath = await fs_1.promises.readlink(filePath);
            if (stat.isFile() && file.endsWith(extension)) {
                await callback(realPath);
            }
            else if (stat.isDirectory()) {
                await iterateFolder(realPath, callback, extension);
            }
        }
        else if (stat.isFile() && file.endsWith(extension))
            await callback(filePath);
        else if (stat.isDirectory())
            await iterateFolder(filePath, callback, extension);
    }));
}
exports.iterateFolder = iterateFolder;
function isEmpty(text) {
    if (!text)
        return false;
    if (text.length === 1 && text.charCodeAt(0) === 8203)
        return true;
    return text.trim().length === 0;
}
exports.isEmpty = isEmpty;
function cutoffText(text, limit = 2000) {
    return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
}
exports.cutoffText = cutoffText;
function escapeRegex(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
exports.escapeRegex = escapeRegex;
function formatTime(dateString) {
    const timestamp = Math.round(new Date(dateString).valueOf() / 1000);
    return `<t:${timestamp}:F> *(<t:${timestamp}:R>)*`;
}
exports.formatTime = formatTime;
function escapeMarkdown(text) {
    function italic(text) {
        let i = 0;
        text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
            if (match === '**')
                return ++i % 2 ? `\\*${match}` : `${match}\\*`;
            return `\\*${match}`;
        });
        i = 0;
        return text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
            if (match === '__')
                return ++i % 2 ? `\\_${match}` : `${match}\\_`;
            return `\\_${match}`;
        });
    }
    function bold(text) {
        let i = 0;
        return text.replace(/\*\*(\*)?/g, (_, match) => {
            if (match)
                return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`;
            return '\\*\\*';
        });
    }
    function underline(text) {
        let i = 0;
        return text.replace(/__(_)?/g, (_, match) => {
            if (match)
                return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`;
            return '\\_\\_';
        });
    }
    text = text
        .replace(/(?<=^|[^`])`(?=[^`]|$)/g, '\\`')
        .replace(/```/g, '\\`\\`\\`');
    text = underline(bold(italic(text)));
    return text
        .replace(/~~/g, '\\~\\~')
        .replace(/\|\|/g, '\\|\\|');
}
exports.escapeMarkdown = escapeMarkdown;
//# sourceMappingURL=index.js.map