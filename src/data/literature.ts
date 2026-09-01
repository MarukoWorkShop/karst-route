import type { Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

export type LitWork = {
  id: string;
  type: "book" | "film";
  cover: string;
  title: Tx;
  creator: Tx;
  year: string;
  location: Tx;
  desc: Tx;
  googleQuery: string;
};

/** Pinned on the homepage Arts & Literature preview, in this order. */
export const HOME_LIT_IDS = ["the-lover", "indochine-1992", "green-papaya"] as const;

export const literaryWorks: LitWork[] = [
  {
    id: "asian-godfathers",
    type: "book",
    cover: asset("/literature/asian-godfathers.jpg"),
    title: L("Asian Godfathers", "亚洲教父"),
    creator: L("Joe Studwell", "乔·斯塔威尔"),
    year: "2007",
    location: L("South China · Hong Kong · Southeast Asia", "华南 · 香港 · 东南亚"),
    desc: L(
      "Grove Press: Hong Kong and Southeast Asia are home to five hundred million people, yet their economies are dominated by only fifty families — banking, real estate, shipping, sugar. After fifteen years reporting in the region, Studwell portraits the tycoons and the political-economic world they inhabit.",
      "Grove 出版社简介：香港与东南亚约五亿人口，经济却由约五十个家族主导，生意从银行、地产到航运、蔗糖。斯塔威尔在该地区做了十五年记者，写这些巨头如何起家、如何维持财富，以及他们所处的政治经济环境。",
    ),
    googleQuery: "Asian Godfathers Joe Studwell",
  },
  {
    id: "dragon-asean",
    type: "book",
    cover: asset("/literature/dragon-asean.jpg"),
    title: L("The Dragon in the ASEAN House", "东盟大厦中的巨龙"),
    creator: L("Political economy · China & ASEAN", "政治经济纪实 · 中国与东盟"),
    year: "2020",
    location: L("Vietnam · China · ASEAN", "越南 · 中国 · 东盟"),
    desc: L(
      "Yale University Press, on Sebastian Strangio’s In the Dragon’s Shadow: Southeast Asia stands uniquely exposed to China’s rise — three nations border China, five are directly affected by South China Sea claims. Drawing on a decade of reporting, he examines how the region is responding.",
      "耶鲁大学出版社《龙影之下》简介：东南亚三国与中国接壤，五国直接受到南海主张影响，全部处在中国经济、政治与军事影响的延长阴影中。记者斯特兰吉奥根据十余年实地报道，考察各国如何回应。",
    ),
    googleQuery: "The Dragon in the ASEAN House Vietnam China relations",
  },
  {
    id: "quiet-american",
    type: "book",
    cover: asset("/literature/quiet-american.jpg"),
    title: L("The Quiet American", "静静的越南人"),
    creator: L("Graham Greene", "格雷厄姆·格林"),
    year: "1955",
    location: L("Vietnam · Hanoi", "越南 · 河内"),
    desc: L(
      "Penguin: Greene’s classic exploration of love, innocence and morality in Vietnam. Alden Pyle, a young idealist, is sent to Saigon on a mysterious mission while the French Army fights the Vietminh; cynical reporter Fowler finds he cannot remain an observer. First published in 1955.",
      "企鹅经典版简介：格林对爱情、天真与道德的探索。年轻理想主义者派尔被派往西贡执行秘密任务，法军正与越盟交战；愤世的英国记者福勒无法再袖手旁观。1955 年出版。",
    ),
    googleQuery: "The Quiet American Graham Greene",
  },
  {
    id: "the-lover",
    type: "book",
    cover: asset("/literature/the-lover.jpg"),
    title: L("The Lover", "情人"),
    creator: L("Marguerite Duras", "玛格丽特·杜拉斯"),
    year: "1984",
    location: L("French Indochina · Mekong", "法属印度支那 · 湄公河"),
    desc: L(
      "Penguin Random House: set in the prewar Indochina of Duras’s childhood, a tumultuous affair between an adolescent French girl and her Chinese lover. In spare, luminous prose she evokes life on the margins of Saigon in the waning days of the colonial empire. Winner of the Prix Goncourt.",
      "午夜出版社 1984 年出版，同年获龚古尔文学奖。带有自传色彩：法属印度支那，十五岁的贫穷法国少女与华裔富商在湄公河渡船上相遇。杜拉斯以极简而发光的笔触，写出西贡边缘的殖民末世。",
    ),
    googleQuery: "The Lover Marguerite Duras",
  },
  {
    id: "indochine-1992",
    type: "film",
    cover: asset("/literature/indochine.jpg"),
    title: L("Indochine (1992)", "印度支那"),
    creator: L("Dir. Régis Wargnier", "雷吉斯·瓦格涅 导演"),
    year: "1992",
    location: L("Vietnam · Ha Long Bay", "越南 · 下龙湾"),
    desc: L(
      "French period drama set in colonial Indochina from the 1930s to the 1950s: Éliane Devries, a rubber-plantation owner, and her adopted Vietnamese daughter Camille, against the rise of Vietnamese nationalism. Much of the film was shot in Ha Long Bay. Winner of the Academy Award for Best Foreign Language Film.",
      "1992 年法国史诗剧情片，背景为 1930–1950 年代的法属印度支那。橡胶园主伊莲与她收养的越南女儿卡蜜儿，在民族独立浪潮中的命运。大量实景取自下龙湾。获第 65 届奥斯卡最佳外语片。",
    ),
    googleQuery: "Indochine 1992 film Catherine Deneuve",
  },
  {
    id: "green-papaya",
    type: "film",
    cover: asset("/literature/green-papaya.jpg"),
    title: L("The Scent of Green Papaya", "青木瓜之味"),
    creator: L("Dir. Trần Anh Hùng", "陈英雄 导演"),
    year: "1993",
    location: L("Vietnam · Hanoi house aesthetics", "越南 · 河内生活美学"),
    desc: L(
      "Cannes Caméra d’Or, 1993: a Vietnamese servant girl, Mùi, observes life in two Saigon families — a textile seller’s household, then a young pianist’s. Trần Anh Hùng’s debut attends to the tones, colours and daily gestures of a vanishing world. Nominated for the Academy Award for Best Foreign Language Film.",
      "陈英雄首部长片。乡下来的少女梅进入西贡人家做佣，静静观察两户人家的日常。影片关注光、色、气味与生活细微之处。1993 年戛纳金摄影机奖，并获奥斯卡最佳外语片提名。",
    ),
    googleQuery: "The Scent of Green Papaya Tran Anh Hung",
  },
  {
    id: "sapa-mists",
    type: "book",
    cover: asset("/literature/sapa-mists.jpg"),
    title: L("Sapa: In the Mists of Vietnam", "沙坝：在越南的迷雾中"),
    creator: L("Ethnography · photography", "人文纪实 · 摄影集"),
    year: "",
    location: L("Vietnam · Sapa hill station", "越南 · 沙坝高山避暑地"),
    desc: L(
      "Sa Pa was laid out as a French hill station in the early twentieth century: a sanatorium in 1909, a garrison in 1912, and nearly 300 villas after the Hanoi–Lào Cai railway opened in 1920. The highlands are home mainly to Hmong, Dao, Tày and Giáy communities. The Area of Old Carved Stone in Sapa has been on Vietnam’s UNESCO tentative list since 1997.",
      "二十世纪初，沙坝被建成法属高山避暑地：1909 年疗养院，1912 年驻军，1920 年河内—老街铁路通车后别墅近三百座。山地居民以苗、瑶、岱、仲等族群为主。沙坝古岩画区自 1997 年起列入越南世界遗产预备名单。",
    ),
    googleQuery: "Sapa ethnography French colonial hill station",
  },
  {
    id: "south-china-karst",
    type: "book",
    cover: asset("/literature/south-china-karst.jpg"),
    title: L("South China Karst UNESCO", "中国南方喀斯特世界遗产"),
    creator: L("UNESCO World Heritage", "联合国教科文组织世界遗产"),
    year: "2007",
    location: L("China · Guangxi · Chongzuo", "中国 · 广西 · 崇左"),
    desc: L(
      "UNESCO: one of the world’s most spectacular humid tropical-to-subtropical karst landscapes. The serial property spans Guizhou, Guangxi, Yunnan and Chongqing — tower karst (fenglin), pinnacle karst (shilin), cone karst (fengcong), plus gorges, natural bridges and large caves. Inscribed in 2007, extended 2014.",
      "联合国教科文组织：全球湿热热带—亚热带喀斯特最壮观的范例之一。遗产地跨贵州、广西、云南与重庆，涵盖峰林、石林与峰丛，以及峡谷、天生桥与大型洞穴。2007 年列入世界遗产，2014 年扩展。",
    ),
    googleQuery: "South China Karst UNESCO World Heritage",
  },
  {
    id: "xu-xiake",
    type: "book",
    cover: asset("/literature/xu-xiake.jpg"),
    title: L("The Travels of Xu Xiake", "徐霞客游记国际版"),
    creator: L("Xu Xiake", "徐霞客"),
    year: "1641",
    location: L("China · Chongzuo / Nanning karst", "中国 · 崇左 / 南宁喀斯特"),
    desc: L(
      "Dictionary of Geotourism (Springer): a Ming geography of travels from 1607 to 1640 — geology, hydrology, vegetation, and above all karst: caves, underground rivers, peak forests, sinkholes and speleothems. Its systematic notes on limestone landforms preceded comparable European research by more than two centuries.",
      "《地质旅游词典》（Springer）：明代地理著作，记录 1607–1640 年的行旅观察——地质、水文、植被，尤其是洞穴、地下河、峰林、天坑与钟乳。对石灰岩地貌的系统记述，比欧洲同类研究早两百余年。",
    ),
    googleQuery: "The Travels of Xu Xiake geomorphology",
  },
  {
    id: "kong-skull-island",
    type: "film",
    cover: asset("/literature/kong-skull-island.jpg"),
    title: L("Kong: Skull Island", "金刚：骷髅岛"),
    creator: L("Dir. Jordan Vogt-Roberts", "乔丹·沃格特-罗伯茨 导演"),
    year: "2017",
    location: L("Vietnam filming locations · China–Vietnam karst", "越南取景 · 中越边境喀斯特"),
    desc: L(
      "Legendary Pictures: a scientific expedition to an uncharted island awakens titanic forces of nature. Principal photography in northern Vietnam included Tràng An, Tam Cốc and Vân Long (Ninh Bình), the Tú Làn caves (Quảng Bình), and Hạ Long Bay.",
      "传奇影业简介：一支科学考察队登上未知岛屿，唤醒巨兽。越南北境实拍包括宁平的长安、三谷与云隆，广平的秀兰洞穴，以及下龙湾。",
    ),
    googleQuery: "Kong Skull Island Vietnam filming locations",
  },
];

export function homeLiteraryWorks(): LitWork[] {
  return HOME_LIT_IDS.map((id) => literaryWorks.find((w) => w.id === id)).filter(
    (w): w is LitWork => Boolean(w),
  );
}

export function restLiteraryWorksShuffled(): LitWork[] {
  const pinned = new Set<string>(HOME_LIT_IDS);
  const rest = literaryWorks.filter((w) => !pinned.has(w.id));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return rest;
}
