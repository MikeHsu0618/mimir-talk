# 從 Thanos 到 Mimir 3.0 — 簡報分鏡稿

> **講者**：Mike Hsu
> **場合**：PromConf Taiwan 2026
> **時長**：40 分鐘
> **核心故事**：AI 時代觀測者變 agent → Thanos 垂直撞牆 → 三維度選型 → Mimir 3.0 Ingest Storage → AutoMQ 跨 AZ 歸零 → 延遲伏筆回收 → 成本實測 → Parquet Gateway 的未來

---

## 章節架構

| # | 章節 | 張數 | 預估時間 |
|---|------|-----|---------|
| 1 | 開場 · AI 動機 | 4 | 3 min |
| 2 | 長期指標後端架構介紹 | 4 | 5 min |
| 3 | 痛點 + 選型 | 5 | 6 min |
| 4 | Mimir 3.0 架構 | 7 | 8 min |
| 5 | Kafka 選型 — AutoMQ | 10 | 11 min |
| 6 | 成本效能實戰成果 | 3 | 4 min |
| 7 | 下一站 · 可觀測性 2.0 | 4 | 3 min |
| | **結語** | 1 | 1 min |
| | **合計** | **38 張** | **41 min** |

---

# §1 開場 · AI 動機

## Slide 1 · 封面

**Layout**: cover
**時間**: ~30 sec

**畫面構成**
- 超大標題：「從 Thanos 到 Mimir 3.0」
- 副標：「AI 時代下 · 我們如何重構可觀測性的地基」
- 下方寫講者、場合、副標籤（`40 min` / `Mimir 3.0` / `AutoMQ`）

**口吻提示**
自我介紹。Hook 句：「最神奇的 AI 世界，底下跑的還是最不性感的基礎設施。」這是一份工程日誌，不是產品宣傳 — 有踩坑、有真實成本、有沒解決的難題。

---

## Slide 2 · 開場 Hook

**Layout**: statement
**時間**: ~45 sec

**畫面構成**
- 置中大字：「**我們的 metrics 後端 · 第一大使用者 · 已經不是人類**」
- 副標：「觀測者，正從『人』變成『agent』」

**口吻提示**
- 這句要講慢一點，讓它在空氣中落地
- 以前 metrics 是 SRE 早上喝咖啡看 dashboard 用的
- 現在組織內的 agent（SRE / DB / service）24/7 打後端
- 人類查詢是偶爾的、手動的；agent 查詢是連續的、程式化的
- 這是全新的 workload 模式 — 也是我們必須重構後端的原因

---

## Slide 3 · 這不是想像 — SRE Agent Demo

**Layout**: default
**時間**: **20–30 sec（嚴格 budget）**

**畫面構成**
- 中央影片位（dashed border，註明 Reserved for Live Demo）
- 右下角顯示 `⏱ 20–30 sec budget` 提醒自己別戀棧
- 下方三張 callout：**現在**（幾個 agent 在跑 · 未飽和）/ **即將到來**（DB / Service / Cost / Security agent）/ **這只是開始**（提前預知趨勢把地基打好）

**口吻提示**
- 快秀 1-2 支影片，每支 10-15 秒就好
- 重點句：「這還只是 early adopter 階段，一旦全公司飽和，後端負載是現在的幾倍」
- 收尾：「所以我們選型時看的不是今天的 workload，是兩年後的」

---

## Slide 4 · 我們面對的量級

**Layout**: default（4 Stat + 2 欄解析）
**時間**: ~1 min

**畫面構成**
4 張 Stat 卡片：
- **40** EKS Clusters
- **120M** Peak Active Series
- **8M** Samples / sec
- **365 天** 保留週期

下方兩欄：
- 左：「為什麼盯 Active Series？」 — Ingester 記憶體 ≈ 8 KB × active series（TSDB head chunk、in-memory postings、label set）→ 120M × 8 KB ≈ **960 GB RAM**
- 右：Callout「2023 選 Thanos」— 當時最成熟 · Sidecar Mode 可無侵入掛上現有 Prom · **服役 3 年踩遍所有坑**

**口吻提示**
- 量級建立 credibility
- Active series 是本場關鍵詞 — 它直接決定 ingester 記憶體，而記憶體是長期後端最貴的資源
- 2023 選 Thanos 是當時正確的決定，不是為了批判它

---

# §2 長期指標後端架構介紹

## Slide 5 · 章節過場

**Layout**: section
**時間**: ~15 sec

「長期指標後端架構介紹」+ 副標「兩種整合模式 · 兩種設計哲學」

---

## Slide 6 · 為什麼需要長期指標後端？

**Layout**: default（2 欄 + callout）
**時間**: ~1 min

**畫面構成**
- 左：**Prometheus 的先天限制** — 本地 15 天 / 單機儲存 / 無法跨集群 / Ingester RAM 線性 ∝ active series（**垂直擴展天花板**）
- 右：**新世代需求** — 上月 baseline / 黑五 vs 平日 / SLO 年度達成率 / **AI agent 的連續性歷史回溯**
- 底部 win callout：「高吞吐 · 低查詢延遲 · 便宜，且能擺脫單機天花板」

**口吻提示**
快速過。強調：AI agent 的回溯是**連續性 workload**（30 分鐘窗口可能發幾千個 PromQL），不是偶爾看 dashboard。

---

## Slide 7 · 兩種整合模式（同框對比）

**Layout**: default（2 欄 Mermaid）
**時間**: ~1.5 min

**畫面構成**
- 左（橘色）**Sidecar Mode** Mermaid：Prometheus Pod 內含 Sidecar · Sidecar 上傳 block 到 S3 · Store Gateway 查歷史 · **Sidecar 回呼 Prom 的 remote-read 查短期**
- 右（青色）**Remote-Write Mode** Mermaid：Prometheus 推 protobuf 給 Backend · Backend 負責壓縮建 index · 短期長期都打 Backend
- 底部：「我們一開始選的是 Sidecar Mode — 這是個很巧妙的設計」

**口吻提示**
先承認 Sidecar 的設計是巧妙的，為下一張的 credit 鋪陳。

---

## Slide 8 · Sidecar Mode 的巧妙之處

**Layout**: default（左 3 欄 Mermaid · 右 2 欄 callout）
**時間**: ~1.5 min

**畫面構成**
- 左：Prometheus 記憶體 TSDB → 每 2h 壓縮成 Block → 本地 disk + Sidecar 原封不動上傳 S3
- 右 callout **關鍵洞察**：S3 上的 block 和本地 disk 完全一樣，Sidecar 不做任何運算
- 右 callout **對比 Remote-write**：Backend 要解 protobuf → 重新壓縮 → 重建 index，**同一份運算做了兩次**
- 底部：「理論上 Sidecar 避免了後端重新壓縮的浪費 — 所以我們選它是合理的」

**口吻提示**
先說 Sidecar 的好，後面批判才有重量。

---

# §3 痛點 + 選型

## Slide 9 · 過場：但是 — 我們撞牆了

**Layout**: statement
**時間**: ~15 sec

「但是 ⋯ **我們撞牆了**」+ 副標「接下來講痛點」

給聽眾一個心理緩衝，從「認同 Sidecar 巧妙」切到「但它有結構性問題」。

---

## Slide 10 · 痛點 ① — 短期查詢垂直瓶頸

**Layout**: default（左 3 欄 Mermaid · 右 2 欄 money shot）
**時間**: ~2 min · **第一個 money shot**

**畫面構成**
- 左 Mermaid：Grafana + AI Agent → Thanos Querier → 短期走 Sidecar（remote-read 回 💥 Prometheus）· 長期走 Store Gateway → S3
- 右大數字卡（紅框）：「**Single Prometheus Pod · 512 GiB RAM**」拆分「Prometheus 400+ GiB / Sidecar 數十 GiB」
- 底部：「Sidecar 為短期查詢扛 remote-read buffer → 記憶體壓力被放大 · 必須配 512 GiB node」

**口吻提示**
- 真實 production 數字
- 細節：Thanos 查 < 2h 走 sidecar 的 remote-read API，壓力回 Prom + Sidecar 本身要 buffer + decode
- 結論：垂直擴展的瓶頸被**放大** — 繼續走只剩買更大機器 / 換架構
- 這是遷移的**第一個導火線**

---

## Slide 11 · 痛點 ② — 長期查詢 Store Gateway 掙扎

**Layout**: default（左 3 欄 Mermaid fan-out · 右 2 欄要點）
**時間**: ~1.5 min

**畫面構成**
- 左：Thanos Querier fan-out 到所有 Store Gateway · 每個 SG 掃整個 bucket
- 右要點：Bucket scan `O(all_blocks)` · Index header 先下載 · Sharding 靜態 · Cache 參數難調 · 重度查詢 SG 直接 OOM
- 底部：「Store Gateway 一失守 → 整個長期查詢鏈路崩」

**口吻提示**
- 不深講 11 維度比較
- 感覺：Mimir SG 為大規模多租戶設計（bucket index / 動態 sharding）· Thanos 是從 Prom 長出來的
- 設計前提不同，不是誰對誰錯

---

## Slide 12 · 三條決策維度（攤開）

**Layout**: default（3 列維度卡片）
**時間**: ~1.5 min

**畫面構成**
三張並排卡片：
- **維度 ①** Sidecar vs Remote-Write → 緩解**短期**垂直瓶頸
- **維度 ②** Thanos vs Mimir → 解決**長期**查詢瓶頸
- **維度 ③** Prometheus Server vs Prometheus Agent → 徹底消除**採集端**瓶頸（**最激進，風險最高**）

底部：「三個維度互相獨立 · 排列組合出來的方案我們會一起看」

**口吻提示**
先把思考空間攤開，不要急著給答案。

---

## Slide 13 · 排列組合 · 刪去法

**Layout**: default（5 個合法選項 + 勝出標示）
**時間**: ~1.5 min

**畫面構成**
頁首合法性註記：「Mimir 只吃 remote-write（無 Sidecar 模式）· Prom Agent 無本地 TSDB（不能配 Sidecar）」

5 個**合法**選項列（失敗的灰階、勝出的綠色強化）：
- ① Thanos · Sidecar · Prom Server（現況）→ 短期 + 長期都撞牆
- ② Thanos · Remote-Write (Receiver) · Prom Server → 短期解了，長期 Store Gateway 沒解
- ③ Thanos · Remote-Write · Prom Agent → 長期沒解 · 又把 alert 風險疊加
- ④ **Mimir · Remote-Write · Prom Server** → 🏷 **選這條**
- ⑤ Mimir · Remote-Write · Prom Agent → 太激進（HPA / KEDA / Alert 全綁 Mimir）

底部：「刪去法 → 剩下 ④：Mimir 換後端、Prom Server 保留做最後防線」

**口吻提示**
- 先點出合法性約束 — 不然聽眾會問「為什麼沒有 Sidecar + Mimir」
- Mimir 沒有 Sidecar 模式（它只吃 remote-write）
- Prom Agent 無本地 TSDB → 沒 block 可給 Sidecar 上傳
- 所以實際合法組合只有 5 個（不是 6）
- ⑤ 太激進的理由：Prom Agent = alert / HPA / KEDA 全部交給後端，後端抖動 = 業務抖動
- 保留 Prom Server 是**保險決策** — 未來想切 Agent，這條路還能走
- **埋伏筆**：這個選擇會在後面 AutoMQ 延遲那段回收

---

# §4 Mimir 3.0 架構

## Slide 14 · 章節過場

**Layout**: section
**時間**: ~15 sec

「Mimir 3.0 架構」+ 副標「為什麼 Mimir 3.0 是這次遷移的臨門一腳」

---

## Slide 15 · 為什麼偏偏挑這個時間點？

**Layout**: default（2 欄 + win callout）
**時間**: ~1.5 min

**畫面構成**
- 左 **Mimir 3.0 時間點**：2025 下半年推出 · 三主題 Reliability / Performance / Cost · 兩特性（Ingest Storage / MQE）· Grafana Cloud dogfood ~25% TCO ↓
- 右 **Grafana vs Thanos 社群態勢**（**講者個人營運 3 年經驗**）：LGTM 集中火力 · Mimir minor 持續大升級 · Thanos 節奏不快 · **文件不齊，深度問題多得翻 source code** · 下一代儲存 Parquet Gateway 三家社群共同推
- 底部 win callout：「Thanos 是可靠的老兵，但 Mimir 正站在浪尖 — **選方向比選當下更重要**」

**口吻提示**
- 右欄社群態勢請用「我自己營運的第一手經驗」這種語氣，不是外部引用
- 不貶低 Thanos — 選 Mimir 的理由是「現在就能兌現紅利（Ingest Storage + MQE）」，不是「Thanos 要死了」
- 避免做「Thanos maintainer 往 Mimir 匯流」這種沒根據的聲稱 — Parquet Gateway 是三家共同項目，不是誰吞誰

---

## Slide 16 · Mimir 3.0 的三大支柱

**Layout**: default（上下結構：上架構圖 · 下 3 卡片）
**時間**: ~1.5 min

**畫面構成**
上方 **Grafana 官方 Mimir 3.0 架構圖**（白底卡片包裹避免色衝突）· 圖下 caption「Grafana Labs 官方 Mimir 3.0 架構」

下方三張漸層卡片（水平節奏）：
- 橘 **Reliability** · 寫讀徹底解耦 · Kafka 為中繼 · 讀掛了寫依然健康 · quorum 從 2/3 降到 1
- 青 **Performance** · Mimir Query Engine · Streaming + common sub-expression · Peak CPU ↓80% · Peak Mem ↓3×
- 綠 **Cost** · Ingester 減半 · Zones 從 3 降到 2 · 副本不靠 RF=3 · ~25% TCO ↓

底部：「接下來拆兩個支柱講 — 先 Ingest Storage，再 MQE」

**口吻提示**
- 先講上方架構圖，把聽眾的心智模型建起來 — 現場可直接指圖：
  - 右半「Data to ingest → distributor → Kafka → ingesters」= 寫路徑（Ingest Storage 核心）
  - 左半「Queries → query-frontend → querier → ingesters + store-gateway」= 讀路徑
  - 虛線 Asynchronous transfers = ingester 非同步上傳 block 到 object storage
  - Compactor 在 object storage 背後壓縮
- 再帶三大支柱卡片：Reliability（解耦）/ Performance（MQE）/ Cost（Ingester 減半）
- 下兩頁深入 Ingest Storage

---

## Slide 17 · Ingest Storage — 從「3 副本寫入」到「1 次 Kafka produce」

**Layout**: default（左右對比 Mermaid + 不變式對比 + 引言）
**時間**: ~2.5 min

**畫面構成**
- 左（紅）**Mimir v2 Classic** Mermaid：Distributor → RF=3 gRPC Push → 3 個 Ingester · Querier 2/3 quorum
- 右（綠）**Mimir 3.0 Ingest Storage** Mermaid：Distributor → 寫 1 次到 Kafka API → Ingester consumer + Block Builder 拆獨立 · Querier quorum=1
- **不變式對比橫條**（紅/綠兩盒，解釋為什麼要這麼多次讀寫）：
  - 紅：「為什麼要 2/3 quorum？」→ **Dynamo-style 不變式** `R + W > N` · W=2 · R=2 · N=3 → 4 > 3 ✓ · 讀集合與最新寫必交集
  - 綠：「為什麼 quorum = 1 就夠？」→ **Kafka partition = linearized log** · 每個 consumer 都是同一 log 完整 replay · 無分歧狀態 · 不需 overlap
- 底部 win callout 引述 Grafana 官方（Jonathan）：「我們依賴的**不是 Kafka，是 Kafka API** — 可換 WarpStream / Redpanda / AutoMQ」

**口吻提示**
- 左右對比把最關鍵的變化講清楚：寫入從 3 副本變 1 次；Ingester 從「什麼都做」變純 consumer；Block 建構拆出去
- **不變式這段要講到位** — 不然聽眾會一直困惑「為什麼不是寫 1 次讀 1 次就好」：
  - Dynamo 1998 給答案：`R + W > N` 保證讀集合跟最新寫集合有交集，才能讀到最新值
  - v2 用 RF=3、W=R=2 剛好滿足 4>3
  - v3 改用 Kafka 這種 append-only linearized log → 事實單一 → 不需要 overlap quorum，1 個 consumer 就拿完整資料
- 強調 Kafka API 不是 Kafka — 為後面 AutoMQ 鋪路

---

## Slide 18 · Write/Read Path 完全解耦 · Quorum = 1

**Layout**: default（官方圖 + 2 callout）
**時間**: ~1.5 min

**畫面構成**
- 上方大圖：`mimir3-decouple.png`（Write ✅ / Read ✗ 視覺對比）
- 下 callout **可用性翻轉**：v2 過半 zone 健康才算活 → v3 每 partition 有 1 個消費者就算活
- 下 callout **可用性變成旋鈕**：想更高可用？**把 partition 數加一倍**（不用加整組 zone）
- 底部：「熱查詢再兇 · 寫入路徑只到 Kafka 就結束 · Write 永遠 HEALTHY」

**口吻提示**
對 SRE 的意義：查詢爆炸不再變寫入事件；alert 的源頭不會因此消失。

---

## Slide 19 · 副本數學 — 成本最大的砍刀

**Layout**: default（對比表格 + win callout）
**時間**: ~2 min

**畫面構成**
4 欄對比表（Classic RF=3+3z / Ingest 3z / **Ingest 2z**）：
副本決定方式 · 實際副本數 · Write 容錯 · Read quorum · Read 容錯 · Ingester 成本 · 額外成本

底部 win callout：「**RF=2 + 2 zones** — 把可用性從『RF 堆出來』換成『Kafka 保證 + partition 調整』」

**口吻提示**
- Classic 生產必須 RF=3 + 3 zones（RF=2 是 0 容錯）
- v3 改用 PartitionInstanceRing：不再用 RF，由 zone 數決定副本
- 2 zones + Ingest Storage 拿到比 classic 3 zones 還強的 read 容錯
- 真正省到 33% ingester 資源 — **整個 Mimir 3.0 最大的成本殺手**

---

## Slide 20 · Mimir Query Engine · 讀端同步省下來

**Layout**: default（官方 benchmark + 4 Stat）
**時間**: ~1 min

**畫面構成**
- 上：`mimir3-mqe-benchmark.png`（1h query 1000 series sum 測試）
- 下：4 張 Stat — **92%** Less mem · **38%** Faster · **3×** Querier peak mem ↓ · **80%** Querier peak CPU ↓
- 底部：「MQE 在 Mimir 3.0 是 default · 升級後自動拿到 · 覆蓋 100% 穩定 PromQL grammar」

**口吻提示**
升上去就有的好處 — 不用改 query、不用加設定。

---

## Slide 21 · 遷移後 · 寫讀兩端資源同時下降

**Layout**: default（2×2 dashboard grid + win callout）
**時間**: ~1 min

**畫面構成**
2×2 網格，上排橘色（寫路徑）· 下排青色（讀路徑）：
- 左上 **Ingester · CPU** dashboard
- 右上 **Ingester · Memory** dashboard
- 左下 **Querier · CPU** dashboard
- 右下 **Querier · Memory** dashboard

底部 win callout：「寫（Ingester）+ 讀（Querier）同時兌現 · 同一生產集群 · 升級前後」— RF=3→2 + Ingest Storage → Ingester CPU/Mem 雙降 · MQE → Querier CPU/Mem 雙降

**口吻提示**
- 四張圖都是真實 production dashboard（非 benchmark）
- 橘色兩張 = 寫路徑紅利：RF=3→2、副本責任交給 Kafka，升級當天斷崖式下降
- 青色兩張 = 讀路徑紅利：MQE streaming，Peak 被壓平
- 這頁是整個 Mimir 3.0 段的 **結論頁** — 一口氣看到「講完寫跟讀，成果全在這」
- 下一段要進 Kafka 選型

---

# §5 Kafka 選型 — AutoMQ

## Slide 22 · 章節過場

**Layout**: section
**時間**: ~15 sec

「Kafka 選型」+ 副標「多了一個元件 · 我們是不是在自己給自己找死？」

---

## Slide 23 · 等等 ⋯ 加 Kafka 不就更複雜嗎？

**Layout**: default（問句 + 定理揭示）
**時間**: ~1 min

**畫面構成**
- 中央引用框：「原本一個長期指標系統就夠複雜了，現在還要多一個 Kafka？」
- 下方（v-click）：「答案要從這個定理說起」
- **L = λ · W**（大字、orange、monospace）
- 副文：「系統中的待處理量 = 到達速率 × 每件事的處理時間」

**口吻提示**
- 加元件 = 多複雜度，是真的
- 但複雜度不會憑空消失，你只是選擇它放哪裡
- 李氏定理：L 堆積 = 流入（控不住）× 處理時間（下游拖慢）
- 加 Kafka 不是為了簡化，是為了**把耦合拆開**

---

## Slide 24 · 現實中的 Kafka — 分散式回堵噩夢

**Layout**: default（Mermaid 回堵圖 + 2 callout）
**時間**: ~2 min

**畫面構成**
- 上 Mermaid（實線流入 / 虛線回堵）：Prom → Distributor → Kafka → Ingester ⚠️ → 回堵一路反噬到 Prom → On-call Alert 暴擊
- 下 warn callout **Kafka 不永遠低延遲**：Rebalance / Leader 切換 / Consumer lag · 任一件都能把 5ms 變 5 秒
- 下 info callout **我們學到的**：加 Kafka 不是免費的午餐 · 你接受這個複雜度換來上層解耦 · **選型要算清楚這筆帳**

**口吻提示**（誠實調性，整場核心態度）
真實踩坑：Kafka consumer 慢（根因在 ingester）→ Kafka 堆積 → Distributor produce timeout → Prom queue full → 全環境噴 alert。這種跨元件 debug 是固有複雜度，我們接受了，因為好處夠大。

---

## Slide 25 · Kafka 的下一個十年 · Diskless Wars

**Layout**: default（5 欄 grid：左 3 時間軸 · 右 2 社群合圖）
**時間**: ~1.5 min

**畫面構成**
左側時間軸（年月 + 事件 + 彩色左邊框）：
- Aug 2023 · WarpStream 發表（Kafka-API on S3 首發）
- May 2024 · Confluent Freight 發表
- Jul 2024 · AutoMQ 1.0 發布 · S3 Direct 寫入
- Sep 2024 · Confluent 收購 WarpStream $220M
- Apr 2025 · Aiven 提出 Diskless Topics (KIP-1150)
- Nov 2025 · Redpanda 發表 Cloud Topics
- **Mar 2026 · KIP-1150 正式通過 — Apache Kafka 擁抱 diskless**（最後一行重點強化）
- 下方 info callout：「社群共識已成形 · stateless broker · object storage 為 source of truth」

右側 **社群合圖**（`mimir-kafka-architecture.png`）：小紅書 Aiven Josep / Greg 的貼文 + 底下 Apache 郵件投票結果（Re: [VOTE] KIP-1150）

圖下 caption：「KIP-1150 正式通過的社群公告 · Aiven / Confluent / Red Hat / IBM 等共同背書」

**口吻提示**
- 左側時間軸帶著聽眾走過兩年 diskless 浪潮
- 右側合圖是**真實感的錨點** — 這不是 PR 稿，是社群裡真人真投票（9 binding votes + 5 non-binding）
- 結論：AutoMQ 不是「我們的冒險」，是走在共識已成方向的最早一批

---

## Slide 26 · 傳統 Kafka 的三大痛點

**Layout**: default（3 欄紅卡片）
**時間**: ~1 min

**畫面構成**
三張紅邊卡片：
- **① 維運** · Broker 有狀態 · partition 綁本地 disk · 每次重啟 / 擴縮 / 修復都要搬資料
- **② 水平擴展** · Rebalance Storm · 加/縮 broker 都觸發大量遷移 · 每次擴縮都是風險
- **③ 跨區流量** · 帳單主角 · Replication + producer + consumer 跨 AZ · **大叢集佔成本 60–70%**

底部：「重度用過 Kafka 的人會秒懂 — 這三個是每張 AWS 帳單上的主角」

---

## Slide 27 · AutoMQ · 重新設計的 Kafka

**Layout**: default（架構圖 + 3 win callout）
**時間**: ~1.5 min

**畫面構成**
- 上：`automq-architecture.png`（Kafka PageCache+LocalDisk vs AutoMQ WAL+MessageCache+ObjectStorage）
- 下三 callout：
  - **Storage / Compute 分離** · Broker 本地不存 partition data · 全部寫 S3 · broker stateless
  - **Zero Partition Replication** · S3 本身多副本 · 不用 broker 互相 copy · replication 流量歸零
  - **100% Kafka API** · Protocol 原生支援 · Producer / Consumer 不用改 · 切換零遷移成本

**口吻提示**
關鍵：100% Kafka API 相容 — 我們的 Prom distributor / Mimir ingester 完全不用改。

---

## Slide 28 · 跨 AZ 流量 · 傳統 Kafka 的黑洞

**Layout**: default（5 欄 grid：左 3 圖 · 右 2 三個 pain 卡）
**時間**: ~1.5 min

**畫面構成**
- 左側大圖：`kafka-inter-zone.png`（Producer/Replication/Consumer 全跨 AZ）
- 右側三張紅色 pain 卡：
  - **① Producer → Broker** · 寫入可能 hit 到其他 AZ 的 leader
  - **② Broker ↔ Broker Replication** · 副本機制本質上幾乎必定跨 AZ
  - **③ Consumer ← Broker** · Consumer 不一定跟 leader 同 AZ
- 底部 warn callout（AutoMQ 官方數據）：「大叢集跨 AZ 流量佔 Kafka 總成本 **60-70%** · 這筆錢不是花在業務，是花在 AWS 網路」

**口吻提示**
- 把問題講清楚：三條跨 AZ traffic，在 AWS 每 GB 都收錢
- Replication 這條幾乎免不了（RF=1 不能用在 prod）
- 這比 EC2 本身還貴 — 下一頁看 AutoMQ 怎麼歸零

---

## Slide 29 · AutoMQ 的解法 · Zero-Zone Router

**Layout**: default（5 欄 grid：左 3 圖 · 右 2 四步流程 + win）
**時間**: ~2 min · **AutoMQ 段高潮**

**畫面構成**
- 左側大圖：`automq-zero-zone-router.png`（Rack-aware Router · S3 路由 · Zero Cross AZ Traffic）
- 右側四步流程（綠色數字編號）：
  - ① Producer 寫入本地 AZ 的 broker
  - ② Rack-aware Router 透過 S3 路由給 leader partition
  - ③ 其他 AZ 從 S3 同步拿 readonly 副本
  - ④ Consumer 從本地 AZ 的 readonly replica 讀取
- 下方綠色高亮 **「唯一跨 AZ 流量：broker ↔ S3 · AWS 同 region S3 免費」**
- 底部 win callout：「神來一筆的設計 · Producer / Consumer 全部 in-AZ · 跨 AZ 流量從 60-70% 成本歸零」

**口吻提示**（分步講慢 2 分鐘）
- 一步一步走：Producer 本地寫 → S3 路由 → 其他 AZ 拿副本 → Consumer 本地讀
- 關鍵：Producer ↔ Broker / Consumer ↔ Broker 全部 in-AZ
- 唯一跨 AZ traffic 是 broker ↔ S3，AWS 同 region 的 S3 免費
- 把傳統 Kafka 最大的帳單項目（60-70% 成本）直接砍到零
- 這是 AutoMQ 對我們這種重度跨 AZ 部署**最大的吸引力**

---

## Slide 30 · 容量與彈性 · 從「預留」到「按用量」

**Layout**: default（彈性圖 + 2 對比卡片）
**時間**: ~1 min

**畫面構成**
- 上：`automq-elastic-capacity.png`（Apache Kafka 固定容量 Wasted >50% vs AutoMQ 彈性容量）
- 下兩張對比卡片：
  - 紅 **Apache Kafka** · Fixed Capacity · Wasted > 50% · local disk 預先配足 peak · scaling 以「小時」計
  - 綠 **AutoMQ** · Elastic Capacity · Pay-as-you-go · S3 近乎無限 · partition 搬移以「秒」計 · Broker 可用 spot · **真正的 auto-scaling**

**口吻提示**
Apache Kafka over-provision 是因為 broker 搬資料需要小時。AutoMQ partition 不綁 local disk，秒級搬移 → 可真正跟著業務彈性 scale。

---

## Slide 31 · 但延遲呢？— 整條鏈路才是重點

**Layout**: default（2 大數字 + Mermaid 鏈路 + win callout）
**時間**: ~2 min · **最重要的伏筆回收**

**畫面構成**
- 上並排兩個大數字：
  - 青 Traditional Kafka (EBS) · **5-50ms** Produce ACK P99
  - 紫 AutoMQ S3Stream · **500ms-2s** Produce ACK P99
- 中 Mermaid：scrape → remote_write → distributor → kafka → consume → ingester → 可查詢。旁邊分支「短期查詢直接走 Prom Query」
- 下方小字：「加上長尾抖動 · 最慢可能 30s 才能查到」
- 底部 win callout **為什麼我們敢接受 10×延遲**：Alert / HPA / KEDA **繼續走 Prom Server**（毫秒級）· Mimir 是「秒級」長期後端 · 業務不受 AutoMQ 延遲影響 · **這是前面保留 Prom Server 的回報**

**口吻提示**（關鍵洞察）
- 很多人看到「500ms–2s」會嚇到
- 但整條鏈路：scrape 15-30s + remote_write batch + Kafka + ingester + 長尾 ≈ 30 秒也正常
- 呼應前面「保留 Prom Server」的伏筆：
  - 短期 / alert / HPA / KEDA 都走 Prom（毫秒）
  - 長期走 Mimir（秒級可接受）
  - 10× 延遲的代價換來跨 AZ 歸零 + 運維解放 + 10× 成本結構差異
- 典型 engineering tradeoff：**知道自己在意什麼，才能做聰明的取捨**

**角色**
把 Slide 13 的伏筆收回來，聽眾會有「啊，那個決策是為了這個」的 aha moment。

---

# §6 成本效能實戰成果

## Slide 32 · 章節過場

**Layout**: section
**時間**: ~15 sec

「成本效能實戰成果」+ 副標「數字說話，數字也認清規模差異」

---

## Slide 33 · 實測效能對比

**Layout**: default（2 欄測試設計 + 4 Stat + info callout）
**時間**: ~1.5 min

**畫面構成**
- 左「測試設計」：同一 production 環境 · 同 tenant · **8 種 query × 6 個時間範圍 = 48 組** · Cache busting · 1h→30d 全覆蓋 · Mimir 勝出 **45 / 48 tests**
- 右 4 張 Stat：**3.4×** 平均加速 · **16.7×** Cross-metric Join 30d · **8.4×** High-cardinality 1h · **6.3×** 長期 30d 查詢
- 底部 info callout：「最反直覺的發現：**長期查詢 Mimir 優勢反而更大**（30d = 6.3×）· 顛覆『Thanos 擅長長期』的迷思」

**口吻提示**
因為 Mimir 的 bucket-index + MQE streaming 讓 30d 查詢記憶體佔用平緩；Thanos 同查詢時 store gateway 會 OOM。

---

## Slide 34 · ~49% 更便宜

**Layout**: fact（全頁 money shot）
**時間**: ~1 min

**畫面構成**
- 超大字：**~49% 更便宜**
- 下：「3 週 AWS 帳單實測」
- 再下：「3.4× 更快 · ~49% 更便宜 · ~6× 性價比」
- 最下方小字：「每家環境量級不同，數字僅供參考 · 我們自己的 annual saving 大約落在**幾十萬美金**量級」

**口吻提示**
講慢，讓數字在空氣中停留。重點不是絕對數字，是「ROI 好到讓我把遷移提案推上去時非常好講」。

---

# §7 下一站 · 可觀測性 2.0?

## Slide 35 · 章節過場

**Layout**: section
**時間**: ~15 sec

「下一站 — 可觀測性 2.0?」+ 副標「PromConf 2026 帶回來的新東西」

---

## Slide 35 · 可觀測性 2.0 的訊號

**Layout**: default（info callout + 2 欄對比）
**時間**: ~1 min

**畫面構成**
- 上 info callout：「把 logs / traces / metrics 全部倒進 data warehouse / data lake，用統一查詢引擎交叉分析」
- 下 2 欄：
  - 青 **支持者（資料庫廠商）**：ClickHouse 大力鼓吹 · AWS Athena 倒進 Iceberg · 核心論點 **columnar 對高基數友善**
  - 紅 **為何不溫不火**：PromQL 生態太大太穩 · SQL ↔ PromQL 轉換成本高 · Dashboards / alerts 綁死 Prom
- 底部：「但 Prometheus 生態**內部**也在吸收 columnar 的好處 → 下一頁」

---

## Slide 36 · PromCon 2026 · Parquet Gateway

**Layout**: default（3 講者卡片 + info callout + Mermaid）
**時間**: ~1.5 min

**畫面構成**
- 上 3 卡片：Grafana Labs **Jesús Vázquez** / AWS **Alan Protasio** / Cloudflare **Michael Hoffmann**
- 中 info callout：「**三大社群聯合發聲** · Cortex · Thanos · Mimir 核心維護者同台 · 宣告下一代 Prometheus 長期儲存共同方向：**Parquet Gateway**」
- 下 Mermaid（Cortex 設計圖）：Ingester → TSDB Blocks → Parquet Converter → Parquet Files (S3) · Query Frontend → Parquet Querier → Parquet Files
- 底部：「Parquet Querier 直讀 S3 · **不再需要 Store Gateway 的 index header**」

**口吻提示**
- 三家同台本身就是 message — 過去是競爭關係，現在合流
- Parquet 格式自帶 row-group index → 省掉 Store Gateway 維護 index header 的角色
- 參考：cortexmetrics.io/docs/proposals/parquet-storage/

---

## Slide 37 · 為什麼 TSDB 不適合 Object Storage?

**Layout**: default（2 欄 first-principles）
**時間**: ~1.5 min

**畫面構成**
- 左 **I/O 經濟學根本差異**：SSD random read ~100μs vs S3 random read ~10-50ms → **差異 100–500×**
- 右 **一個查詢的代價**：紅框 TSDB on S3 = **100+ random GETs** / 綠框 Parquet on S3 = **3–4 sequential reads**
- 底部 win callout：「**Request 數量才是成本，不是 bytes 數量** · GetRange calls ↓90% · 查詢加速 80-90%」

**口吻提示**（first-principles）
- TSDB 為本地 SSD 設計，random read 便宜
- S3 每個 request 都是 HTTP round-trip
- 設計哲學要改：「多讀點 bytes 沒關係，但少發幾次 request」 — columnar + sequential 的威力

---

# 結語

## Slide 38 · 謝謝聆聽

**Layout**: end
**時間**: ~1 min + QA

**畫面構成**
- 大字「謝謝聆聽」
- 副標：「Thanos → Mimir 3.0 → AutoMQ → Parquet?」
- 3 個 takeaway 卡片：
  - 橘 **選型** · 理解瓶頸在哪裡 · 比追新技術更重要
  - 紫 **架構** · Stateless 是 · 運維自由的基礎
  - 青 **心態** · Time-sensitive selection · 永遠在演進
- 下方：「技術選型永遠是 time-sensitive 的」
- 副文：「我們今天的最優解，可能是明天的 legacy · 保持好奇 · 保持懷疑 · 保持實驗」
- 最底：聯絡方式

---

# 補充資訊

## 外部參考

- [Grafana Mimir 3.0 release blog](https://grafana.com/blog/2025/)
- [Grafana 官方影片 Mimir 3.0 Ingest Storage](https://www.youtube.com/watch?v=yabtVakeqc8)
- [KIP-1150 Accepted (Aiven blog)](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead)
- [KIP-1150 Apache Wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-1150:+Diskless+Topics)
- [aiven/inkless (KIP-1150 fork)](https://github.com/aiven/inkless)
- [PromCon 2025 — Beyond TSDB (Parquet)](https://promcon.io/2025-munich/talks/beyond-tsdb-unlocking-prometheus-with-parquet-for-modern-scale/)
- [Cortex Parquet Storage Proposal](https://cortexmetrics.io/docs/proposals/parquet-storage/)
- [AutoMQ architecture](https://www.automq.com/)
- [Thanos Life of a Sample](https://thanos.io/blog/2023-11-20-life-of-a-sample-part-1/)

## 素材清單（對應 Obsidian 筆記）

- `Mimir 3.0 Ingest Storage 架構解析` — Ingest Storage 深度整理（本次撰寫）
- `Mimir 3.0 Ingest Storage vs Classic 設計取捨` — RF 數學、PartitionInstanceRing、AutoMQ 踩坑記錄
- `Mimir 3.0 Enhancement` — MQE streaming + optimization
- `AutoMQ for Kafka vs. Apache Kafka` — AutoMQ 技術/成本/容量對比
- `Thanos to Mimir 3.0 光榮進化` — Diskless Kafka 時間軸
- `Mimir vs Thanos Comprehensive Evaluation Report` — 48 組查詢實測
- `Thanos vs Mimir Store-Gateway：完整架構比較` — 架構細節
- `Promcon 2025 - Beyond TSDB...` — Parquet Gateway 背景

## 圖片資產清單

| 檔名 | 來源 | 用於 Slide |
|------|------|----------|
| mimir3-decouple.png | Grafana 官方 | 18 |
| mimir3-mqe-benchmark.png | Grafana 官方 | 20 |
| mimir3-cpu-before-after.png | 自家 dashboard | 21 |
| mimir3-memory-before-after.png | 自家 dashboard | 21 |
| automq-architecture.png | AutoMQ 官方 | 27 |
| kafka-inter-zone.png | AutoMQ 官方 | 28 |
| automq-zero-zone-router.png | AutoMQ 官方 | 28 |
| automq-elastic-capacity.png | AutoMQ 官方 | 29 |

## 時間分配檢查

| 段落 | 張數 | 累計時間 |
|------|------|---------|
| §1 開場 (1-4) | 4 | 3:00 |
| §2 架構介紹 (5-8) | 4 | 7:45 |
| §3 痛點與選型 (9-13) | 5 | 14:00 |
| §4 Mimir 3.0 (14-21) | 8 | 22:45 |
| §5 Kafka / AutoMQ (22-30) | 9 | 33:30 |
| §6 成本效能 (31-33) | 3 | 36:15 |
| §7 可觀測性 2.0 (34-37) | 4 | 39:45 |
| 結語 (38) | 1 | 40:45 |

留 1-2 分鐘彈性給 pacing / QA。

## 關鍵節奏檢查

整場三個 **money shot** 必須講慢、讓數字落地：
1. **Slide 10** · 「512 GiB / Pod」— 第一次讓聽眾感受到結構性問題
2. **Slide 30** · 「500ms–2s 延遲 · 我們敢接受」— 伏筆回收 · 整場 aha moment
3. **Slide 33** · 「~49% 更便宜」— 投資報酬結論

---

_此大綱版本與 `slides.md` 同步。修改此檔後如要同步到投影片，請告訴 Claude。_
