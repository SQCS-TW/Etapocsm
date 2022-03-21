import { BaseOperator, OperatorResponse } from './base';
import { getDefaultInterAppli } from '../../constants/reglist';

class InteractionPipelineOperator extends BaseOperator {
    constructor() {
        super('Interaction', 'Pipeline');
        
    }

    public async checkUserApplicationExistence(user_id: string, type: string): Promise<OperatorResponse> {
        const appli_data = await (await this.cursor_promise).findOne({ user_id: user_id, type: type });
        if (appli_data) return {
            status: true
        };
        return {
            status: false
        };
    }

    public async createApplication(user_id: string, type: string, due_after_seconds: number) {
        const appli_data = await getDefaultInterAppli(user_id, type, due_after_seconds);

        const result = await (await this.cursor_promise).insertOne(appli_data);
        return {
            status: result.acknowledged
        };
    }
}

export {
    InteractionPipelineOperator
};
