const TelegramBot = require("node-telegram-bot-api");
const { tokens, hwids, users } = require("../db/schema");
const { randomUUID } = require("crypto");
const db = require("./database/config");
const { eq, desc } = require("drizzle-orm");

const CHANNEL_ID = -1001798144633;
const TOKEN = "8284437855:AAEKWedvc7470HJTskYX8lN0liwZ8IIhMG8";
const CHANNEL_URL = "https://t.me/decryptvpn";

const bot = new TelegramBot(TOKEN, { polling: true });

const userLocks = new Map();

const sendMessageRestrict = (msg) => {
  return bot.sendMessage(msg.chat.id, `🔑 To generate a *key*, you must **join our channel** first!\n\n👇 Tap the button below to enter and try again.`, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Join Channel", url: CHANNEL_URL }]
      ]
    }
  });
}

async function getUser(userId, username) {

  const userAlreadyExists = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .get();
    
  if (userAlreadyExists) {
    return userAlreadyExists;
  }
  
  const user = await db.insert(users).values({
    id: userId,
    username
  }).returning().get();
  
  return user;
}

async function canCreateToken(userId) {

  const lastToken = await db.select()
    .from(tokens)
    .where(eq(tokens.user, userId))
    .orderBy(desc(tokens.createdAt))
    .limit(1)
    .get();
    
  if (!lastToken) return true;
  
  const now = new Date();
  const expiresAt = new Date(lastToken.expiresAt);
  
  return now > expiresAt;
}

async function createKey(userId, maxHwids = 1, expiresAt) {

  const uuid = randomUUID();
  const TIME = 2 * 60 * 60 * 1000;
  const expirationDate = expiresAt || new Date(Date.now() + TIME);
  
  const token = await db.insert(tokens).values({
    id: uuid,
    maxHwids,
    user: userId,
    expiresAt: expirationDate
  }).returning().get();
  
  return token;
}

const getKeyCommand = async (msg) => {

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  
  if (userLocks.has(userId)) {
    return bot.sendMessage(chatId, `⏳ Please wait, your previous request is being processed.`, {
      parse_mode: "Markdown"
    });
  }
  
  try {
  
    userLocks.set(userId, true);
  
    const allowedStatus = ["member", "administrator", "creator"];
    const chatMember = await bot.getChatMember(CHANNEL_ID, userId);
    
    if (chatMember.status && !allowedStatus.includes(chatMember.status)) {
      return sendMessageRestrict(msg);
    }
    
    const user = await getUser(userId, username);
    
    const userCanCreateToken = await canCreateToken(user.id);
    
    if (!userCanCreateToken) {
      return bot.sendMessage(chatId, `⚠️ *You still have an active token. Please wait for it to expire before generating a new one.*`, {
        parse_mode: "Markdown"
      });
    }
    
    const token = await createKey(user.id);
    
    let text = ``;
    text += `🚀 *Key generated!*`;
    text += `\n\n📵 *Devices*: ${token.maxHwids}`;
    text += `\n📅 *Expire*: 2 hours`;
    text += `\n🔑 *Key*: \`${token.id}\``;
    
    return bot.sendMessage(chatId, text, {
      parse_mode: "Markdown"
    });
    
  } catch (err) {
    
    if (err.code == "ETELEGRAM" && err.message.includes("PARTICIPANT_ID_INVALID")) {
      return sendMessageRestrict(msg);
    }
    
    console.log(err)
    console.log("error");
  } finally {
    userLocks.delete(userId);
  }
}

bot.on('message', async (msg) => {
  if (msg.chat.type != "private") {
    return;
  }
  if (msg.text && msg.text == "/getkey") {
    return await getKeyCommand(msg);
  }
});

console.log({ bot: "Running" });

module.exports = bot;