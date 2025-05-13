import CryptoJS from 'crypto-js';

/**
 * 存储类型枚举
 * @enum {string}
 */
export enum StorageTypeEnum {
    /** 会话存储 */
    Session = 'sessionStorage',
    /** 本地存储 */
    Local = 'localStorage',
}

/**
 * 存储类型字面量
 */
// export type StorageTypeEnum = StorageTypeEnum | "sessionStorage" | "localStorage";

/**
 * 加密存储数据接口
 * @template K 键名类型
 * @template V 值类型
 */
interface EncryptedStorageData<K, V> {
    /** 存储的键名 */
    key: K;
    /** 存储的值 */
    value: V;
    /** 存储类型 */
    type: StorageTypeEnum;
    /** 过期时间（毫秒） */
    expire?: number;
    /** 是否加密 */
    encrypt: true;
    /** 加密密钥 */
    secretKey: string;
}

/**
 * 未加密存储数据接口
 * @template K 键名类型
 * @template V 值类型
 */
interface UnencryptedStorageData<K, V> {
    /** 存储的键名 */
    key: K;
    /** 存储的值 */
    value: V;
    /** 存储类型 */
    type: StorageTypeEnum;
    /** 过期时间（毫秒） */
    expire?: number;
    /** 是否加密 */
    encrypt?: false;
    /** 加密密钥 */
    secretKey?: never;
}

/**
 * 存储数据类型
 * @template K 键名类型
 * @template V 值类型
 */
type StorageData<K, V> = EncryptedStorageData<K, V> | UnencryptedStorageData<K, V>;

/**
 * 存储数据结构（包含时间和过期时间）
 */
interface StorageDataWithTime {
    /** 存储的值 */
    value: unknown;
    /** 过期时间（毫秒） */
    expire?: number;
    /** 存储时间戳 */
    time?: number;
}

/**
 * 类型保护函数，用于检查是否为有效的存储类型
 * @param type - 要检查的存储类型
 * @returns 是否为有效的存储类型
 */
const isValidStorageType = (type: unknown): type is 'sessionStorage' | 'localStorage' => {
    return type === 'sessionStorage' || type === 'localStorage';
};

/**
 * 存储值到指定存储类型
 * @template V 值类型
 * @template K 键名类型
 * @param data - 存储数据
 * @throws {Error} 当参数无效时抛出错误
 */
export const setStorage = <V = unknown, K extends string = never>(data: StorageData<K, V>): void => {
    const { key, value, type, expire, encrypt = false, secretKey } = data;

    if (expire != null && isNaN(expire)) {
        throw new Error('expire must be a number');
    }
    if (expire != null && expire <= 0) {
        throw new Error('expire must be greater than 0');
    }

    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storageData = expire != null ? { value, time: Date.now(), expire } : { value };

    let stringValue: string;
    if (encrypt) {
        if (!secretKey) {
            throw new Error('secretKey must be provided when encrypt is true');
        }
        const string = JSON.stringify(storageData);
        stringValue = CryptoJS.AES.encrypt(string, secretKey).toString();
    } else {
        stringValue = JSON.stringify(storageData);
    }

    (window[type] as Storage).setItem(key, stringValue);
};

/**
 * 获取指定存储类型中的值
 * @template V 值类型
 * @template K 键名类型
 * @param params - 获取参数
 * @param params.key - 键名
 * @param params.type - 存储类型
 * @param params.secretKey - 解密密钥（可选）
 * @returns 返回存储的值或 null
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const getStorage = <V = unknown, K extends string = string>({
    key,
    type,
    secretKey,
}: {
    key: K;
    secretKey?: string;
    type: StorageTypeEnum;
}): V | null => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storageValue = (window[type] as Storage).getItem(key);
    if (storageValue === null) {
        return null;
    }

    let jsonData: StorageDataWithTime;
    try {
        let decryptedValue = storageValue;
        if (secretKey) {
            const bytes = CryptoJS.AES.decrypt(storageValue, secretKey);
            decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
        }
        jsonData = JSON.parse(decryptedValue) as StorageDataWithTime;
    } catch (e) {
        console.error('Failed to decrypt or parse storage value:', e);
        return null;
    }

    const nowTime = Date.now();

    // 如果存有过期时间，过期删除
    if (jsonData.expire != null && jsonData.time != null && jsonData.expire < nowTime - jsonData.time) {
        (window[type] as Storage).removeItem(key);
        return null;
    }
    return jsonData.value as V;
};

/**
 * 获取指定存储类型中的所有键值对
 * @param type - 存储类型
 * @returns 返回存储项的键值对对象
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const getAllStorage = (type: StorageTypeEnum): Record<string, unknown> => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storage = window[type] as Storage;
    const storageObject: Record<string, unknown> = {};
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key != null) {
            const value = getStorage({ key, type });
            if (value !== null) {
                storageObject[key] = value;
            }
        }
    }
    return storageObject;
};

/**
 * 根据键名删除存储项
 * @param params - 删除参数
 * @param params.key - 键名
 * @param params.type - 存储类型
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const removeStorage = ({ key, type }: { key: string; type: StorageTypeEnum }): void => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    (window[type] as Storage).removeItem(key);
};

/**
 * 清空指定存储类型中的所有项
 * @param type - 存储类型
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const clearStorage = (type: StorageTypeEnum): void => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    (window[type] as Storage).clear();
};

/**
 * 检查存储项是否存在
 * @param params - 检查参数
 * @param params.key - 键名
 * @param params.type - 存储类型
 * @returns 是否存在
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const hasStorage = ({ key, type }: { key: string; type: StorageTypeEnum }): boolean => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    return (window[type] as Storage).getItem(key) !== null;
};

/**
 * 获取存储项的数量
 * @param type - 存储类型
 * @returns 存储项数量
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const getStorageLength = (type: StorageTypeEnum): number => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    return (window[type] as Storage).length;
};

/**
 * 获取存储项的键名列表
 * @param type - 存储类型
 * @returns 键名数组
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const getStorageKeys = (type: StorageTypeEnum): string[] => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storage = window[type] as Storage;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key != null) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * 批量删除多个存储项
 * @param params - 删除参数
 * @param params.keys - 键名数组
 * @param params.type - 存储类型
 * @returns 是否全部删除成功
 * @throws {Error} 当存储类型无效时抛出错误
 */
export const removeMultipleStorage = ({ keys, type }: { keys: string[]; type: StorageTypeEnum }): boolean => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    return keys.every((key) => {
        try {
            removeStorage({ key, type });
            return true;
        } catch (e) {
            console.error(`Failed to remove storage item with key: ${key}`, e);
            return false;
        }
    });
};
