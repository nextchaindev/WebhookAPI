"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../../util");
exports.event = {
    name: 'UPDATE_BOARD_DESC',
    async onEvent(data) {
        const _ = data.locale;
        const title = !data.oldData.desc ? 'webhooks.add_board_desc' : !data.board.desc ? 'webhooks.rem_board_desc' : 'webhooks.edit_board_desc';
        return data.send({
            default: {
                title: _(title, {
                    member: data.invoker.webhookSafeName,
                    board: (0, util_1.cutoffText)(data.board.name, 50)
                }),
                description: '',
                fields: [
                    {
                        name: '*' + _('trello.old_desc') + '*',
                        value: data.oldData.desc ? (0, util_1.cutoffText)(data.oldData.desc, 1024) : '',
                        inline: true
                    },
                    {
                        name: '*' + _('trello.new_desc') + '*',
                        value: data.board.desc ? (0, util_1.cutoffText)(data.board.desc, 1024) : '',
                        inline: true
                    }
                ].filter((v) => !!v.value)
            },
            small: {
                description: _(title, {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    board: (0, util_1.cutoffText)(data.board.name, 50)
                }),
                fields: [
                    {
                        name: '*' + _('trello.old_desc') + '*',
                        value: data.oldData.desc ? (0, util_1.cutoffText)(data.oldData.desc, 1024) : '',
                        inline: true
                    },
                    {
                        name: '*' + _('trello.new_desc') + '*',
                        value: data.board.desc ? (0, util_1.cutoffText)(data.board.desc, 1024) : '',
                        inline: true
                    }
                ].filter((v) => !!v.value)
            }
        });
    }
};
//# sourceMappingURL=description.js.map