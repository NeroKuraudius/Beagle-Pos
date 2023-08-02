# Beagle Pos System
![/public/stylesheets/icons/beagle-index.jpg](https://github.com/NeroKuraudius/Beagle-Pos-System/blob/main/public/icon/beagle-index.jpg?raw=true)

## 安裝與使用

### ※事前準備
### 確認已安裝 [Node.js](https://nodejs.org/zh-tw/download) 與 [MySQL](https://dev.mysql.com/doc/)
### 並在MySQL中建立名為`pos`的資料庫


### 1. 下載至本機並安裝套件
開啟cmd並輸入下方指令
```js
git clone 網址
```
繼續在cmd中輸入指令
```js
cd Beagle-Pos-System
```
進入本機資料夾後接著輸入
```js
npm install
```

### 2. 建立資料表與種子資料
安裝完套件後輸入
```js
npx sequelize db:migrate
```
再接著建立種子資料
```js
npx sequelize db:seed:all
```

### 3. 設定環境變數並啟用
輸入以下指令建立環境變數
```js
touch .env
```
至.env的檔案中將PORT與SECRET存入

回到cmd輸入
```js
npm run start
```
如出現`App execute on port: 3000!`表示已成功啟動

啟動後點選下方連結進入(建議以全螢幕瀏覽)

[http://localhost:3000](http://localhost:3000)

請直接以下方預設帳號登入
※前後台分開登入，可點選右下角按鈕切換登入頁

前台：(可任選一組)
1. 帳號 superstar  密碼 hoshimachi

2. 帳號 toprichman  密碼 greencar

3. 帳號 einstein  密碼 relativity

4. 帳號 stark  密碼 iamironman

後台：
帳號 nerodrinkshop  密碼 20230712


### 4. 功能
#### 前台：
1. 首頁右側點單區
- 上方標籤頁可切換飲品類別
- 下方即為當前類別之飲品與價格，一次只能選擇1種
- 每頁最多顯示5種飲品
- 下方可客製化冰塊與甜度，每筆訂單必選
- 可依顧客喜好加點配料，非必選
- 按右下角「新增」按鈕點單

2. 首頁左側訂單區
- 會顯示新增後的訂單(含冰塊、甜度、配料)
- 訂單下方顯示當前訂單總數量與總金額
- 按最下方「結帳」按鈕跳出詢問視窗
- 選「是」即結帳；「否」則無動作
- 結帳後清空訂單區

3. 右上角設定按鈕
- 會跳出選項視窗，上方顯示當前登入使用者名稱
- 視窗中分別有「查看訂單」、「結帳交班」、「帳號登出」
- 「查看訂單」：可查看當前使用者目前為止的訂單，若無訂單則顯示尚無資料
- 「結帳交班」：將當班的訂單結帳，並清空該班次的訂單
- 「帳號登出」：可登出當前使用者帳號
- 右上角返回按鈕可返回首頁點單區

#### 後台：
1. 左側上方為當前登入之後台使用者，下方為標籤頁
- 「訂單管理」：可依日期、班次查詢訂單
- 「人員管理」：可瀏覽當前所有員工資料，右側可直接新增員工
- ↪點選員工列表中的「輪班」按鈕可替換員工班次
- ↪點選「資料修改」可在右側欄位修改員工資料
- ↪點選紅色人員按紐可刪除該員工資料
- 「餐點管理」：可瀏覽目前上架的所有飲品，右側可直接新增餐點
- ↪點選「餐點修改」可修改飲品資料
- ↪點選紅色叉叉按鈕可刪除該飲品
- 「類別管理」：可查看當前所有飲品的類別，右側可直接新增類別
- ↪「類別修改」可修改類別名稱
- ↪點選紅色叉叉按鈕可刪除該類別(類別下不得有飲品)

2. 右上角按鈕為登出功能


### 使用套件與版本
- express: 4.18.2
- express-handlebars: 7.0.7
- express-session: 1.17.3
- method-override: 3.0.0
- connect-flash: 0.1.1
- bcryptjs: 2.4.3
- dayjs: 1.11.9
- passport: 0.6.0
- passport-local: 1.0.0
- mysql2: 3.5.1
- sequelize: 6.32.1
- sequelize-cli: 6.6.1
- dotenv: 16.3.1
