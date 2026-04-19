這是針對 ./OUTLINE.md 的一些建議，你會先去完全讀取再去交叉對照我這邊的建議

# 建議

Side1
副標 可以寫個跟 AI 有關的動機 讓人反思到在神奇的 AI 世界中運作的依然是這些重要的基礎設施

Slide2 這邊我可能下面講完一些跟 ai agent 有關的前後對比之後下一頁我會放幾個我們公司 SRE agent 的實際影片

所以你可以幫我預留一個位置在這邊 放完我會在講說 這只是開始 以後會有更多的 agent 來幫助我們的 SRE 團隊 並且使用人數還沒有完全飽和

所以提前預知未來的趨勢是很重要的

現在的 Slide3 這邊可以呈現一些我們目前的數據
我們實際的量級是 40個 eks clsuter 最高峰時 1.2億的 active series 然後 Samples / sec 大概是 8M samples/sec

這邊稍微可以講一下 active series 的重要性
```
為什麼是 active series 而不是別的?
1. Ingester 記憶體 ∝ active series,基本上是線性關係
每條 active series 在 ingester 裡要維護:

TSDB head chunk — 未壓縮的最近 sample,~1-2 小時的 raw data
In-memory index — postings list(label → series ID 的倒排索引),是 PromQL 查詢快的根本
Labels 本身 — 每條 series 的完整 label set,label 愈長愈多愈吃記憶體
Symbol table / string interning — 雖然有 dedup,但 high cardinality 下還是會膨脹

Mimir 經驗值大約 8 KB/series(Grafana 官方文件的數字),但實際會飄在 5-15 KB 之間,取決於 label 長度、chunk 壓縮效率、是否啟用 native histograms 等。

Mimir ingester 每條 series 大約吃 8 KB 記憶體。以 1.2 億 series 來算:
120M × 8 KB ≈ 960 GB
```

儲存時間 365 天
服役時間三年
不需要提到 sportybet 但可以說當時 Thanos 是看起來最適合的開源選擇（因為有 sidecar mode）

Slide5 這邊也要講一下 單體式的瓶頸 或者可以簡單講一下同樣的一個一個月查詢量級 所需要用的 memory 跟 storage cost 的差異
可能可以幫助大家更直觀的理解為什麼我們會想要使用長期後端指標系統


Slide6
這邊圖可以一個大圖 同時顯示 sidecar 跟 remote write 的架構圖 讓大家可以一眼看出兩者的差異
這篇可以給你很多素材包括架構圖 
https://thanos.io/blog/2023-11-20-life-of-a-sample-part-1/

Slide8 前面可能要稍微講一下我們現在要講痛點 這邊痛點感覺可以分類為現有架構短期查詢跟長期查詢的問題 
我們單一台 prometheus 目前已經來到來到 512Gi 的 node 才裝的下
其中有一部分的記憶體是 thanos sidecar 所佔用，因為 thanos 在 query 短期資料內會透過 sidecar 來呼叫 Prometheus 的 remote-read API 來取得資料，雖然這樣可以減少對 Prometheus 的直接查詢壓力，但代表壓力會回到 thanos sidecar 身上。
所以我們也需要分配幾十 Gi 的記憶體給 thanos sidecar 來處理這些查詢請求，這也是為什麼我們會需要一台 512Gi 的 node 來裝載這個 Prometheus 實例的原因之一。
可以了解到他就是放大垂直擴展的瓶頸了，因為他需要一台超大記憶體的 node 來裝載這個 Prometheus 實例，這樣的架構在成本上是非常昂貴的。
這邊有很好的參考
https://github.com/thanos-io/thanos/blob/main/docs/components/sidecar.md

Slide9 這邊可以講一下我們在查詢長期資料的時候會遇到的問題
長期查詢看重的是 store gateway 這個元件，因為 thanos 在 sharding 和 caching 上面的設計是比較簡單的，所以在面對大量的查詢請求的時候，store gateway 就會成為瓶頸，因為 store gateway 需要處理所有的查詢請求，並且需要從 object storage 中讀取資料來回應這些請求，這樣就會導致 store gateway 的負載非常高，甚至可能會導致 store gateway 崩潰。

Slide10 感覺這邊我們已經找到好幾種決策維度了 感覺可以列出一些排列組合
像是 sidecar vs remote write -> 緩解垂直擴展瓶頸
thanos vs mimir -> 長期查詢考量
prometheus server vs prometheus agent -> 要不要把 Prometheus server 轉成可以水平擴展的 agent 來徹底根除垂直擴展的瓶頸，這取決於我們對於 Thanos/Mimir 的延遲 穩定性 可靠性的要求 因為 HPA/KEDA 還有 Alert evaluation 都需要-> 這個維度我覺得單獨拉出來在前面一個頁來講

這頁大概就是把前面的三個維度都先介紹之後，我們再把排列組合列出來，並稍微講解一下最終我們的決策為何。

是這樣走：選 Mimir，但是又選 Prometheus Server 再加 Remote Write 的機制。

然後可以把它講成一個很簡單的刪去法：我們把不需要的選項都去掉之後，剩下的那幾個就是跟我們要的正確答案最接近的。

Slide11
這邊可以講說，我們會考慮 Mimir 還有另外一個原因，就是因為它剛推出 Mimir 3.0 的架構。

這也是 Grafana Labs 對於 LGTM（Loki、Mimir、Tempo）這三個主要儲存後端的未來架構走向，同時還提供了很多強化。所以比起目前稍微萎靡不振的 Thanos 社群，Mimir 顯得更積極、野心更蓬勃。

Slide12 這邊不需要用那張圖片 那圖片內容蠻單純的 你可以用文字跟排版更好表達出來

Slide13~14
這邊就來講一下 mimir3.0 的強大之處 
你可以從我 obsidian 的 `Mimir 3.0 Ingest Storage 架構解析` 找到很多素材 把他們變成簡報
我這邊已經不用管要多少 slide 了 我這次 review 就是重新編排

接下來我還有寫個 `Mimir 3.0 Ingest Storage vs Classic 設計取捨` 這篇在講 mimir 2.0 為了可用性而做的一些設計取捨，然後在 mimir 3.0 又是怎麼樣去解決這些問題的，這篇文章也有很多素材可以用來做簡報
後面有個 table 就是在講說用了 RF 3 * 3 zone 一筆資料就要寫三次然後還要在三個 zone 上面都做一樣的事情 基本上就是為了可用性壟於到極致的設計取捨，然後在 mimir 3.0 就是說我們不再追求 RF 3 * 3 zone 的極致可用性，而是改成 RF 2 * 2 zone 的設計，然後在這個基礎上去做一些優化來提升可用性，這樣就可以大幅降低寫入的成本，同時還能夠提升整體系統的效能。

下一頁我就放個 ingester cpu/memory 實際降下來的 dashboard 截圖

Slide16
這邊可以先不用講到 automq 感覺 因為我是接著 mimir3.0 才講到 kafka 然後我下一頁會說一下 kafka 也沒那麼神奇

Slide17~18
這邊可以講一下加入 kafka 後會影響很多人的惡夢 以及維運上的難度 加上整條分佈式鏈路的 backpressure 這邊可以用秀一下李氏定理
就可以稍微講一下 kafka 不是永遠都是低延遲的 只要他超為在 rebalance 或者是 partition 的 leader 發生變化的時候，或者是說當我們的 consumer 的處理能力跟 kafka 的寫入能力不匹配的時候，就會導致整條鏈路的 backpressure，這樣就會導致整個系統的延遲飆升，甚至可能會導致整個系統崩潰。
這些都是日常維運中會遇到的問題，所以在決定要不要加入 kafka 的時候，我們也需要考慮到這些因素，並且做好相應的準備來應對這些問題。

Slide19 這邊可以寫個 我們對於 Kafka 未來五年的展望
這邊可以先提一下 kafka 的 diskless 之爭最近剛出爐了
然後我又提供了一張圖片可以很好的闡述這場 kafka 未來路線之爭的時間線 `Thanos to Mimir 3.0 光榮進化-{{date}}-3.png`
你可以直接把他變成更好的文字排版

slide20~22 我們的選擇 AutoMQ Kafka
這邊是在介紹 automa kafka 順便解釋為何我們選擇他 而且我發現我原本要給你的素材我忘記貼在 obsidian 上面了導致你那邊的內容很空洞
我現在要你重新編排這整個章節 你直接參考 obsidian 這個文章 `AutoMQ for Kafka vs. Apache Kafka`

slide23 
這邊的延遲不只要講 kafka 的延遲還要考慮到整條鏈路的延遲，從 Prometheus server 端的 remote write API 開始，到 Mimir ingester 寫入完成，這中間的延遲可能會受到很多因素的影響，包括網路延遲、kafka 的處理能力、Mimir ingester 的寫入能力等等，所以在這邊我們也需要考慮到整條鏈路的延遲，而不僅僅是 kafka 的延遲。
傳統 disk kafka 可以把延遲壓到 5-50ms 左右 automq 的 s3stream 大概是 500ms-2s 左右，這邊的差異也是很明顯的，所以在選擇 automq 的時候，我們也需要考慮到這些因素，並且做好相應的準備來應對這些問題。
這樣考慮進去原本 prometheus remotewrite 到 distributor 在到 kafka 在被 ingestor 消費到可以被讀取的這段時間 外加長尾抖動可能有些指標要被 scrap 後 30秒 左右才會被讀取到，這也是為什麼我們保留 prometheus server 的原因之一，因為我們還是需要一個可以快速讀取短期資料的機制來應對這些延遲問題。

slide24 這邊就是我們的實際的轉換成果 
slide25 那個成本圖太詳細了就不用貼出來看了
slide26 那個數值就大概表達一年節省幾十萬就好 這邊都不是太大的重點 因為每個公司的真實環境規模不太一樣 僅供參考

slide30 
可以下面有點空可以補一下 cortex 對於這項架構的設計 並且好像表達可以省略 store gateway 維護 index header 的角色
因為 parquet gateway 的設計是說他不需要維護 index header 的角色，因為他是直接把資料轉換成 parquet 格式存儲在 object storage 中，然後在查詢的時候直接從 object storage 中讀取 parquet 文件來回應查詢請求，這樣就可以省略掉 store gateway 維護 index header 的角色，這也是 parquet gateway 的一個優勢，因為這樣就可以減少 store gateway 的負載，並且提升整體系統的效能。
https://cortexmetrics.io/docs/proposals/parquet-storage/
```
┌──────────┐    ┌─────────────┐    ┌──────────────┐
│ Ingester │───>│   TSDB      │───>│   Parquet    │
└──────────┘    │   Blocks    │    │  Converter   │
                └─────────────┘    └──────────────┘
                                          │
                                          v
┌──────────┐    ┌─────────────┐    ┌──────────────┐
│  Query   │───>│   Parquet   │───>│    Parquet   │
│ Frontend │    │   Querier   │    │    Files     │
└──────────┘    └─────────────┘    └──────────────┘
```

slide32 這個內容可以根據我新的簡報內容重新編排，因為我現在的簡報內容已經不是完全按照這個大綱走了，所以這個章節的內容也需要重新編排一下，讓他更符合現在的簡報內容。