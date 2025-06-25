# Setup
## 1. SSL certificate を生成する

```sh
$ mkdir -p ssl
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj "/C=US/ST=Test/L=Test/O=Demo/CN=localhost"
```

## 2. サービスを開始する

```sh
docker compose up --build
```

# Test

1. [https://localhost](https://localhost) へアクセスする（self-signed証明書警告あり）
2. "Set Secure Cookie" をクリックする
3. ブラウザの開発者ツールで Cookie を確認する
`auth_token: secure_token_12345` が `secure: true` で設定される

| URL | テストの目的 | 予期される結果 |
| --- | --- | --- |
| `https://localhost/login` | HTTPS Proxy 経由で Secure Cookie を設定する | `secure: true` で設定される |
| `http://localhost:3000/login` | バックエンドの HTTP 直接アクセスで Secure Cookie を設定する | 失敗する |
| `https://localhost/test-insecure` | HTTPS Proxy 経由で Insecure Cookie を設定する | 設定される |

