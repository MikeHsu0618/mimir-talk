# 從 Thanos 到 Mimir 3.0 — 簡報分鏡稿

> **講者**：Mike Hsu
> **場合**：PromConf Taiwan 2026
> **時長**：40 分鐘
> **核心故事**：AI 時代觀測者變 agent → Thanos 垂直撞牆 → 三維度選型 → Mimir 3.0 Ingest Storage → AutoMQ 跨 AZ 歸零 → 延遲伏筆回收 → 成本實測 → Parquet Gateway 的未來

---

## 章節架構

| # | 章節 | 張數 | 預估時間 |
|---|------|-----|---------|
| 1 | 開場 · 動機 | 3 | 3 min |
| 2 | 長期指標後端架構介紹 | 6 | 8 min |
| 3 | Mimir 3.0 架構 | 4 | 7 min |
| 4 | Kafka 選型 — AutoMQ | 7 | 10 min |
| 5 | 成本效能實戰成果 | 3 | 5 min |
| 6 | 下一站 · 可觀測性 2.0 | 3 | 5 min |
| + | 過場章節頁 | 5 | 2 min |
| | **結語** | 1 | 2 min |
| | **合計** | **32 張** | **40 min** |

---

# §1 開場

## Slide 1 · 封面

**Layout**: cover
**時間**: ~30 sec

**畫面構成**
- 超大標題：「從 Thanos 到 Mimir 3.0」
- 副標：「我們如何把可觀測性後端玩到極致」
- 下方寫講者、場合、副標籤（`40 min` / `Mimir 3.0` / `AutoMQ`）

**口吻提示**
自我介紹 + 今天要帶大家走過的路。告訴聽眾這是一份「工程日誌」風格的分享，包含選型思考、踩坑、真實成本數字。

---

## Slide 2 · AI 時代的觀測性衝擊

**Layout**: statement（大字宣告式）
**時間**: ~1 min

**畫面構成**
- 置中大字：「AI 時代下 · 可觀測性基礎設施的全新挑戰」
- 深色漸層背景、無其他元素

**口吻提示**
- 以前 metrics 是給 SRE 早上喝咖啡時看 dashboard 用的
- 現在組織裡越來越多人建立自己的 agent — SRE agent、DB agent、service agent
- 一個人消化資訊的能力有限，AI agent 可以一秒內消化大量資料
- 我們原本的 metrics 基礎設施（Thanos）每天被這些 agent 嚴峻考驗
- 這就是為什麼我們要重新審視整個長期指標後端

**角色**
整場演講的情感起點。讓聽眾「啊對，這是我遇到的問題」。

---

## Slide 3 · 我們面對的量級

**Layout**: default（4 卡片橫排）
**時間**: ~1 min

**畫面構成**
4 個數字卡片並排：
- **17+** Prometheus Clusters
- **~40M** Active Series
- **~1.2M** Samples / sec
- **2 年** Thanos 服役時間

底部一行：「Sportybet 生產環境 · 跨多個 Kubernetes 集群」

**口吻提示**
- 簡短介紹 Sportybet 業務規模
- 2023 年選 Thanos 時它是最成熟的開源方案
- 這個規模讓我們踩到了所有 Thanos 的坑

**角色**
建立 credibility：我們不是在 PoC 上講，是真實 production 血肉經驗。

---

# §2 長期指標後端架構介紹

## [章節過場] Slide 4 · 第一段起頭

**Layout**: section
**時間**: ~15 sec

**畫面構成**
置中大字：「長期指標後端架構介紹」
副標：「先從兩種主流整合模式切入」
左側橘色 6px 指示條

---

## Slide 5 · 為什麼需要長期指標後端？

**Layout**: default（2 欄）
**時間**: ~1 min

**畫面構成**
- 左欄：「Prometheus 本身的限制」
  - 預設本地保留 15 天
  - 單機儲存、單點失敗
  - 無法跨集群統一查詢
- 右欄：「工程師的真實需求」
  - 「上個月的 baseline 是什麼？」
  - 「黑五 vs 平日負載對比」
  - 「SLO 的年度達成率」
  - AI agents 的大量歷史回溯查詢
- 底部置中：「需要一個 **高吞吐 · 低延遲 · 便宜** 的後端」（v-click 最後出現）

**口吻提示**
- 這張快速過，聽眾都懂
- 重點：AI agent 的歷史回溯是**新出現的需求**，跟以往「偶爾查 dashboard」不是同一量級

---

## Slide 6 · 兩種整合模式

**Layout**: default（2 欄 · Mermaid）
**時間**: ~1.5 min

**畫面構成**
- 左欄 **Sidecar Mode** Mermaid：
  ```
  ┌─ Prometheus Pod ─┐
  │ Prometheus ─ Sidecar │
  └──────────────────┘
          ↓ upload
        [S3]
  ```
  下面小字：「Sidecar 寄生於 Prom Pod · 直接上傳 TSDB block」
- 右欄 **Remote-Write Mode** Mermaid：
  ```
  Prometheus → Long-term Backend → S3
  ```
  下面小字：「Prom push 給後端 · 後端負責壓縮與 index」
- 底部：「我們原本用的是 **Sidecar Mode** · 這是個很天才的設計」

**口吻提示**
- Sidecar 是 Thanos 的標誌性設計
- 跟 Cortex/Mimir 的 remote_write 哲學不同
- 兩者各有優缺點，先看 Sidecar 的妙處

---

## Slide 7 · Sidecar 的巧妙之處

**Layout**: default（左 3 欄 Mermaid · 右 2 欄 callout）
**時間**: ~1.5 min

**畫面構成**
- 左側大圖（Mermaid）：
  ```
  Prom 記憶體 in-memory TSDB
       ↓ 每 2h 壓縮
     TSDB Block ─→ Local Disk
            ↘ Sidecar 原封不動 upload
              → S3
  ```
- 右側兩個 callout：
  - **關鍵洞察**：S3 上的 block 和本地 disk **完全一樣**，Sidecar 不做任何運算
  - **對比 Remote-write**：Backend 要解 protobuf → 重新壓縮 → 建 index，等於運算做了兩次
- 底部：「理論上 Sidecar 避免了後端重新壓縮運算的浪費」

**口吻提示**（重要）
- 這張是為了鋪陳「Sidecar 不是笨設計，它有它的巧妙」
- 我們不是盲目換掉 Sidecar，是因為遇到了 Sidecar 架構的結構性問題
- 後面的痛點討論才會有說服力

**角色**
建立「公平」氛圍。先說 Sidecar 的好，再批判才有重量。

---

## Slide 8 · 痛點 ① 短期查詢垂直瓶頸

**Layout**: default（左 3 欄 Mermaid · 右 2 欄 money shot）
**時間**: ~2 min · **money shot 頁**

**畫面構成**
- 左側 Mermaid：
  ```
  Grafana ══▶ Thanos Querier
                ├── 短期 ══▶ Sidecar ⋯ 💥 Prometheus
                └── 長期 ──▶ Store GW → S3
  ```
  下面：「短期查詢的壓力 **全部打回 Prometheus**」
- 右側大數字卡（紅色邊框）：
  ```
  OUR PRODUCTION
      512
     GiB / Pod
  ```
  下面：「Prom + Sidecar 垂直到極限」

**口吻提示**（money shot）
- 512 GiB 聽起來很誇張，但那是我們真實的 production 數字
- 我們的 Prometheus 已經 vertical 到這個程度
- 繼續往下走只剩兩條路：買更大的機器 / 換架構
- 這個數字是我們決定遷移的**第一個導火線**

---

## Slide 9 · 痛點 ② Store Gateway 掙扎

**Layout**: default（左 3 欄 Mermaid fan-out · 右 2 欄要點）
**時間**: ~1.5 min

**畫面構成**
- 左側 Mermaid fan-out：
  ```
  Thanos Querier
    ├→ Store GW-1 ──┐
    ├→ Store GW-2 ──┤
    ├→ Store GW-3 ──┼─→ S3 (所有 tenant 的 blocks)
    └→ Store GW-N ──┘
  ```
  下面：「每個 Store Gateway 都要掃整個 bucket · Querier fan-out 到所有 SG」
- 右側要點：
  - Bucket scan 是 O(all_blocks)
  - Index header 先下載才能查
  - Sharding **靜態**（硬切 relabel）
  - Cache 參數多 · 難調教
- 底部：「→ Mimir 用 per-tenant **Bucket Index** + 動態 sharding 解決這些」

**口吻提示**
- 這段不要深講 11 維度的比較
- 讓聽眾感受：Mimir Store-Gateway 為大規模多租戶設計，Thanos 是從 Prometheus 長出來的
- 兩者的設計前提不同，不是誰對誰錯

---

## Slide 10 · 我們考慮的三條路

**Layout**: default（3 行卡片 + 結論）
**時間**: ~2 min

**畫面構成**
三個選項卡片由上而下：
- **①** 保留 Prometheus Server + 切 remote_write 到 Mimir 🏷 **選這條**
  - 副說明：省掉 Sidecar，Prom Server 繼續扮演 alert / HPA / KEDA 的可靠來源
- **②** 拔掉 Prom Server，改用 Prometheus Agent 🏷 太激進
  - 副說明：所有 query 指向 Mimir，對可靠性要求極嚴苛 — HPA/KEDA 斷線 = 業務掛掉
- **③** 繼續用 Thanos + 補強 🏷 治標
  - 副說明：短期緩解，但結構性問題沒解決
- 底部：「選 ① 的關鍵：Prom Server **單純穩定**，是 alert / autoscaling 的最後防線」

**口吻提示**（重要）
- 我們的選型不是拍腦袋決定
- 特別強調 ② 的風險：HPA/KEDA 依賴 metrics 作決策，metrics backend 不穩 = business 受影響
- 保留 Prom Server 是一個「保險」決策 — 未來想切 Prom Agent，這條路還能走

**角色**
展現選型思考深度。聽眾會對「他真的想過這些選項」產生信任。

---

# §3 Mimir 3.0 架構

## [章節過場] Slide 11 · 第二段起頭

**Layout**: section
**時間**: ~15 sec

**畫面構成**
「Mimir 3.0 架構」+ 副標「Grafana Labs 的新答案」

---

## Slide 12 · Mimir 3.0 的三大賣點

**Layout**: default（官方圖 + 配說明）
**時間**: ~1 min

**畫面構成**
- 置中大圖：Grafana Labs 官方「Mimir 3.0」簡報首頁（黃字：Ingest storage / Mimir query engine；橘色 icons：Enhanced reliability / Improved performance / Lower cost）
- 底部小字：「Ingest Storage · Mimir Query Engine · 全新設計的架構」

**口吻提示**
- 這是 Grafana 官方簡報的第一張
- 三個關鍵字：Reliability / Performance / Cost
- 接下來拆兩個支柱講（Ingest Storage + MQE）

---

## Slide 13 · Ingest Storage — Kafka 化的寫入路徑

**Layout**: default（官方架構圖 + 3 欄 callouts）
**時間**: ~2 min

**畫面構成**
- 上方大圖：Grafana 官方 Ingest storage 架構圖（Distributors → Kafka icon → Ingesters / Queriers）
- 下方 3 欄 callouts：
  - **Distributors** — 無狀態，專注寫入接收與 sharding
  - **Kafka** — 作為寫入的 durable buffer
  - **Ingester** — 變成 Kafka consumer，**從 offset 重建狀態**

**口吻提示**
- 傳統 Mimir 2.x：Distributor 直接 push 到 Ingester (gRPC)，Ingester 有狀態
- 現在：Distributor 只需要 produce 到 Kafka，Ingester 變成 consumer
- Ingester 重啟只要從 Kafka offset 追回，不怕 gap
- 核心：Ingester + Partition 綁定，每個 partition 都是一份完整資料

---

## Slide 14 · Write/Read Path 完全解耦

**Layout**: default（官方圖 + win callout）
**時間**: ~1.5 min

**畫面構成**
- 上方大圖：Grafana 官方「Decoupling write and read paths」圖
  - 左邊 Distributors → Kafka（Write ✅ HEALTHY）
  - 右邊 Kafka → Ingesters（畫叉，Read ✗ UNHEALTHY）
- 底部 callout（v-click）：「設計哲學：**讀取端掛了，寫入端依然健康** — 熱查詢爆炸不再會拖垮寫入」

**口吻提示**
- 這張圖視覺效果很強：Write ✅ / Read ✗
- 傳統 Mimir 2.x：Ingester 同時服務寫入和讀取，heavy query 會打爆 Ingester
- 現在：Write path 只到 Kafka 就結束了
- 對運維的意義：query 端的問題不會變成寫入事件

---

## Slide 15 · Mimir Query Engine (MQE) 效益

**Layout**: default（官方 benchmark 圖 + 2 張數字卡）
**時間**: ~1.5 min

**畫面構成**
- 上方大圖：Grafana 官方 benchmark bar chart — `sum(disk_used_bytes)` 1h query 1000 series
  - 左：Prometheus 954 MB · MQE **75 MB** · Thanos 725 MB
  - 右：Prometheus 6999 ms · MQE **4254 ms** · Thanos 3564 ms
- 下方 2 張數字卡：**92%** Less memory vs Prometheus · **38%** Faster execution

**口吻提示**
- MQE 在 Mimir 3.0 是 default
- 相比舊的 Prometheus engine，streaming execution + optimization framework
- 實際 Grafana Cloud 跑下來 querier peak memory 降 3x、peak CPU 降 80%
- 這個是「遷移後立刻拿到的」好處，不需要做什麼

---

# §4 Kafka 選型 — AutoMQ

## [章節過場] Slide 16 · 第三段起頭

**Layout**: section
**時間**: ~15 sec

**畫面構成**
「Kafka 選型 — AutoMQ」+ 副標「多一個元件，是不是要把自己搞死？」

---

## Slide 17 · 等等，加 Kafka 不就更複雜嗎？

**Layout**: default（疑問 + 定理揭示）
**時間**: ~1 min

**畫面構成**
- 上方小字：「很多人的第一反應：」
- 中央引用框：「原本一個長期指標系統就夠複雜了，現在還要加 Kafka？」
- 底部大字（v-click）：
  - 「答案要從這個定理說起」
  - **L = λ · W** （大字，orange 色，monospace）
  - 「Little's Law · 李式定理」

**口吻提示**
- 我當初跟主管討論時也被問過這個問題
- 加一個元件 = 多一份複雜度，這是直覺
- 但實際上複雜度不會憑空消失，你只是選擇把它放在哪裡
- 李式定理告訴我們：系統吞吐的本質

---

## Slide 18 · 雖然可靠——但真實經驗是...

**Layout**: default（Mermaid 回堵圖 + 2 callouts）
**時間**: ~2 min

**畫面構成**
- 上方 Mermaid（實線＝流入 · 虛線＝回堵）：
  ```
  Prometheus ═══▶ Distributor ═══▶ Kafka ═══▶ Ingester ⚠️(W 變大)
       ↑              ↑              ↑             │
       │ ← queue full ← produce      ← L 堆積 ←───┘
       │                 timeout
       ↓ 🔔
  On-call Alert 暴擊
  ```
- 底部 2 個 callouts：
  - **真實踩坑**（warn）：Kafka consumer 慢（根因其實在下游 Ingester）→ Kafka 堆積 → Distributor produce timeout → Prom queue full → 全環境噴 alert
  - **學到的事**（info）：加 Kafka 不是免費的午餐。你接受了這個複雜度，換來上層的解耦。所以選型要算清楚這筆帳

**口吻提示**（重要 · 誠實調性）
- 這段是我想表達的核心態度：**不盲目推薦**
- 分享真實踩坑：有一次 Kafka consumer 變慢，根因追到 Ingester
- 但當下看到的是「Prom 噴 queue full alert」
- 這種跨元件 debug 是 Kafka 架構的固有複雜度
- 我們接受了，因為換來的好處夠大（下面會講）

**角色**
顯示誠實、不浮誇。工程師聽眾最愛這種真實分享。

---

## Slide 19 · Kafka 的下一個十年

**Layout**: default（左 2 欄要點 + 右小紅書截圖）
**時間**: ~2 min

**畫面構成**
- 左欄：KIP-1150 Diskless Topics 要點
  - 2025/4 提出 · **2026/3/2 正式通過**
  - 9 binding + 5 non-binding votes
  - Confluent / IBM / Aiven / Red Hat 共同背書
  - Broker 變成 stateless，state 下放 object storage
  - aiven/inkless 已有 fork 實作
  - 底部 info callout：「**社群共識**：Kafka 的未來是 cloud-native」
- 右側：小紅書截圖（原圖）— Aiven 的 Josep、Greg 宣告 KIP-1150 通過的貼文

**口吻提示**
- 這張配上小紅書截圖，非常有「真實截圖感」
- 這是 Kafka 社群的重要時刻：連 Apache 官方都承認要往 stateless 走
- AutoMQ 不是一個冒險的選擇，是走在社群共識的前面

**角色**
幫 AutoMQ 做背書。讓聽眾覺得「我們選 AutoMQ 不是賭博」。

---

## Slide 20 · 傳統 Kafka 的三大痛點

**Layout**: default（3 欄卡片）
**時間**: ~1 min

**畫面構成**
三個紅色邊框卡片橫排：
- **① 維運**：Broker 是有狀態的 — Partition data 存本地磁碟，重啟 / 擴縮 / 修復都要搬資料
- **② 水平擴展**：Rebalance storm — 加 broker / 縮 broker 都會觸發大量 partition 遷移
- **③ 跨區流量**：大多數成本來源 — Replication + producer/consumer **跨 AZ 流量費是帳單主角**
- 底部：「重度使用過 Kafka 的朋友會秒懂 — 這三個是 Kafka 帳單上的主要項目」

**口吻提示**（誠實聊成本）
- 第 ③ 項跨區流量通常被低估
- 我們 AWS 帳單上，Kafka 的 cross-AZ data transfer 有時比 EC2 還貴
- 原因：producer-broker / broker-broker replication / broker-consumer 都可能跨 AZ
- 這就是 AutoMQ 最能打的地方

---

## Slide 21 · AutoMQ — Shared Storage 架構

**Layout**: default（Ververica 官方對比圖）
**時間**: ~1.5 min

**畫面構成**
- 置中大圖：Ververica 官方對比
  - 左：**Kafka Shared Nothing**（Broker A/B/C 各自有 local disk，互相 replicate）
  - 右：**AutoMQ Shared Storage**（Broker A/B/C 共用 Object Storage）
  - 三個綠勾：Separation of storage and computation / Zero partition data replication / Low latency solution on s3 (P99 < 10ms)
- 底部：「核心：**Storage 與 Compute 徹底分離** · Broker 變 stateless · P99 < 10ms」

**口吻提示**
- 左邊是傳統 Kafka (Shared Nothing)：每個 broker 有自己的 disk + replication
- 右邊是 AutoMQ (Shared Storage)：所有 broker 共享 object storage
- 核心優勢：
  1. Storage 和 Compute 分離
  2. Zero partition data replication（因為 S3 本身就是多副本）
  3. Low latency on S3（P99 < 10ms）
- Kafka API 100% 相容 — 這是關鍵，不用改 client

---

## Slide 22 · Zero-Zone Router — 跨區流量歸零

**Layout**: default（Zero-Zone Router 原圖 + win callout）
**時間**: ~2 min · **AutoMQ 段高潮**

**畫面構成**
- 置中大圖：automq-zero-zone-router.png（AZ1/AZ2/AZ3 · S3 路由 · Zero Cross AZ Traffic）
- 底部 win callout：「神來一筆的設計 · Producer 寫入 **本地 AZ 的 broker** → 透過 S3 路由到 leader partition → Consumer 從 **本地 AZ 的 readonly replica** 讀取 → 跨 AZ 流量歸零」

**口吻提示**（這頁可以講 2-3 分鐘，分步驟講解）
1. Producer 在 AZ2 寫入，它只需要寫到 AZ2 的 broker（本地）
2. AZ2 的 Rack-aware Router 把資料透過 S3 「路由」給 AZ1（leader partition 所在地）
3. AZ1 從 S3 讀取資料完成寫入
4. 所有其他 AZ 透過 S3 複製拿到 readonly 副本
5. Consumer 在 AZ2 讀取，只需從 AZ2 的 readonly replica 讀（本地）

結果：Producer ↔ Broker / Consumer ↔ Broker 全部 in-AZ
唯一的跨 AZ 流量：broker ↔ S3，而 AWS 同 region 的 S3 是免費的

---

## Slide 23 · 延遲的哲學取捨

**Layout**: default（2 大數字 + 結論 callout）
**時間**: ~1.5 min

**畫面構成**
- 上方兩個並排大數字：
  - 左（青色）：**~50ms** P99 end-to-end · `Traditional Kafka (EBS)`
  - 右（紫色）：**~500ms** P99 end-to-end · `AutoMQ S3Stream`
- 中央：「10 倍延遲差異 — 我們在乎嗎？」
- 底部綠色框：「**長期指標後端不在乎** · Alert / HPA / KEDA 仍然走 Prom Server · Mimir 是秒級的 long-term storage」

**口吻提示**（關鍵洞察）
- 這張呼應前面「為什麼保留 Prom Server」的選型決策
- 關鍵決策鏈條：
  - 保留 Prom Server → 短期查詢走 Prom（毫秒級）
  - 長期查詢走 Mimir → 可以接受 500ms
  - Alert / HPA / KEDA 繼續用 Prom → 業務不受 AutoMQ 延遲影響
- 50ms → 500ms 的代價，換來 10+ 倍成本降低和運維解放
- 典型的 engineering tradeoff：知道自己在意什麼，就能做出聰明選擇

**角色**
把前面的選型伏筆收回來。聽眾會有「啊，那個決策是為了這個」的 aha moment。

---

# §5 成本效能實戰成果

## [章節過場] Slide 24 · 第四段起頭

**Layout**: section
**時間**: ~15 sec

**畫面構成**
「成本效能實戰成果」+ 副標「數字會說話」

---

## Slide 25 · 實測效能對比

**Layout**: default（評估報告截圖 + 4 卡片）
**時間**: ~1.5 min

**畫面構成**
- 上方大圖：評估報告 Executive Summary 表格截圖（Mimir / Thanos / Winner · 3.4x faster / 49% cheaper / Excellent scalability）
- 下方 4 卡片：
  - **3.4×** 平均查詢加速
  - **45/48** 測試項目勝出
  - **16.7×** Cross-metric Join 30d
  - **8.4×** High-cardinality 1h

**口吻提示**
- 8 種 query × 6 個時間範圍 = 48 組測試
- 用 cache busting 確保測真實效能不是 cache hit rate
- 最有趣發現：**長期查詢 Mimir 優勢更大**（30d = 6.3x）
- 完全顛覆「Thanos 擅長長期查詢」的迷思

---

## Slide 26 · 3 週 AWS 成本實測

**Layout**: default（左右並排真實 cost dashboard 截圖）
**時間**: ~1.5 min

**畫面構成**
- 左側：Thanos（紅色邊框）· **$32,525** · cost dashboard 截圖
- 右側：Mimir + AutoMQ（綠色邊框）· **$16,602** · cost dashboard 截圖
- 底部：「Dec 8-28, 2025 · 同一生產環境 · 真實 AWS billing」

**口吻提示**
- 這是 AWS Cost Explorer 的真實截圖，不是編的數字
- Thanos：EC2 instance $18,058（Store Gateway 要大量 compute）
- Mimir：EC2 instance $6,132（MQE + Ingest Storage 的效率）
- Data transfer Mimir 反而高一點 $9,054（因為 Kafka traffic）
- 但整體還是便宜 49%

---

## Slide 27 · 49% 更便宜（Money shot）

**Layout**: fact（全頁 money shot）
**時間**: ~1 min

**畫面構成**
- 超大字：**49% 更便宜**（漸層橘）
- 下方：「年度預估節省 **$254,771**」
- 再下：「**3.4× 更快** · **49% 更便宜** · **6.6× 性價比**」

**口吻提示**（money shot 講慢）
- 這張講的時候要慢，讓數字在空氣中停留
- 補一句：「這個 ROI 讓我把遷移提案推上去時非常好講」

---

# §6 下一站 · 可觀測性 2.0?

## [章節過場] Slide 28 · 第五段起頭

**Layout**: section
**時間**: ~15 sec

**畫面構成**
「下一站 — 可觀測性 2.0?」+ 副標「PromConf 2026 帶回來的新東西」

---

## Slide 29 · 可觀測性 2.0 的訊號

**Layout**: default（info callout + 2 欄對比）
**時間**: ~1.5 min

**畫面構成**
- 上方 info callout：「口號：把 logs / traces / metrics 全部倒進 data warehouse / data lake，用統一的查詢引擎交叉分析」
- 下方 2 欄：
  - **支持者**（資料庫廠商）：ClickHouse 大力鼓吹 · AWS Athena 鼓勵導入 · 核心論點：**columnar 格式**對高基數資料超友善
  - **為何不溫不火**：PromQL 生態太大太穩 · SQL vs PromQL 轉換成本高 · Dashboards / alerts 生態綁死 Prom
- 底部：「但 Prometheus 生態**沒有放棄**這個方向」

**口吻提示**
- 可觀測性 2.0 是 buzzword，但背後有真實技術洞察
- 問題是轉換成本太高，PromQL 生態太大
- 重點：Prom 生態內部也在吸收 columnar 的好處 → 下一張

---

## Slide 30 · PromConf 2026 · Parquet Gateway

**Layout**: default（3 個講者卡片 + info callout）
**時間**: ~1.5 min

**畫面構成**
- 上方 3 卡片橫排：
  - **Grafana Labs** · Jesús Vázquez · Mimir 核心
  - **AWS** · Alan Protasio · Cortex / Amazon Managed Prometheus
  - **Cloudflare** · Michael Hoffmann · Thanos maintainer
- 中間 info callout：「**三大社群聯合發聲** · Cortex · Thanos · Mimir 的核心維護者同台 · 宣告下一代 Prometheus 長期儲存後端的共同方向：**Parquet Gateway**」
- 底部：「用 **Parquet**（columnar format）取代 Prometheus TSDB block · 彌補 TSDB 在 object storage 上的結構性缺陷」

**口吻提示**
- 這個三家同台的畫面本身就是 message
- 過去三個社群是互相競爭的，現在共同發聲
- 起源：Shopify Filip Petkovski 的 Thanos Parquet PoC
- Cloudflare 的 parquet-tsdb-poc 是最早實作
- 最終匯流到 prometheus-community/parquet-common 共享 library

---

## Slide 31 · 為什麼 TSDB 不適合 Object Storage?

**Layout**: default（2 欄 first-principles 分析）
**時間**: ~2 min

**畫面構成**
- 左欄：**I/O 經濟學的根本差異**
  - SSD random read 固定成本：~100μs
  - S3 random read 固定成本：~10-50ms
  - 差異：**100-500×**
- 右欄：**一個查詢的代價**
  - 紅框：TSDB on S3 — **100+ random GETs**
  - 綠框：Parquet on S3 — **3-4 sequential reads**
- 底部：「**Request 數量才是成本**，不是 bytes 數量」

**口吻提示**（first-principles）
- 這是整個 Parquet 故事最核心的 insight
- TSDB 為本地 SSD 設計，random read 便宜
- S3 上每個 request 都是 HTTP round-trip
- 設計哲學要改：「多讀一點 bytes 沒關係，但少發幾次 request」
- 這就是 columnar + sequential read 的威力
- 實測：GetRange calls 減少 90%，查詢加速 80-90%

---

# 結語

## Slide 32 · 謝謝聆聽

**Layout**: end
**時間**: ~1 min + QA

**畫面構成**
- 大字：「謝謝聆聽」
- 下方：「Thanos → Mimir 3.0 → AutoMQ → Parquet ?」
- 3 個 takeaway 橫排：
  - **選型**（橘）：理解瓶頸在哪裡 · 比追新技術重要
  - **架構**（紫）：Stateless 是 · 運維自由的基礎
  - **心態**（青）：Time-sensitive selection · 永遠在演進
- 下方：「技術選型永遠是 **time-sensitive** 的」
- 副文：「我們今天的最優解，可能是明天的 legacy。保持好奇，保持懷疑，保持實驗。」
- 最底：聯絡方式

**口吻提示**
- 三個 takeaway 是整場演講的精華
- "time-sensitive selection" 很重要：2024-2025 選 Mimir 是對的，2027 可能是 Parquet-based 的什麼
- 保持學習、保持懷疑、保持實驗
- QA 時間

---

# 補充資訊

## 外部參考

- [KIP-1150 Accepted (Aiven blog)](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead)
- [KIP-1150 Apache Wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-1150:+Diskless+Topics)
- [aiven/inkless (KIP-1150 fork)](https://github.com/aiven/inkless)
- [PromCon 2025 — Beyond TSDB (Parquet)](https://promcon.io/2025-munich/talks/beyond-tsdb-unlocking-prometheus-with-parquet-for-modern-scale/)
- [Grafana Mimir 3.0 release blog](https://grafana.com/blog/2025/)
- [AutoMQ architecture](https://www.automq.com/)

## 素材清單（對應 Obsidian 筆記）

- `Thanos to Mimir 3.0 光榮進化` — 主文
- `Mimir 3.0 Enhancement` — Mimir 3.0 深度解析
- `Mimir 3.0 Ingest Storage vs Classic 設計取捨` — 選型細節
- `Mimir vs Thanos Comprehensive Evaluation Report` — 效能成本實測
- `Thanos vs Mimir Store-Gateway：完整架構比較` — 架構細節
- `Promcon 2025 - Beyond TSDB...` — Parquet Gateway 背景

## 圖片資產清單

| 檔名 | 來源 | 用於 Slide |
|------|------|----------|
| mimir3-3benefits.png | Grafana 官方 | 12 |
| mimir3-ingest-storage.png | Grafana 官方 | 13 |
| mimir3-decouple.png | Grafana 官方 | 14 |
| mimir3-mqe-benchmark.png | Grafana 官方 | 15 |
| kip1150-xiaohongshu.png | 小紅書 @Aiven | 19 |
| automq-shared-storage.png | Ververica 官方 | 21 |
| automq-zero-zone-router.png | AutoMQ 官方 | 22 |
| eval-summary.png | 自家評估報告 | 25 |
| cost-thanos.png | AWS Cost Explorer | 26 |
| cost-mimir.png | AWS Cost Explorer | 26 |

## 時間分配檢查

| 段落 | 累計時間 |
|------|---------|
| 開場 (1-3) | 3:00 |
| 架構介紹 (4-10) | 11:00 |
| Mimir 3.0 (11-15) | 17:15 |
| Kafka/AutoMQ (16-23) | 28:45 |
| 成本效能 (24-27) | 34:15 |
| 可觀測性 2.0 (28-31) | 39:30 |
| 結語 (32) | 40:30 |

留 1-2 分鐘彈性給 pacing / QA。

---

_此大綱版本與 `slides.md` 同步。修改此檔後如要同步到投影片，請手動更新 `slides.md` 或告訴 Claude。_
