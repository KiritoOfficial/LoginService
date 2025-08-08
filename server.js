const crypto = require('crypto');
const express = require("express");

const app = express();

const key = "7rKXmfiazNcTZ15J";
const iv = Buffer.from("2f9ae17cb34588d2610cf7395ea4cb76", "hex");

function md5(text) {
    const hash = crypto.createHash("md5").update(text).digest("hex");
    return hash;
}

function decrypt(input) {
    try {
       const buffer = Buffer.from(input, "hex");
       const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
       
       let decrypted = decipher.update(buffer);
       decrypted = Buffer.concat([decrypted, decipher.final()]);
       
       return decrypted.toString('utf8');
    } catch (err) {
        return "";
    }
}

function encrypt(plaintext) {
    try {
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        
        let encrypted = cipher.update(plaintext, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        return encrypted.toString('hex');
    } catch (err) {
        return "";
    }
}

const setResponse = (msg) => encrypt(JSON.stringify(msg));

app.get("/login", (req, res) => {

    const token = req.headers.token;
    if (!token) {
        return res.send(setResponse({ status: 400, message: "Request Invalid" }));
    }
    
    const content = decrypt(token);
    if (!content) {
        return res.send(setResponse({ status: 400, message: "Request Invalid" }));
    }
    
    const data = JSON.parse(content);
    console.log(data);
    
    const now = Math.round(new Date().getTime() / 1000);
    
    if ((now - data.timestamp) >= 60) {
        return res.send(setResponse({ status: 400, message: "Token Expired" }));
    }
    
    const secret = "HttpCustom-@DecrypyVPN-@LightXVD";
    const secretHash = md5(`${data.token}-${data.hwid}-${secret}`);
    
    if (data.secret != secretHash) {
       return res.send(setResponse({ status: 400, message: "Request Invalid" }));
    }
    
    const secretToken = md5(`${secret}-Authenticated`);
    
    const response = JSON.stringify({
        status: 200,
        message: "User Authenticated",
        secret: secretToken,
        timestamp: Math.round(new Date().getTime() / 1000),
        expiry: now + 60
    });
    
    return res.send(encrypt(response));
});

app.listen(8080, () => {
    console.log("Server Running on 8080");
})