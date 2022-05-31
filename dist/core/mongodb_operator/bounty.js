"use strict";
// import { getDefaultBountyAccount } from '../../constants/reglist';
// import { BaseOperator, OperatorResponse } from './base';
// class BountyAccountOperator extends BaseOperator {
//     constructor() {
//         super('Bounty', 'Accounts');
//         this.createDefaultDataFunction = getDefaultBountyAccount;
//     }
//     public async setStatus(user_id: string, status: boolean): Promise<OperatorResponse> {
//         const check_result = await this.checkUserDataExistence({ user_id: user_id });
//         if (check_result.status === "M002") return check_result;
//         const execute = {
//             $set: {
//                 active: status
//             }
//         };
//         const update_result = await (await this.cursor_promise).updateOne({ user_id: user_id }, execute);
//         if (!update_result.acknowledged) return {
//             status: "M003",
//             message: ':x: 寫入錯誤'
//         };
//         return {
//             status: "nM003",
//             message: ':white_check_mark: 寫入成功'
//         };
//     }
//     public async isUserAnsweringQns(user_id: string): Promise<OperatorResponse> {
//         const check_result = await this.checkUserDataExistence({ user_id: user_id });
//         if (check_result.status === "M002") return check_result;
//         const member_data = await (await this.cursor_promise).findOne({ user_id: user_id });
//         if (member_data.active) return {
//             status: true
//         };
//         return {
//             status: false
//         };
//     }
// }
// export {
//     BountyAccountOperator
// };
