# [http://localhost](http://localhost):<port>/report



## 📤 POST `/report/submit`

提交一份舉報資訊並上傳至 IPFS、資料庫與區塊鏈。

### ✅ Request Body

```json
{
  "info": "這是使用者填寫的舉報內容"
}
````

### 🔁 Response

#### 成功 `200 OK`

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "id": 1718672000000,
  "cid": "bafybeihh..."
}
```

#### 失敗 `500 Internal Server Error`

```json
{
  "success": false,
  "error": "File upload failed"
}
```

---

## 📥 GET `/report/reports`

取得所有已上傳報告的 CID 列表。

### 🔁 Response

#### 成功 `200 OK`

```json
{
  "success": true,
  "reports": [
    "bafybeia1...",
    "bafybeib2..."
  ]
}
```

#### 失敗 `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to fetch reports"
}
```

