"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndBountySessionManager = void 0;
const shortcut_1 = require("../../../shortcut");
const session = __importStar(require("../../../powerup_mngs/session_mng"));
const discord_js_1 = require("discord.js");
const components_1 = require("./components");
class EndBountySessionManager extends session.SessionManager {
    constructor(f_platform) {
        const session_config = {
            session_name: 'end-bounty-btn-cd',
            interval_data: {
                idle: 4,
                normal: 2,
                fast: 1
            }
        };
        super(f_platform, session_config);
        this.event.on('sessionExpired', async (session_data) => {
            await this.doAfterExpired(session_data);
        });
        this.f_platform.f_bot.on('ready', async () => {
            await this.setupCache();
        });
    }
    async setupCache() {
        const self_routine = (t) => setTimeout(async () => { await this.setupCache(); }, t * 1000);
        if (!this.cache.connected)
            return self_routine(1);
        let cache_data = await this.getData();
        if (!cache_data) {
            await this.writeData([]);
            cache_data = [];
        }
        const cached_user_id = [];
        if (cache_data.length !== 0) {
            for (let i = 0; i < cache_data.length; i++) {
                const user_acc = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: cache_data[i].id });
                if (!user_acc.status) {
                    cache_data.splice(i, 1);
                    continue;
                }
                cached_user_id.push(cache_data[i].id);
            }
        }
        const end_btn_data = await (await this.f_platform.end_button_op.cursor).find({}).toArray();
        for (let i = 0; i < end_btn_data.length; i++) {
            const data = end_btn_data[i];
            if (data.time.end > Date.now() + 150 * 1000)
                continue;
            if (cached_user_id.includes(data.user_id))
                continue;
            cache_data.push({
                id: data.user_id,
                expired_date: data.time.end
            });
            shortcut_1.core.logger.debug('cache pushed', {
                id: data.user_id,
                expired_date: data.time.end
            });
        }
        cache_data.sort((a, b) => a.expired_date - b.expired_date);
        await this.writeData(cache_data);
        return self_routine(10);
    }
    async doAfterExpired(session_data) {
        const acc_data = await (await this.f_platform.ongoing_op.cursor).findOne({ user_id: session_data.id });
        try {
            const channel = await this.f_platform.f_bot.channels.fetch(acc_data.dm_channel_id);
            if (!(channel instanceof discord_js_1.DMChannel))
                return;
            const new_button = await shortcut_1.core.discord.getDisabledButton(components_1.default_end_button);
            const msg = await channel.messages.fetch(acc_data.qns_msg_id);
            await msg.edit({
                content: '已超過可回答時間',
                files: [],
                components: shortcut_1.core.discord.compAdder([
                    [new_button]
                ])
            });
        }
        catch {
            shortcut_1.core.logger.error(`err deleting msg ${acc_data.qns_msg_id}`);
        }
        const status_execute = {
            $set: {
                status: false
            }
        };
        await (await this.f_platform.ongoing_op.cursor).updateOne({ user_id: session_data.id }, status_execute);
        await (await this.f_platform.end_button_op.cursor).deleteOne({ user_id: session_data.id });
    }
}
exports.EndBountySessionManager = EndBountySessionManager;
