const { sql, eq, and, count } = require("drizzle-orm");
const { tokens, hwids } = require("../../db/schema");
const db = require("../database/config");
const crypto = require("../utils/crypto.js");

const secret = "HttpCustom-@DecrypyVPN-@LightXVD";

class Login {

  static set(data) {
    return crypto.encrypt(JSON.stringify(data));
    //return JSON.stringify(data)
  }
  
  static success() {
  
      const now = Math.round(new Date().getTime() / 1000);
      const secretToken = crypto.md5(`${secret}-Authenticated`);
      
      const response = {
        status: 200,
        message: "User Authenticated",
        secret: secretToken,
        timestamp: Math.round(new Date().getTime() / 1000),
        expiry: now + 7200
      }
      
      return Login.set(response);
  }

  static async handle(req, res, next) {
    try {
    
      const hToken = req.headers.token;
      if (!hToken) {
        return res.send(Login.set({ status: 400, message: "Request Invalid 1" }));
      }
      
      const content = crypto.decrypt(hToken);
      if (!content) {
        return res.send(Login.set({ status: 400, message: "Request Invalid 2" }));
      }
      
      const data = JSON.parse(content);
      const now = Math.round(new Date().getTime() / 1000);
      
      if ((now - data.timestamp) >= 60) {
        return res.send(Login.set({ status: 400, message: "Request Invalid 3" }));
      }
      
      const secretHash = crypto.md5(`${data.token}-${data.hwid}-${secret}`);
      
      if (data.secret != secretHash) {
        return res.send(Login.set({ status: 400, message: "Request Invalid 4" }));
      }
      
      const token = await db.select().from(tokens).where(eq(tokens.id, data.token)).get();
      
      if (!token) {
        return res.send(Login.set({ status: 400, message: "Token Invalid" }));
      }
      
      if (new Date() > new Date(token.expiresAt)) {
        return res.send(Login.set({ status: 400, message: "Token Expired" }));
      }
      
      const totalHwids = (await db.select({ count: count() })
        .from(hwids).where(eq(hwids.tokenId, data.token)).get()).count;
      
      if (token.maxHwids > totalHwids) {
        await db.insert(hwids).values({
          id: data.hwid,
          tokenId: data.token,
        })
        .onConflictDoUpdate({
          target: hwids.id,
          set: { tokenId: sql`excluded.token_id` }
        });
      }
      
      const tokenHwid = await db.select().from(hwids)
        .where(and(eq(hwids.tokenId, data.token),
        eq(hwids.id, data.hwid))).get();
      
      if (!tokenHwid) {
        return res.send(Login.set({ status: 400, message: "Device Not Authorized" }));
      }
      
      return res.send(Login.success());
    } catch (err) {
      console.log(err)
      return res.send(Login.set({ status: 400, message: "Internal Server Error" }));
    }
  }
}

module.exports = Login;