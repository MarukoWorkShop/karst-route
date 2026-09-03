import type { RouteId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { overlayReviews, reviewRouteId } from "@/content/reviews";

const L = (en: string, zh: string): Tx => ({ en, zh });

export type TravelerReview = {
  id: string;
  flag: string;
  name: string;
  country: string;
  route: Tx;
  rating: number;
  short: Tx;
  full: Tx;
  date: string;
  photos: string[];
};

const r1 = L("Route 1 · 14 days", "路线一 · 14日");
const r2 = L("Route 2 · 10 days", "路线二 · 10日");

const fallbackReviews: TravelerReview[] = [
  {
    id: "lin",
    flag: "🇨🇳",
    name: "林 晓燕",
    country: "上海",
    route: r1,
    rating: 5,
    date: "2024-11",
    short: L(
      "Thoughtfully arranged, excellent guide — the whole trip exceeded expectations.",
      "行程安排得非常用心，向导很专业，整个旅途超出预期。",
    ),
    full: L(
      "Our family of four tried a cross-border journey for the first time — we were nervous before departure. But from the airport pickup on day one, every detail was handled. Our Vietnam guide was incredibly engaging; even the kids loved it. It rained lightly at Detian Falls and the bamboo rafting felt even more atmospheric for it. The old courtyard guesthouse in Jianshui was unforgettable — the tofu soup at breakfast was the best meal of the whole trip. Highly recommended for families.",
      "我们一家四口第一次尝试跨境自驾游，出发前非常忐忑。但从第一天的接机开始，每个细节都被安排得妥妥当当。越南段的向导小明讲解特别生动，孩子们也很喜欢。德天瀑布那天下了点小雨，竹筏漂流更有感觉。最后在建水住的那家老宅客栈让人印象深刻，早餐的豆腐脑是全程最好吃的一顿。强烈推荐有小孩的家庭！",
    ),
    photos: [
      asset("/destinations/chongzuo.jpg"),
      asset("/destinations/jianshui.jpg"),
      asset("/destinations/hotel-a.jpg"),
      asset("/destinations/nanning.jpg"),
    ],
  },
  {
    id: "michelle",
    flag: "🇸🇬",
    name: "Michelle T.",
    country: "Singapore",
    route: r2,
    rating: 5,
    date: "2025-01",
    short: L(
      "The border crossing was seamless, and our guide's knowledge of local history was remarkable.",
      "过境出乎意料地顺利，向导对当地历史的了解令人佩服。",
    ),
    full: L(
      "I thought the border crossing would be complicated, but the guide handled everything. The Sapa morning was the trip's highlight — trekking through mist felt like stepping into another world. I got addicted to Vietnamese coffee and have been sourcing beans to recreate it at home. Exceptional value overall. I'll recommend this to every friend who wants a deep travel experience.",
      "我以为跨境会很麻烦，但向导处理了一切。沙坝的早晨是整个旅程的亮点——我们在迷雾中徒步，感觉就像走进了另一个世界。越南咖啡让我上瘾了，已经在网上找了好几种豆子回来复刻。总体上性价比极高，会推荐给所有想要深度游的朋友。",
    ),
    photos: [
      asset("/destinations/sapa.jpg"),
      asset("/destinations/hanoi.jpg"),
      asset("/destinations/catba.jpg"),
    ],
  },
  {
    id: "james",
    flag: "🇬🇧",
    name: "James R.",
    country: "London",
    route: r1,
    rating: 5,
    date: "2024-10",
    short: L(
      "Genuinely one of the best-organised trips I've taken. The overnight train from Sapa was a highlight.",
      "组织得极好。沙坝出发的过夜火车是亮点。",
    ),
    full: L(
      "I've travelled extensively, but the logical design of this itinerary stood out — it doesn't just string sights together, it tells a story from coast to plateau. The overnight metre-gauge train was an unexpected joy. Watching mountains through the window from a swaying bunk, everything slows down. The Yunnan section was my personal favourite — Jianshui's streets at 6am have an uncanny quiet.",
      "我去过很多地方，但这次路线设计的逻辑感让我印象深刻——它不是简单地把景点串起来，而是真的讲了一个从沿海到高原的故事。夜间米轨火车是意外之喜，在摇晃的卧铺上看窗外的山，整个人都慢下来了。云南段是我个人最喜欢的部分，建水的街道在清晨六点有一种不可思议的安静。",
    ),
    photos: [
      asset("/destinations/train.jpg"),
      asset("/destinations/sapa.jpg"),
      asset("/destinations/jianshui.jpg"),
      asset("/destinations/kunming.jpg"),
    ],
  },
  {
    id: "sarah",
    flag: "🇦🇺",
    name: "Sarah K.",
    country: "Melbourne",
    route: r2,
    rating: 5,
    date: "2025-02",
    short: L(
      "The food experiences alone were worth the trip. Our guide knew every hidden gem.",
      "光是吃就值回票价。向导知道每一处藏着的好店。",
    ),
    full: L(
      "As a food traveller, this route delivered completely. In every city, a local guide took us to the real places — not influencer restaurants, but the street corner stalls, the morning market, the elderly woman's home kitchen. The snail vermicelli in Ninh Bình was prepared in a way I've never seen in any recipe. This trip made me start learning Vietnamese seriously.",
      "作为一个美食旅行者，这条路线完全满足了我的期待。每一个城市都有当地向导带我们去「真正的」地方——不是网红餐厅，而是街角的小摊、菜市场、老奶奶家里的灶台。宁平的田螺米线是我从来没有在任何食谱上见过的做法。这趟旅行让我开始认真学越南语了。",
    ),
    photos: [
      asset("/destinations/hanoi.jpg"),
      asset("/destinations/puzhehei.jpg"),
      asset("/destinations/mile.jpg"),
    ],
  },
  {
    id: "markus",
    flag: "🇩🇪",
    name: "Markus H.",
    country: "München",
    route: r1,
    rating: 5,
    date: "2024-12",
    short: L(
      "Perfect organisation, authentic experiences. The border crossing was surprisingly smooth.",
      "组织严谨，体验真实。过境出乎意料地顺畅。",
    ),
    full: L(
      "Germans value precision in travel planning — this trip met my standards completely, and then surpassed them. Every pickup was on time, no confusion ever arose. What made it remarkable was the warmth behind the efficiency — our guide explained local customs, helped us connect with villagers, gave us genuine human warmth rather than just sightseeing. The Ha Long Bay sunset was the most beautiful I've seen in my life.",
      "德国人向来注重行程的严谨性，这次旅行完全符合我的标准，甚至超出了。每天的接送时间精准，没有一次出现混乱。更难得的是，这种高效率背后不失人情味——向导会主动介绍当地风俗，帮我们和村民沟通，让我们感受到了真实的人文温度，而不只是走马观花。下龙湾的日落是我此生见过最美的。",
    ),
    photos: [
      asset("/destinations/catba.jpg"),
      asset("/destinations/nanning.jpg"),
      asset("/destinations/chongzuo.jpg"),
    ],
  },
  {
    id: "tanaka",
    flag: "🇯🇵",
    name: "田中 美咲",
    country: "東京",
    route: r2,
    rating: 5,
    date: "2025-03",
    short: L(
      "The guide's care and professionalism moved me. Sapa's terraces will stay with me forever.",
      "向导的细心和专业让我非常感动，沙坝的梯田让我终生难忘。",
    ),
    full: L(
      "Three months have passed since the trip ended, but I still think about that Sapa morning — clouds rising from the valley, the terraces lighting up one layer at a time. Our guide brought us to a viewpoint with no other tourists, saying it was his secret spot. Because of moments like that, the whole journey felt like being genuinely cared for. I will definitely return.",
      "旅行结束后已经过去了三个月，但我还是会时常想起沙坝那个清晨——云从山谷里升起来，梯田在光里一层一层地亮起来。向导阿伟提前带我们去了一个没有其他游客的观景点，说那是他的私藏。正因如此，整个旅程有一种被善待的感觉。一定会再来。",
    ),
    photos: [
      asset("/destinations/sapa.jpg"),
      asset("/destinations/guantang.jpg"),
      asset("/destinations/jianshui.jpg"),
      asset("/destinations/puzhehei.jpg"),
    ],
  },
  {
    id: "camille",
    flag: "🇫🇷",
    name: "Camille D.",
    country: "Paris",
    route: r1,
    rating: 5,
    date: "2024-09",
    short: L(
      "A trip that truly changes your perspective. The Yunnan villages are magnificent.",
      "真正改变视角的一趟。云南的村子美得安静。",
    ),
    full: L(
      "The French can be particular about travel quality — but this trip gave me nothing to complain about. Jianshui's streets reminded me of certain towns in southern France, carrying that sense of layered time. The guide took us to a working pottery workshop where I even tried the wheel myself. The French traces in Vietnam also felt strangely familiar — those old cafés and streets recalled a history I'd half-forgotten.",
      "法国人对旅行品质有些苛刻，但这次我没有任何可以抱怨的。建水古城的街道让我想起了某些南法小城，有一种时间感。当地向导带我们参观了一个正在进行手工陶器制作的工作坊，我甚至动手试了一下。越南段的法式痕迹也让我觉得亲切——那些旧咖啡馆和街道让我想起了一段被遗忘的历史。",
    ),
    photos: [
      asset("/destinations/jianshui.jpg"),
      asset("/destinations/mile.jpg"),
      asset("/destinations/kunming.jpg"),
    ],
  },
  {
    id: "david",
    flag: "🇺🇸",
    name: "David & Laura",
    country: "New York",
    route: r2,
    rating: 5,
    date: "2025-01",
    short: L(
      "We've done group tours before — this private experience is on a completely different level.",
      "以前走过团队游，这次私团完全是另一个层级。",
    ),
    full: L(
      "We've done group tours before and always came home feeling we'd seen nothing properly. This was completely different — being private meant we could linger anywhere, and the guide was willing to go much deeper into every story. The Tianqin performance in Longzhou was in an actual Zhuang village, not a tourist stage. That kind of experience is priceless. Since returning to New York, I've recommended this trip to at least seven friends.",
      "我们以前参加过很多团队游，回来后总觉得走马观花。这次完全不同——因为是私家团，我们可以在任何一个地方多待一会儿，向导也更愿意讲深入的故事。龙州的天琴表演是在一个真实的壮族村落里看的，不是为游客特别安排的舞台。那种体验是无价的。回到纽约以后，我把这段旅行推荐给了至少七个朋友。",
    ),
    photos: [
      asset("/destinations/guantang.jpg"),
      asset("/destinations/chongzuo.jpg"),
      asset("/destinations/catba.jpg"),
      asset("/destinations/sapa.jpg"),
    ],
  },
];

export const travelerReviews = overlayReviews(fallbackReviews);

/** 全站聚合评分（用于信任条与首屏社会证明） */
export const reviewStats = {
  count: travelerReviews.length,
  average:
    travelerReviews.reduce((sum, r) => sum + r.rating, 0) / travelerReviews.length,
};

/** 某条路线下的全部评价（用于路线卡片显示评价条数） */
export function reviewsForRoute(routeId: RouteId): TravelerReview[] {
  return travelerReviews.filter((r) => reviewRouteId(r) === routeId);
}
