"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncForEach = exports.isItemInArray = exports.verifyMenuApplication = exports.arrayEquals = exports.shuffle = exports.getSubsetsWithCertainLength = exports.binomialCoefficient = exports.factorial = exports.getRandomInt = exports.cloneObj = exports.timeAfterSecs = void 0;
const reglist_1 = require("../db/reglist");
const timeAfterSecs = (seconds) => __awaiter(void 0, void 0, void 0, function* () { return Date.now() + seconds * 1000; });
exports.timeAfterSecs = timeAfterSecs;
const cloneObj = (obj) => __awaiter(void 0, void 0, void 0, function* () { return JSON.parse(JSON.stringify(obj)); });
exports.cloneObj = cloneObj;
const getRandomInt = (max) => __awaiter(void 0, void 0, void 0, function* () { return Math.floor(Math.random() * (max + 1)); });
exports.getRandomInt = getRandomInt;
function factorial(num) {
    return __awaiter(this, void 0, void 0, function* () {
        let counter = 1;
        for (let i = 2; i <= num; i++)
            counter = counter * i;
        return counter;
    });
}
exports.factorial = factorial;
function binomialCoefficient(m, n) {
    return __awaiter(this, void 0, void 0, function* () {
        if (m <= n)
            return 1;
        const numerator = yield factorial(m);
        const denominator = (yield factorial(n)) * (yield factorial(m - n));
        return numerator / denominator;
    });
}
exports.binomialCoefficient = binomialCoefficient;
function getSubsetsWithCertainLength(arr, length) {
    return __awaiter(this, void 0, void 0, function* () {
        let modify = [...arr].map(item => [item]);
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
    });
}
exports.getSubsetsWithCertainLength = getSubsetsWithCertainLength;
function shuffle(array) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    });
}
exports.shuffle = shuffle;
function arrayEquals(arr1, arr2) {
    return __awaiter(this, void 0, void 0, function* () {
        if (arr1.length != arr2.length)
            return false;
        for (let i = 0; i < arr2.length; i++) {
            if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                if (!(yield arrayEquals(arr1[i], arr2[i])))
                    return false;
            }
            else if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    });
}
exports.arrayEquals = arrayEquals;
function verifyMenuApplication(verify) {
    return __awaiter(this, void 0, void 0, function* () {
        const cursor = yield (new reglist_1.Mongo('Interaction')).getCur('Pipeline');
        const user_application = cursor.findOne(verify);
        if (user_application) {
            yield cursor.deleteOne(verify);
            return true;
        }
        else {
            return false;
        }
    });
}
exports.verifyMenuApplication = verifyMenuApplication;
function isItemInArray(item, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        if (arr.indexOf(item) !== -1) {
            return true;
        }
        else
            return false;
    });
}
exports.isItemInArray = isItemInArray;
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < array.length; i++) {
            yield callback(array[i], i, array);
        }
    });
}
exports.asyncForEach = asyncForEach;
