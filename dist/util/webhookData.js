'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.COMPACT_EMOJIS = exports.DEFAULT_COLORS = exports.batches = void 0;
const tslib_1 = require('tslib');
const node_1 = require('@sentry/node');
const lodash_1 = tslib_1.__importDefault(require('lodash'));
const axios_1 = tslib_1.__importDefault(require('axios'));
const cache_1 = require('../cache');
const influx_1 = require('../db/influx');
const postgres_1 = require('../db/postgres');
const redis_1 = require('../db/redis');
const logger_1 = require('../logger');
const _1 = require('.');
const batcher_1 = tslib_1.__importDefault(require('./batcher'));
const locale = tslib_1.__importStar(require('./locale'));
exports.batches = new Map();
async function createTemporaryBatcher(id, data, options) {
  if (redis_1.available) {
    const count = await redis_1.client.publish(`batch_handoff:${id}`, JSON.stringify(data));
    if (count > 0) {
      logger_1.logger.log(`Batch ${id} passed off to ${count} clients.`);
      return;
    }
  }
  if (exports.batches.has(id)) return exports.batches.get(id).add(data);
  const batcher = new batcher_1.default(options);
  exports.batches.set(id, batcher);
  batcher.on('batch', async (arr) => {
    exports.batches.delete(id);
    if (redis_1.available) {
      redis_1.batchHandoffs.delete(id);
      await redis_1.subClient.unsubscribe(`batch_handoff:${id}`);
    }
    return options.onBatch(arr);
  });
  batcher.add(data);
  if (redis_1.available) {
    redis_1.batchHandoffs.set(id, batcher);
    await redis_1.subClient.subscribe(`batch_handoff:${id}`);
  }
}
class WebhookData {
  constructor(request, webhook, filterFlag) {
    this.request = request;
    this.webhook = webhook;
    this.filterFlag = filterFlag;
    this.locale = locale.toModule(this.webhook.locale);
  }
  isChildAction() {
    return (
      this.action.type.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toUpperCase() !==
      this.filterFlag
    );
  }
  get body() {
    return this.request.body;
  }
  get model() {
    return this.body.model;
  }
  get action() {
    return this.body.action;
  }
  get invoker() {
    const member = this.action.memberCreator;
    const name = this.action.display?.entities?.memberCreator?.text ?? member.fullName;
    return {
      avatar: member.avatarUrl ? member.avatarUrl + '/170.png' : null,
      webhookSafeName: !(0, _1.isEmpty)(name) ? (0, _1.cutoffText)(name, 50) : member.username,
      titleSafeName: !(0, _1.isEmpty)(name) ? (0, _1.cutoffText)(name, 256) : member.username,
      ...member
    };
  }
  get oldData() {
    return this.action.data.old;
  }
  get board() {
    return this.action.data.board;
  }
  get targetBoard() {
    return this.action.data.boardTarget;
  }
  get sourceBoard() {
    return this.action.data.boardSource;
  }
  get label() {
    return this.action.data.label;
  }
  get attachment() {
    return this.action.data.attachment;
  }
  get member() {
    const member = this.action.member;
    const name = this.action.display?.entities?.member?.text ?? member?.fullName;
    return member
      ? {
          avatar: member.avatarUrl ? member.avatarUrl + '/170.png' : null,
          webhookSafeName: !(0, _1.isEmpty)(name) ? (0, _1.cutoffText)(name, 50) : member.username,
          ...member
        }
      : member;
  }
  get card() {
    return this.action.data.card;
  }
  get sourceCard() {
    return this.action.data.cardSource;
  }
  get list() {
    return this.action.data.list;
  }
  get listBefore() {
    return this.action.data.listBefore;
  }
  get listAfter() {
    return this.action.data.listAfter;
  }
  get checklist() {
    return this.action.data.checklist;
  }
  get sourceChecklist() {
    return this.action.data.checklistSource;
  }
  get checklistItem() {
    return this.action.data.checkItem;
  }
  get customField() {
    return this.action.data.customField;
  }
  get customFieldItem() {
    return this.action.data.customFieldItem;
  }
  embedDescription(fields = null) {
    const _ = this.locale;
    const lines = {
      invoker: `**${_('words.member.one')}:** [${
        this.invoker.fullName
          ? `${(0, _1.cutoffText)(this.invoker.fullName, 50)} (${this.invoker.username})`
          : this.invoker.username
      }](https://trello.com/${this.invoker.username}?utm_source=tacobot.app)`,
      member: this.member
        ? `**${_('words.member.one')}:** [${
            this.member.fullName
              ? `${(0, _1.cutoffText)(this.member.fullName, 50)} (${this.member.username})`
              : this.member.username
          }](https://trello.com/${this.member.username}?utm_source=tacobot.app)`
        : '',
      card:
        this.card && this.card.name
          ? `**${_('words.card.one')}:** [${(0, _1.cutoffText)(
              (0, _1.escapeMarkdown)(this.card.name),
              50
            )}](https://trello.com/c/${this.card.shortLink}?utm_source=tacobot.app)`
          : '',
      list:
        this.list && this.list.name
          ? `**${_('words.list.one')}:** ${(0, _1.cutoffText)((0, _1.escapeMarkdown)(this.list.name), 50)}`
          : '',
      listBefore: this.listBefore
        ? `**${_('trello.prev_list')}:** ${(0, _1.cutoffText)(
            (0, _1.escapeMarkdown)(this.listBefore.name),
            50
          )}`
        : '',
      listAfter: this.listAfter
        ? `**${_('trello.curr_list')}:** ${(0, _1.cutoffText)(
            (0, _1.escapeMarkdown)(this.listAfter.name),
            50
          )}`
        : '',
      checklist:
        this.checklist && this.checklist.name
          ? `**${_('words.checklist.one')}:** ${(0, _1.cutoffText)(
              (0, _1.escapeMarkdown)(this.checklist.name),
              50
            )}`
          : '',
      checklistItem:
        this.checklistItem && this.checklistItem.name
          ? `**${_('words.checklist_item.one')}:** ${(0, _1.cutoffText)(
              (0, _1.escapeMarkdown)(this.checklistItem.name),
              50
            )}`
          : '',
      customField:
        this.customField && this.customField.type
          ? `**${_('trello.custom_field')} (${_(`custom_field_types.${this.customField.type}`)}):** ${(0,
            _1.cutoffText)((0, _1.escapeMarkdown)(this.customField.name), 50)}`
          : '',
      label:
        this.label && this.label.name
          ? `**${_('words.label.one')}${
              this.label.color ? ` (${_(`trello.label_color.${this.label.color}`)})` : ''
            }:** ${(0, _1.cutoffText)((0, _1.escapeMarkdown)(this.label.name), 50)}`
          : '',
      attachment:
        this.attachment && this.attachment.name
          ? `**${_('words.attachment.one')}:** ${
              this.attachment.url
                ? `[${(0, _1.cutoffText)((0, _1.escapeMarkdown)(this.attachment.name), 50)}](${
                    this.attachment.url
                  })`
                : (0, _1.cutoffText)((0, _1.escapeMarkdown)(this.attachment.name), 50)
            }`
          : ''
    };
    if (!fields) fields = Object.keys(lines);
    return fields
      .map((f) => lines[f])
      .filter((v) => !!v)
      .join('\n');
  }
  async send(embedStyles) {
    if (this.card && (this.list || this.listAfter))
      cache_1.cardListMapCache.set(this.card.id, [Date.now(), this.list ? this.list.id : this.listAfter.id]);
    const EMBED_DEFAULTS = {
      default: {
        color: this.isChildAction()
          ? exports.DEFAULT_COLORS.CHILD
          : exports.DEFAULT_COLORS[this.filterFlag.split('_')[0]],
        author: {
          icon_url: process.env.TRELLO_ICON_URL,
          name: 'Trello: ' + (0, _1.cutoffText)(this.model.name, 248),
          url: `${this.model.url}?utm_source=tacobot.app`
        },
        description: embedStyles.default.description || this.embedDescription(),
        ...(this.invoker.avatar
          ? {
              thumbnail: { url: this.invoker.avatar }
            }
          : {}),
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'nextchain.kr'
        }
      },
      small: {
        color: this.isChildAction()
          ? exports.DEFAULT_COLORS.CHILD
          : exports.DEFAULT_COLORS[this.filterFlag.split('_')[0]],
        author: {
          ...(this.invoker.avatar
            ? {
                icon_url: this.invoker.avatar
              }
            : {}),
          name: this.invoker.titleSafeName,
          url: `${this.model.url}?utm_source=tacobot.app`
        },
        url: `${this.model.url}?utm_source=tacobot.app`,
        title: (0, _1.cutoffText)(this.model.name, 256),
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'nextchain.kr'
        }
      },
      compact: {
        color: 3092790,
        author: {
          icon_url: process.env.TRELLO_ICON_URL,
          name: 'Trello: ' + (0, _1.cutoffText)(this.model.name, 248),
          url: this.model.url
        },
        timestamp: this.action.date,
        footer: {
          icon_url: 'https://tacobot.app/logo_happy.png',
          text: 'nextchain.kr'
        }
      }
    };
    if (this.webhook.style === 'compact') {
      const batchKey = `compact:${this.model.id}:${this.webhook.webhookID}`;
      const compactLine = `\`${
        this.isChildAction()
          ? exports.COMPACT_EMOJIS.CHILD
          : exports.COMPACT_EMOJIS[this.filterFlag.split('_')[0]]
      }\` ${embedStyles.small.description}`;
      createTemporaryBatcher(batchKey, compactLine, {
        maxTime: 2000,
        maxSize: 10,
        onBatch: (lines) => {
          createTemporaryBatcher(
            this.webhook.webhookID,
            lodash_1.default.defaultsDeep({ description: lines.join('\n') }, EMBED_DEFAULTS.compact),
            {
              maxTime: 1000,
              maxSize: 10,
              onBatch: (embeds) => {
                (0, influx_1.onWebhookSend)(this.webhook.webhookID);
                logger_1.logger.info(
                  'Posting webhook %s (guild=%s, time=%d)',
                  this.webhook.webhookID,
                  this.webhook.guildID,
                  Date.now()
                );
                return this._send(embeds);
              }
            }
          );
        }
      });
      return;
    }
    return createTemporaryBatcher(
      this.webhook.webhookID,
      lodash_1.default.defaultsDeep(embedStyles[this.webhook.style], EMBED_DEFAULTS[this.webhook.style]),
      {
        maxTime: 1000,
        maxSize: 10,
        onBatch: (embeds) => {
          (0, influx_1.onWebhookSend)(this.webhook.webhookID);
          logger_1.logger.info(
            'Posting webhook %s (guild=%s, time=%d)',
            this.webhook.webhookID,
            this.webhook.guildID,
            Date.now()
          );
          return this._send(embeds);
        }
      }
    );
  }
  requestAxios(method, url, body) {
    const BASE_DISCORD_URL = 'https://discord.com/api/v9';
    const headers = {
      'Content-Type': 'application/json'
    };
    try {
      return (0, axios_1.default)({
        method,
        url: `${BASE_DISCORD_URL}${url}`,
        data: body,
        headers
      });
    } catch (e) {
      logger_1.logger.error('Discord request failed', e);
    }
  }
  async _send(embeds, attempt = 5) {
    try {
      console.debug('Discord webhook', JSON.stringify(embeds));
      await (0, request_1.request)(
        'POST',
        `/webhooks/${this.webhook.webhookID}/${this.webhook.webhookToken}?thread_id=${this.webhook.threadID}`,
        {
          embeds
        }
      );
      logger_1.logger.info('Discord webhook response', response);
    } catch (e) {
      if (e.name.startsWith('DiscordRESTError')) {
        if (e.code === 10015) {
          logger_1.logger.warn(`Discord webhook lost @ ${this.webhook.webhookID}:${this.webhook.id}`, e);
          await postgres_1.Webhook.update(
            {
              webhookID: null,
              webhookToken: null
            },
            { where: { id: this.webhook.id } }
          );
        } else if (e.code === 50027) {
          logger_1.logger.warn(
            `Discord webhook token invalid, dropping @ ${this.webhook.webhookID}:${this.webhook.id}`,
            e
          );
          await postgres_1.Webhook.update(
            {
              webhookID: null,
              webhookToken: null
            },
            { where: { id: this.webhook.id } }
          );
        } else if (e.status === 400) {
          logger_1.logger.error(
            `Invalid form body, dropping @ ${this.webhook.webhookID}:${this.webhook.id} - ${this.filterFlag}`,
            e
          );
        } else {
          attempt++;
          if (attempt > 3) {
            logger_1.logger.error(
              `Discord Error ${e.code} (${e.status}), exceeded attempts, dropping @ ${this.webhook.webhookID}:${this.webhook.id}`,
              e
            );
          } else {
            logger_1.logger.warn(
              `Discord Error ${e.code} (${e.status}), retrying (${attempt}) @ ${this.webhook.webhookID}:${this.webhook.id}`
            );
            return this._send(embeds, attempt);
          }
        }
      } else if (e.name === 'DiscordHTTPError' && e.code >= 500) {
        attempt++;
        if (attempt < 3) {
          logger_1.logger.error(
            `Discord server error, exceeded attempts, dropping @ ${this.webhook.webhookID}:${this.webhook.id}`
          );
        } else {
          logger_1.logger.warn(
            `Discord server error, retrying (${attempt}) @ ${this.webhook.webhookID}:${this.webhook.id}`
          );
          return this._send(embeds, attempt);
        }
      } else if (e.message.startsWith('Request timed out (>15000ms)')) {
        attempt++;
        if (attempt < 3) {
          logger_1.logger.error(
            `Request timed out, exceeded attempts, dropping @ ${this.webhook.webhookID}:${this.webhook.id}`
          );
        } else {
          logger_1.logger.warn(
            `Request timed out, retrying (${attempt}) @ ${this.webhook.webhookID}:${this.webhook.id}`
          );
          return this._send(embeds, attempt);
        }
      } else {
        (0, node_1.captureException)(e, {
          tags: {
            webhook: this.webhook.id,
            discordWebhook: this.webhook.webhookID
          }
        });
        logger_1.logger.error(`Webhook execution failed @ ${this.webhook.webhookID}:${this.webhook.id}`, e);
      }
    }
  }
}
exports.default = WebhookData;
exports.DEFAULT_COLORS = {
  ADD: 0x2ecc71,
  CREATE: 0x16a085,
  UPDATE: 0xe67e22,
  CHILD: 0xf1c40f,
  UNCONFIRMED: 0xf1c40f,
  REMOVE: 0xe74c3c,
  DELETE: 0xc0392b,
  ENABLE: 0x95a5a6,
  DISABLE: 0x34495e,
  MAKE: 0x3498db,
  MEMBER: 0x3498db,
  VOTE: 0x2980b9,
  EMAIL: 0xecf0f1,
  COMMENT: 0xff9f43,
  CONVERT: 0x9b59b6,
  COPY: 0xf19066,
  MOVE: 0xb53471
};
exports.COMPACT_EMOJIS = {
  ADD: '🟢',
  CREATE: '🟩',
  UPDATE: '🟧',
  CHILD: '🟡',
  UNCONFIRMED: '🟠',
  REMOVE: '🔴',
  DELETE: '🟥',
  ENABLE: '✅',
  DISABLE: '❎',
  MAKE: '🟦',
  MEMBER: '🔵',
  VOTE: '🗳️',
  EMAIL: '📧',
  COMMENT: '💬',
  CONVERT: '📇',
  COPY: '📋',
  MOVE: '📦'
};
//# sourceMappingURL=webhookData.js.map
