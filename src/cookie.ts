import CryptoJS from 'crypto-js';

interface CookieOptions {
    key: string; // Cookie 的键名
    value: string; // Cookie 的值
    expires?: string; // Cookie 的过期时间（UTC 字符串）
    maxAge?: number; // Cookie 的最大存活时间（秒）
    path?: string; // Cookie 的路径
    domain?: string; // Cookie 的域名
    secure?: boolean; // 是否只在 HTTPS 连接中发送
    encrypt?: boolean; // 是否加密 Cookie 值
    secretKey?: string; // 加密密钥
}

interface DefaultCookieOptions {
    path?: string; // 默认路径
    domain?: string; // 默认域名
    secure?: boolean; // 默认是否只在 HTTPS 连接中发送
}

const defaultCookieOptions: DefaultCookieOptions = {};

/**
 * 设置默认 Cookie 选项
 * @param options - 默认选项
 */
export const setDefaultCookieOptions = (options: DefaultCookieOptions): void => {
    Object.assign(defaultCookieOptions, options);
};

/**
 * 设置单个 Cookie
 * @param options - Cookie 选项
 * @returns {boolean} 是否成功设置
 * @throws {Error} 当必要参数缺失或无效时抛出错误
 */
export const setCookie = (options: CookieOptions): boolean => {
    if (!options.key || !options.value) {
        throw new Error('Cookie key and value are required.');
    }

    let cookieStr = `${encodeURIComponent(options.key)}=${encodeURIComponent(options.value)}`;

    if (options.expires) {
        const expiresDate = new Date(options.expires);
        if (isNaN(expiresDate.getTime())) {
            throw new Error('Invalid expires date.');
        }
        cookieStr += `;expires=${expiresDate.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
        if (isNaN(options.maxAge) || options.maxAge < 0) {
            throw new Error('Invalid maxAge value.');
        }
        cookieStr += `;max-age=${options.maxAge}`;
    }

    if (options.encrypt) {
        if (!options.secretKey) {
            throw new Error('Secret key must be provided for encryption.');
        }
        const encryptedValue = CryptoJS.AES.encrypt(options.value, options.secretKey).toString();
        cookieStr = `${encodeURIComponent(options.key)}=${encodeURIComponent(encryptedValue)}`;
    }

    if (options.path || defaultCookieOptions.path) {
        cookieStr += `;path=${options.path || defaultCookieOptions.path}`;
    }
    if (options.domain || defaultCookieOptions.domain) {
        cookieStr += `;domain=${options.domain || defaultCookieOptions.domain}`;
    }
    if (options.secure || defaultCookieOptions.secure) {
        cookieStr += ';secure';
    }
    document.cookie = cookieStr;
    return true;
};

/**
 * 批量设置多个 Cookie
 * @param optionsArray - Cookie 选项数组
 * @returns {boolean} 是否所有 Cookie 都设置成功
 */
export const setCookies = (optionsArray: CookieOptions[]): boolean =>
    optionsArray.every((options) => setCookie(options));

/**
 * 获取指定键名的 Cookie 值
 * @param key - Cookie 键名
 * @param secretKey - 可选的解密密钥
 * @returns {string | null} Cookie 值，如果不存在则返回 null
 * @throws {Error} 当键名缺失或解密失败时抛出错误
 */
export const getCookie = (key: string, secretKey?: string): string | null => {
    if (!key) {
        throw new Error('Cookie key is required.');
    }

    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.split('=');
        if (decodeURIComponent(cookieKey) === key) {
            let value = decodeURIComponent(cookieValue);
            if (secretKey) {
                try {
                    const bytes = CryptoJS.AES.decrypt(value, secretKey);
                    value = bytes.toString(CryptoJS.enc.Utf8);
                } catch {
                    throw new Error('Failed to decrypt cookie value.');
                }
            }
            return value;
        }
    }
    return null;
};

/**
 * 获取多个指定键名的 Cookie 值
 * @param keys - Cookie 键名数组
 * @param secretKey - 可选的解密密钥
 * @returns {string[]} Cookie 值数组
 * @throws {Error} 当键名数组无效时抛出错误
 */
export const getCookies = (keys: string[], secretKey?: string): string[] => {
    if (!Array.isArray(keys) || keys.some((key) => !key)) {
        throw new Error('Keys must be a non-empty array of strings.');
    }

    const cookies: string[] = [];
    const cookieArray = document.cookie.split('; ');

    for (const cookie of cookieArray) {
        const [cookieKey, cookieValue] = cookie.split('=');
        if (keys.includes(decodeURIComponent(cookieKey))) {
            let value = decodeURIComponent(cookieValue);
            if (secretKey) {
                try {
                    const bytes = CryptoJS.AES.decrypt(value, secretKey);
                    value = bytes.toString(CryptoJS.enc.Utf8);
                } catch {
                    console.warn(`Failed to decrypt cookie value for key: ${cookieKey}`);
                    continue;
                }
            }
            cookies.push(value);
        }
    }

    return cookies;
};

/**
 * 删除指定键名的 Cookie
 * @param key - Cookie 键名
 * @returns {boolean} 是否成功删除
 */
export const removeCookie = (key: string): boolean => {
    if (!key) {
        throw new Error('Cookie key is required.');
    }
    try {
        setCookie({
            key,
            value: '',
            expires: new Date(0).toUTCString(),
            path: '/',
        });
        return true;
    } catch (e) {
        console.error('Failed to remove cookie:', e);
        return false;
    }
};

/**
 * 批量删除多个指定键名的 Cookie
 * @param keys - Cookie 键名数组
 * @returns {boolean} 是否所有 Cookie 都删除成功
 */
export const removeCookies = (keys: string[]): boolean => {
    if (!Array.isArray(keys) || keys.some((key) => !key)) {
        throw new Error('Keys must be a non-empty array of strings.');
    }

    return keys.every((key) => {
        try {
            return removeCookie(key);
        } catch (e) {
            console.error('Failed to remove cookie:', e);
            return false;
        }
    });
};

/**
 * 清空所有 Cookie
 * @returns {boolean} 是否成功清空所有 Cookie
 */
export const clearCookies = (): boolean => {
    try {
        const cookies = document.cookie.split('; ');
        if (cookies.length === 0) {
            return true;
        }

        cookies.forEach((cookie) => {
            const [key] = cookie.split('=');
            if (key) {
                document.cookie = `${key}=;expires=${new Date(0).toUTCString()};path=/`;
            }
        });

        return true;
    } catch (e) {
        console.error('Failed to clear cookies:', e);
        return false;
    }
};

/**
 * 检查 Cookie 是否存在
 * @param key - Cookie 键名
 * @returns {boolean} 是否存在
 */
export const hasCookie = (key: string): boolean => {
    return getCookie(key) !== null;
};

/**
 * 获取所有 Cookie 的键名
 * @returns {string[]} Cookie 键名数组
 */
export const getAllCookieKeys = (): string[] => {
    return document.cookie.split('; ').map((cookie) => decodeURIComponent(cookie.split('=')[0]));
};

/**
 * 获取所有 Cookie 的键值对
 * @param secretKey - 可选的解密密钥
 * @returns {Record<string, string>} Cookie 键值对对象
 */
export const getAllCookies = (secretKey?: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key) {
            const decodedKey = decodeURIComponent(key);
            let decodedValue = decodeURIComponent(value);

            if (secretKey) {
                try {
                    const bytes = CryptoJS.AES.decrypt(decodedValue, secretKey);
                    decodedValue = bytes.toString(CryptoJS.enc.Utf8);
                } catch {
                    console.warn(`Failed to decrypt cookie value for key: ${decodedKey}`);
                    continue;
                }
            }

            result[decodedKey] = decodedValue;
        }
    }

    return result;
};
