"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'MOVE_LIST_FROM_BOARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.move_out_list', {
                    member: data.invoker.webhookSafeName,
                    list: (0, util_1.cutoffText)(data.list.name, 50)
                }),
                description: data.embedDescription(['list']) + `\n**${_('trello.to_board')}:** \`${data.targetBoard.id}\``
            },
            small: {
                description: _('webhooks.move_out_list', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    list: (0, util_1.cutoffText)(data.list.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=listOut.js.map