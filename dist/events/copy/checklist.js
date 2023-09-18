"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const util_1 = require("../../util");
exports.event = {
    name: 'COPY_CHECKLIST',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.copy_checklist', {
                    member: data.invoker.webhookSafeName,
                    sourceChecklist: (0, util_1.cutoffText)(data.sourceChecklist.name, 50),
                    checklist: (0, util_1.cutoffText)(data.checklist.name, 50)
                }),
                description: data.embedDescription(['card', 'list', 'checklist'])
            },
            small: {
                description: _('webhooks.copy_checklist', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    sourceChecklist: (0, util_1.cutoffText)(data.sourceChecklist.name, 25),
                    checklist: (0, util_1.cutoffText)(data.checklist.name, 25)
                })
            }
        });
    }
};
//# sourceMappingURL=checklist.js.map