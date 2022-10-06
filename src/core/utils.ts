import { APIInteractionGuildMember } from 'discord-api-types/v10';
import {
    GuildMember,
    MessageActionRow,
    MessageButton,
    GuildMemberRoleManager
} from 'discord.js';

export const timeAfterSecs = (seconds: number) => { return Date.now() + seconds * 1000; };

export const cloneObj = async (obj: object) => { return JSON.parse(JSON.stringify(obj)); };

export const getRandomInt = (max: number) => { return Math.floor(Math.random() * (max + 1)); };

export const sleep = (sec) => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

export async function factorial(num: number) {
    let counter = 1;
    for (let i = 2; i <= num; i++) counter *= i;
    return counter;
}

export async function binomialCoefficient(m: number, n: number) {
    if (m <= n) return 1;
    const numerator = await factorial(m);
    const denominator = (await factorial(n)) * (await factorial(m - n));
    return numerator / denominator;
}

export async function getSubsetsWithCertainLength(arr: Array<any>, length: number) {
    let modify = [...arr].map(item => [item]);

    if (length === 1) return [arr];

    for (let i = 0; i < length - 1; i++) {
        const new_arr = [];

        for (let j = 0; j < [...modify].length; j++) {
            const item = [...modify][j];

            if (item.length === length) return;
            const index = arr.indexOf(item[item.length - 1]);
            const m_after = [...arr].slice(index + 1, arr.length + 1 - (length - i - 1));

            for (let k = 0; k < m_after.length; k++) {
                const it = m_after[k];

                const temp = [...item];
                temp.push(it);
                new_arr.push(temp);
            }
        }
        if (i < length - 1) modify = [...new_arr];
        if (i === length - 2) return new_arr;
    }
}

export function shuffle(array: Array<any>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function arrayEquals(arr1: Array<any>, arr2: Array<any>) {
    if (arr1.length != arr2.length) return false;

    for (let i = 0; i < arr2.length; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!(arrayEquals(arr1[i], arr2[i]))) return false;
        } else if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

export async function asyncForEach(array, callback) {
    for (let i = 0; i < array.length; i++) {
        await callback(array[i], i, array);
    }
}

export const discord = {
    compAdder(arr: any[][]) {
        const rows = [];
        arr.forEach((ele) => {
            rows.push(
                new MessageActionRow().addComponents(...ele)
            )
        });
        return rows;
    },

    async getDisabledButton(button: MessageButton) {
        const new_button = new MessageButton(button);
        new_button.setDisabled(true);
        return new_button;
    },

    getRelativeTimestamp(t: number) {
        return `<t:${Math.trunc(t / 1000)}:R>`;
    },

    memberHasRole(member: GuildMember | APIInteractionGuildMember, target_roles: string[]): boolean {
        const roles = member?.roles;
        if (!roles) return false;
        
        if (roles instanceof Array<string>) {
            roles.forEach(role => {
                if (target_roles.includes(role)) return true;
            });
        } else if (roles instanceof GuildMemberRoleManager) {
            if (roles.cache.some(role => target_roles.includes(role.name))) return true;
        }
        return false;
    }
}

export const localizeDatetime = () => { return new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }); }
