export class GroupQueries {
    async groupsWithIntegrants(): Promise<string> {
        return `SELECT gi.group_id, gi.integrant_id FROM [ycrwrusj_botwats].[group] as g
                LEFT JOIN group_integrant as gi ON g.id = gi.group_id
                LEFT JOIN integrant as i ON i.id = gi.integrant_id`;
    }
}