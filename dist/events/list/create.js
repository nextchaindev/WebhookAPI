"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'CREATE_LIST',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.create_list', {
                    member: data.invoker.webhookSafeName,
                    list: (0, util_1.cutoffText)(data.list.name, 50)
                }),
                description: data.embedDescription(['list'])
            },
            small: {
                description: _('webhooks.create_list', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    list: (0, util_1.cutoffText)(data.list.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=create.js.map