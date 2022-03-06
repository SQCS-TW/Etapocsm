import { Mongo } from './db/mongodb';


const timeAfterSecs = async (seconds: number) => { return Date.now() + seconds * 1000; };

const cloneObj = async (obj: object) => { return JSON.parse(JSON.stringify(obj)); };

const getRandomInt = async (max: number) => { return Math.floor(Math.random() * max); };

async function factorial(num: number) {
    let counter = 1;
    for (let i = 2; i <= num; i++)
        counter = counter * i;
    return counter;
};

async function binomialCoefficient(m: number, n: number) {
    if (m <= n) return 1;
    let numerator = await factorial(m);
    let denominator = (await factorial(n)) * (await factorial(m - n));
    return numerator / denominator;
};

async function getAllSubsets(arr: Array<any>) {
    return arr.reduce((subsets, value) => subsets.concat(
        subsets.map(set => [value, ...set])
    ), [[]]);
};

async function shuffle(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
};

async function arrayEquals(arr1: Array<any>, arr2: Array<any>) {
    if (arr1.length != arr2.length) return false;

    for (let i = 0; i < arr2.length; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!(await arrayEquals(arr1[i], arr2[i]))) return false;
        } else if (arr1[i] != arr2[i]) {
            return false;
        };
    };
    return true;
};

interface VerifyMenuApplicationInterface {
    user_id: string
    type: string
};

async function verifyMenuApplication(verify: VerifyMenuApplicationInterface) {
    const cursor = await (new Mongo('Interaction')).getCur('Pipeline');
    const user_application: any = cursor.findOne(verify);

    if (user_application) {
        await cursor.deleteOne(verify);
        return true;
    } else {
        return false;
    };
}

export {
    cloneObj,
    timeAfterSecs,
    getRandomInt,
    verifyMenuApplication,
    factorial,
    getAllSubsets,
    shuffle,
    arrayEquals,
    binomialCoefficient
}