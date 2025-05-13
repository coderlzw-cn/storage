# 介绍

一个用于管理 cookies 和本地/会话存储的实用工具库，支持可选的加密功能。

## 目录

- [安装](#安装)
- [使用说明](#使用说明)
    - [Cookies](#cookies)
    - [存储](#存储)
- [API](#api)
    - [Cookies API](#cookies-api)
    - [存储 API](#存储-api)
- [贡献](#贡献)
- [许可证](#许可证)

## 安装

可以使用 npm 或 yarn 安装这个库：

```bash
npm install @coderlzw/store
# or
yarn add @coderlzw/store
# or
pnpm add @coderlzw/store
```

# 使用说明

## Cookies

```ts
import { cookie } from '@coderlzw/store';

// 设置默认 Cookie 选项
cookie.setDefaultCookieOptions({
    path: '/',
    domain: 'example.com',
    secure: true,
});

// 示例 1: 设置单个 Cookie（支持加密）
cookie.setCookie({
    key: 'userToken',
    value: 'abc123',
    expires: 'Fri, 31 Dec 2024 23:59:59 GMT',
    maxAge: 3600, // 1 小时
    path: '/',
    domain: 'example.com',
    secure: true,
    encrypt: true,
    secretKey: 'your-secret-key',
});

// 示例 2: 批量设置 Cookies
cookie.setCookies([
    {
        key: 'sessionID',
        value: 'xyz456',
        expires: 'Fri, 31 Dec 2024 23:59:59 GMT',
        path: '/',
    },
    {
        key: 'preferences',
        value: 'darkMode=true',
        path: '/',
    },
]);

// 示例 3: 获取单个 Cookie（支持解密）
const userToken = cookie.getCookie('userToken', 'your-secret-key');

// 示例 4: 获取多个 Cookies
const cookies = cookie.getCookies(['sessionID', 'preferences']);

// 示例 5: 删除单个 Cookie
const isRemoved = cookie.removeCookie('userToken');

// 示例 6: 删除多个 Cookies
const areRemoved = cookie.removeCookies(['sessionID', 'preferences']);

// 示例 7: 清空所有 Cookies
const isCleared = cookie.clearCookies();

// 示例 8: 检查 Cookie 是否存在
const exists = cookie.hasCookie('userToken');

// 示例 9: 获取所有 Cookie 的键名
const allKeys = cookie.getAllCookieKeys();

// 示例 10: 获取所有 Cookie 的键值对
const allCookies = cookie.getAllCookies('your-secret-key');
```

# 存储

```ts
import { storage, StorageTypeEnum, CryptoJS } from '@coderlzw/store';

// 示例数据
const secretKey = 'mySecretKey';

// 1. 存储数据到 sessionStorage（加密）
storage.setStorage({
    key: 'userSession',
    value: { username: 'JohnDoe', role: 'admin' },
    type: StorageTypeEnum.Session,
    expire: 3600000, // 1小时过期
    encrypt: true,
    secretKey: secretKey,
});

// 2. 存储数据到 localStorage（未加密）
storage.setStorage({
    key: 'userPreferences',
    value: { theme: 'dark', language: 'en' },
    type: StorageTypeEnum.Local,
    expire: 86400000, // 1天过期
    encrypt: false,
});

// 3. 获取 sessionStorage 中的加密数据
const userSession = storage.getStorage<{ username: string; role: string }>({
    key: 'userSession',
    type: StorageTypeEnum.Session,
    secretKey: secretKey,
});

// 4. 获取 localStorage 中的未加密数据
const userPreferences = storage.getStorage<{ theme: string; language: string }>({
    key: 'userPreferences',
    type: StorageTypeEnum.Local,
});

// 5. 获取 sessionStorage 中所有数据
const allSessionStorage = storage.getAllStorage(StorageTypeEnum.Session);

// 6. 获取 localStorage 中所有数据
const allLocalStorage = storage.getAllStorage(StorageTypeEnum.Local);

// 7. 删除 sessionStorage 中的某个键值对
storage.removeStorage({ key: 'userSession', type: StorageTypeEnum.Session });

// 8. 清空 localStorage
storage.clearStorage(StorageTypeEnum.Local);

// 9. 检查存储项是否存在
const exists = storage.hasStorage({ key: 'userSession', type: StorageTypeEnum.Session });

// 10. 获取存储项数量
const count = storage.getStorageLength(StorageTypeEnum.Session);

// 11. 获取所有存储键名
const keys = storage.getStorageKeys(StorageTypeEnum.Session);

// 12. 批量删除存储项
const success = storage.removeMultipleStorage({
    keys: ['key1', 'key2'],
    type: StorageTypeEnum.Session,
});
```

# API

## Cookies API

- `setDefaultCookieOptions(options: DefaultCookieOptions): void`：设置默认的 Cookie 选项。

    - `path`（可选）：默认路径。
    - `domain`（可选）：默认域名。
    - `secure`（可选）：默认是否只在 HTTPS 连接中发送。

- `setCookie(options: CookieOptions): boolean`：设置一个 cookie。

    - `key`: Cookie 的名称。
    - `value`: Cookie 的值。
    - `expires`（可选）：Cookie 的过期时间。
    - `maxAge`（可选）：Cookie 的最大存活时间，单位为秒。
    - `path`（可选）：Cookie 的路径。
    - `domain`（可选）：Cookie 的域名。
    - `secure`（可选）：是否为安全 cookie。
    - `encrypt`（可选）：是否加密 Cookie 值。
    - `secretKey`（可选）：加密密钥。

- `setCookies(optionsArray: CookieOptions[]): boolean`：批量设置多个 cookies。

- `getCookie(key: string, secretKey?: string): string | null`：获取指定名称的 cookie 值。

- `getCookies(keys: string[], secretKey?: string): string[]`：获取多个指定名称的 cookie 值。

- `removeCookie(key: string): boolean`：删除指定名称的 cookie。

- `removeCookies(keys: string[]): boolean`：批量删除多个指定名称的 cookies。

- `clearCookies(): boolean`：清空所有 cookies。

- `hasCookie(key: string): boolean`：检查指定名称的 cookie 是否存在。

- `getAllCookieKeys(): string[]`：获取所有 cookie 的键名。

- `getAllCookies(secretKey?: string): Record<string, string>`：获取所有 cookie 的键值对。

## Storage API

- `setStorage<V = unknown, K extends string = never>(data: StorageData<K, V>): void`：设置一个存储值。

    - `key`: 存储键。
    - `value`: 存储值。
    - `type`: 存储类型 (`sessionStorage` 或 `localStorage`)。
    - `expire`（可选）：过期时间，单位为毫秒。
    - `encrypt`（可选）：是否加密存储值。
    - `secretKey`（可选）：加密密钥。

- `getStorage<V = unknown, K extends string = string>(params: { key: K; type: StorageTypeVal; secretKey?: string; }): V | null`：获取存储值。

- `getAllStorage(type: StorageTypeVal): Record<string, unknown>`：获取指定存储类型中的所有键值对。

- `removeStorage(params: { key: string; type: StorageTypeVal; }): void`：删除存储项。

- `clearStorage(type: StorageTypeVal): void`：清空指定存储类型中的所有项。

- `hasStorage(params: { key: string; type: StorageTypeVal; }): boolean`：检查存储项是否存在。

- `getStorageLength(type: StorageTypeVal): number`：获取存储项数量。

- `getStorageKeys(type: StorageTypeVal): string[]`：获取所有存储键名。

- `removeMultipleStorage(params: { keys: string[]; type: StorageTypeVal; }): boolean`：批量删除存储项。

# 贡献

如果你希望为这个项目做出贡献，请在 GitHub 上提交 [Issues](https://github.com/coderlzw-cn/store/issues)
或 [Pull Requests](https://github.com/coderlzw-cn/store/pulls)。

# 许可证

该项目使用 MIT 许可证 - 详情请参阅 [LICENSE](https://github.com/coderlzw-cn/store/blob/main/LICENSE) 文件。
