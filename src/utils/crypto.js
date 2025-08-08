const crypto = require("crypto");

class Crypto {

  static KEY = "7rKXmfiazNcTZ15J";
  static IV = Buffer.from("2f9ae17cb34588d2610cf7395ea4cb76", "hex");
  
  static md5(input) {
    return crypto.createHash("md5").update(input).digest("hex");
  }
  
  static decrypt(input) {
    try {
       const buffer = Buffer.from(input, "hex");
       const decipher = crypto.createDecipheriv('aes-128-cbc', Crypto.KEY, Crypto.IV);
       
       let decrypted = decipher.update(buffer);
       decrypted = Buffer.concat([decrypted, decipher.final()]);
       
       return decrypted.toString('utf8');
    } catch (err) {
        return "";
    }
  }
  
  static encrypt(input) {
    try {
        const cipher = crypto.createCipheriv('aes-128-cbc', Crypto.KEY, Crypto.IV);
        
        let encrypted = cipher.update(input, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        return encrypted.toString('hex');
    } catch (err) {
        return "";
    }
  }
  
}

module.exports = Crypto;