"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localizeDatetime = exports.discord = exports.asyncForEach = exports.arrayEquals = exports.shuffle = exports.getSubsetsWithCertainLength = exports.binomialCoefficient = exports.factorial = exports.sleep = exports.getRandomInt = exports.cloneObj = exports.timeAfterSecs = void 0;
const discord_js_1 = require("discord.js");
const timeAfterSecs = (seconds) => { return Date.now() + seconds * 1000; };
exports.timeAfterSecs = timeAfterSecs;
const cloneObj = async (obj) => { return JSON.parse(JSON.stringify(obj)); };
exports.cloneObj = cloneObj;
const getRandomInt = (max) => { return Math.floor(Math.random() * (max + 1)); };
exports.getRandomInt = getRandomInt;
const sleep = (sec) => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
};
exports.sleep = sleep;
async function factorial(num) {
    let counter = 1;
    for (let i = 2; i <= num; i++)
        counter *= i;
    return counter;
}
exports.factorial = factorial;
async function binomialCoefficient(m, n) {
    if (m <= n)
        return 1;
    const numerator = await factorial(m);
    const denominator = (await factorial(n)) * (await factorial(m - n));
    return numerator / denominator;
}
exports.binomialCoefficient = binomialCoefficient;
async function getSubsetsWithCertainLength(arr, length) {
    let modify = [...arr].map(item => [item]);
    if (length === 1)
        return [arr];
    for (let i = 0; i < length - 1; i++) {
        const new_arr = [];
        for (let j = 0; j < [...modify].length; j++) {
            const item = [...modify][j];
            if (item.length === length)
                return;
            const index = arr.indexOf(item[item.length - 1]);
            const m_after = [...arr].slice(index + 1, arr.length + 1 - (length - i - 1));
            for (let k = 0; k < m_after.length; k++) {
                const it = m_after[k];
                const temp = [...item];
                temp.push(it);
                new_arr.push(temp);
            }
        }
        if (i < length - 1)
            modify = [...new_arr];
        if (i === length - 2)
            return new_arr;
    }
}
exports.getSubsetsWithCertainLength = getSubsetsWithCertainLength;
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
exports.shuffle = shuffle;
function arrayEquals(arr1, arr2) {
    if (arr1.length != arr2.length)
        return false;
    for (let i = 0; i < arr2.length; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!(arrayEquals(arr1[i], arr2[i])))
                return false;
        }
        else if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}
exports.arrayEquals = arrayEquals;
async function asyncForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    }
}
exports.asyncForEach = asyncForEach;
exports.discord = {
    compAdder(arr) {
        const rows = [];
        arr.forEach((ele) => {
            rows.push(new discord_js_1.MessageActionRow().addComponents(...ele));
        });
        return rows;
    },
    async getDisabledButton(button) {
        const new_button = new discord_js_1.MessageButton(button);
        new_button.setDisabled(true);
        return new_button;
    },
    getRelativeTimestamp(t) {
        return `<t:${Math.trunc(t / 1000)}:R>`;
    },
    memberHasRole(member, target_roles) {
        const roles = member?.roles;
        if (!roles)
            return false;
        if (roles instanceof (Array)) {
            roles.forEach(role => {
                if (target_roles.includes(role))
                    return true;
            });
        }
        else if (roles instanceof discord_js_1.GuildMemberRoleManager) {
            if (roles.cache.some(role => target_roles.includes(role.name)))
                return true;
        }
        return false;
    }
};
const localizeDatetime = () => { return new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }); };
exports.localizeDatetime = localizeDatetime;
