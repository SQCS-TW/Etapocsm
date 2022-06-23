import { MessageEmbed } from 'discord.js';

export type QnsThread = {
    easy: number[],
    medium: number[],
    hard: number[]
}

export class QnsThreadBeautifier {
    private diffi_to_emoji = {
        'easy': '🟩',
        'medium': '🟧',
        'hard': '🟥'
    };
    private ban_line = '════';
    private diffi_to_cn = {
        'easy': '簡單',
        'medium': '普通',
        'hard': '困難'
    };

    async beautify(thread: QnsThread): Promise<MessageEmbed> {
        let previous_comp = true;
        const diffi_list = ['easy', 'medium', 'hard'];

        const basic_embed = new MessageEmbed()
            .setTitle('你的闖關狀態')
            .setColor('#ffffff');

        for (let i = 0; i < diffi_list.length; i++) {
            const diffi = diffi_list[i];

            const embed_title = `${this.ban_line} ${this.diffi_to_emoji[diffi]} ${this.diffi_to_cn[diffi]} ${this.ban_line}`;
            let embed_content: string;

            const thread_len = thread[diffi].length;
            if (thread_len > 0 && previous_comp) {
                previous_comp = false;
                embed_content = `剩餘 ${thread_len} 題`;
            } else if (thread_len > 0 || !previous_comp) {
                embed_content = '🔒';
            } else {
                previous_comp = true;
                embed_content = '✅';
            }
            basic_embed.addField(embed_title, embed_content + '\n\u200b');
        }
        return basic_embed;
    }
}

export async function getQnsThreadData(qns_thread: QnsThread) {
    const diffi_list = ['easy', 'medium', 'hard'];

    let curr_diffi: string;
    let curr_qns_number: number;
    for (let i = 0; i < diffi_list.length; i++) {
        const diffi = diffi_list[i];
        if (qns_thread[diffi].length === 0) continue;

        curr_diffi = diffi;
        curr_qns_number = qns_thread[diffi][0];
        break;
    }
    if (curr_diffi === undefined) return {
        finished: true
    };

    return {
        finished: false,
        curr_diffi: curr_diffi,
        curr_qns_number: curr_qns_number
    };
}