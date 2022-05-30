// import { BaseOperator, OperatorResponse, DefaultDataPayload } from './base';
// import { getDefaultInterAppli } from '../../constants/reglist';

// class InteractionPipelineOperator extends BaseOperator {
//     constructor() {
//         super('Interaction', 'Pipeline');
//         this.createDefaultDataFunction = getDefaultInterAppli;
//     }

//     public async checkUserApplicationExistence(user_id: string, type: string): Promise<OperatorResponse> {
//         const appli_data = await (await this.cursor_promise).findOne({ user_id: user_id, type: type });
//         if (appli_data) return {
//             status: true
//         };
//         return {
//             status: false
//         };
//     }
// }

// export {
//     InteractionPipelineOperator
// };
