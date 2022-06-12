import { Constants, ApplicationCommandData } from 'discord.js';

export const ACCOUNT_MANAGER_SLCMD: ApplicationCommandData[] = [
    {
        name: 'create-main-bounty-account',
        description: '建立自己的懸賞區主帳號'
    },
    {
        name: 'check-main-bounty-account',
        description: '查看自己的懸賞區主帳號'
    },
    {
        name: 'check-bounty-ongoing-info',
        description: '查看自己懸賞區目前的闖關狀態'
    }
]
