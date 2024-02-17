export class IntegrantQueries {
    async GetIntegrantsByGroupId(group_id: number): Promise<string> {
        return `SELECT id FROM integrant 
        LEFT JOIN group_integrant ON integrant.id = group_integrant.integrant_id
        WHERE group_integrant.group_id = ${group_id}`;
    }
}