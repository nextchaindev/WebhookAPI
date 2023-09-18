"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../../util");
exports.event = {
    name: 'UPDATE_BOARD_NAME',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.board_rename', {
                    member: data.invoker.webhookSafeName,
                    board: (0, util_1.cutoffText)(data.board.name, 50),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 50)
                }),
                description: ''
            },
            small: {
                description: _('webhooks.board_rename', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    board: (0, util_1.cutoffText)(data.board.name, 50),
                    oldName: (0, util_1.cutoffText)(data.oldData.name, 50)
                })
            }
        });
    }
};
//# sourceMappingURL=name.js.map