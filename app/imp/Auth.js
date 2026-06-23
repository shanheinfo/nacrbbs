import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class Auth {
    GenerateToken(info, code, time = 7) {
        const key = createHash('sha256').update(code).digest();
        const iv = randomBytes(16);

        function encrypt(text) {
            const cipher = createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return iv.toString('hex') + ':' + encrypted;
        }
        info.endtime = Date.now() + 1000 * time;
        info = JSON.stringify(info);
        return encrypt(info);
    }

    VerifyAuthCode(token, key) {
        if (!token || typeof token !== 'string') {
            return {
                code: 401,
                msg: '无效token'
            };
        }
        
        if (!key || typeof key !== 'string') {
            return {
                code: 401,
                msg: '无效密钥'
            };
        }
        
        try {
            const keys = createHash('sha256').update(key).digest();
            const colonIndex = token.indexOf(':');
            if (colonIndex === -1) {
                return {
                    code: 401,
                    msg: 'token格式错误'
                };
            }
            const ivHex = token.substring(0, colonIndex);
            const encryptedData = token.substring(colonIndex + 1);
            const iv = Buffer.from(ivHex, 'hex');
            
            function decrypt(encryptedText, decryptKey) {
                const decipher = createDecipheriv('aes-256-cbc', decryptKey, iv);
                let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            }
            
            const decryptedInfo = decrypt(encryptedData, keys);
            const info = JSON.parse(decryptedInfo);
            
            if (!info.endtime || typeof info.endtime !== 'number') {
                return {
                    code: 401,
                    msg: 'token格式错误'
                };
            }
            
            if (info.endtime < Date.now()) {
                return {
                    code: 401,
                    msg: 'token已过期'
                };
            }
            
            return {
                code: 200,
                msg: '验证成功',
                data: info
            };
            
        } catch (error) {
            console.error('Token解密失败:', error.message);
            
            if (error.message.includes('bad decrypt')) {
                return {
                    code: 401,
                    msg: 'token无效或密钥错误'
                };
            }
            
            if (error.message.includes('Unexpected token')) {
                return {
                    code: 401,
                    msg: 'token格式错误'
                };
            }
            
            return {
                code: 500,
                msg: '服务器内部错误'
            };
        }
    }
}

export default Auth;