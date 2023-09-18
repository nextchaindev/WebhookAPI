"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
exports.event = {
    name: 'MAKE_ADMIN_OF_BOARD',
    async onEvent(data) {
        const _ = data.locale;
        return data.send({
            default: {
                title: _('webhooks.board_to_admin', {
                    member: data.invoker.webhookSafeName,
                    member2: data.member.webhookSafeName
                }),
                description: data.embedDescription(['member'])
            },
            small: {
                description: _('webhooks.board_to_admin', {
                    member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username}?utm_source=tacobot.app)`,
                    member2: `[${data.member.webhookSafeName}](https://trello.com/${data.member.username}?utm_source=tacobot.app)`
                })
            }
        });
    }
};
//# sourceMappingURL=toAdmin.js.map