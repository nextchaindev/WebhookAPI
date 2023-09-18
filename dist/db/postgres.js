"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.disconnect = exports.connect = exports.Webhook = exports.client = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = tslib_1.__importStar(require("sequelize"));
exports.client = new sequelize_1.Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true }
});
class Webhook extends sequelize_1.Model {
}
exports.Webhook = Webhook;
Webhook.init({
    id: {
        type: sequelize_1.default.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    memberID: sequelize_1.default.STRING,
    modelID: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    trelloWebhookID: sequelize_1.default.STRING,
    filters: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        defaultValue: '0'
    },
    active: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    locale: {
        type: sequelize_1.default.STRING,
        allowNull: true,
        defaultValue: null
    },
    style: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        defaultValue: 'default'
    },
    guildID: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    webhookID: sequelize_1.default.STRING,
    webhookToken: sequelize_1.default.STRING,
    whitelist: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    lists: {
        type: sequelize_1.default.ARRAY(sequelize_1.default.STRING),
        allowNull: false,
        defaultValue: []
    },
    cards: {
        type: sequelize_1.default.ARRAY(sequelize_1.default.STRING),
        allowNull: false,
        defaultValue: []
    },
    threadID: {
        type: sequelize_1.default.STRING,
        allowNull: true,
        defaultValue: null
    }
}, { sequelize: exports.client, modelName: 'webhook' });
const connect = () => exports.client.authenticate();
exports.connect = connect;
const disconnect = () => exports.client.close();
exports.disconnect = disconnect;
async function getUser(id) {
    const user = (await exports.client.query({
        query: 'SELECT * FROM users WHERE "userID"=?',
        values: [id]
    }));
    console.debug('user: ', user);
    if (user[0][0])
        return user[0][0];
}
exports.getUser = getUser;
//# sourceMappingURL=postgres.js.map