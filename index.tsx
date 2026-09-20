import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu, X, ExternalLink, Mail, ArrowRight, Video, ImageIcon, Cpu, Layout, Play, Maximize2, BookOpen } from 'lucide-react';

// --- ヘルパー: パス正規化とリトライ機能 ---

/**
 * 画像読み込み失敗時に、異なる正規化形式や拡張子でリトライするコンポーネント
 */
// Fix: Added key?: React.Key to prop type to allow passing key in lists, resolving TS error at line 416
const SmartImage = ({ src, alt, className, style }: { src: string, alt: string, className?: string, style?: React.CSSProperties, key?: React.Key }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const resolveSrc = (value: string) => {
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('//') ||
      value.startsWith('data:')
    ) {
      return value;
    }
    let merged = `${baseUrl}${value}`;
    // Collapse duplicate slashes without using regex to avoid esbuild parsing issues.
    while (merged.includes('//')) merged = merged.replace('//', '/');
    return merged;
  };
  const [currentSrc, setCurrentSrc] = useState(resolveSrc(src));
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveSrc(src));
    setRetryCount(0);
    setIsError(false);
  }, [src]);

  const handleError = () => {
    // リトライ戦略
    if (retryCount === 0) {
      // 1. パス全体を NFC (Linux/Vercel等の一般的な環境) へ変換
      setCurrentSrc(currentSrc.normalize('NFC'));
      setRetryCount(1);
    } else if (retryCount === 1) {
      // 2. パス全体を NFD (Mac等のファイルシステム) へ変換
      setCurrentSrc(currentSrc.normalize('NFD'));
      setRetryCount(2);
    } else if (retryCount === 2) {
      // 3. 拡張子の違いを試みる (.jpeg <-> .jpg)
      const next = currentSrc.endsWith('.jpeg') 
        ? currentSrc.replace('.jpeg', '.jpg') 
        : currentSrc.endsWith('.jpg') 
          ? currentSrc.replace('.jpg', '.jpeg')
          : currentSrc;
      setCurrentSrc(next);
      setRetryCount(3);
    } else if (retryCount === 3) {
      // 4. 共通の接尾辞（（大）（中）など）の有無によるパターンを試す
      let next = currentSrc;
      if (next.includes('（大）')) {
        next = next.replace('（大）', '');
      } else if (!next.includes('（大）') && !next.includes('img/') && !next.includes('Xgd')) {
         const parts = next.split('.');
         const ext = parts.pop();
         next = parts.join('.') + '（大）.' + ext;
      }
      setCurrentSrc(next);
      setRetryCount(4);
    } else {
      setIsError(true);
    }
  };

  if (isError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900/80 p-6 text-center ${className}`}>
        <ImageIcon size={32} className="mb-2 opacity-20" />
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Image Not Found</span>
        <span className="text-[8px] text-gray-700 mt-1 truncate w-full px-2 opacity-30">{src}</span>
      </div>
    );
  }

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={handleError}
    />
  );
};

// --- 多言語対応 ---

type Language = 'ja' | 'en' | 'zh';

const translations = {
  nav: {
    ja: { about: 'ABOUT', aiManga: 'AI漫画', aiVideo: 'AI動画', portfolio: '作品紹介', vibeCoding: 'バイブコーディング', blog: 'note' },
    en: { about: 'ABOUT', aiManga: 'AI MANGA', aiVideo: 'AI VIDEO', portfolio: 'PORTFOLIO', vibeCoding: 'VIBE CODING', blog: 'note' },
    zh: { about: '关于', aiManga: 'AI漫画', aiVideo: 'AI视频', portfolio: '作品集', vibeCoding: '氛围编程', blog: 'note' }
  },
  hero: {
    ja: { title: 'Design Quest AI', subtitle: 'デザイン × AI で未来を創る', description: 'クリエイティブとテクノロジーの融合で、新しい価値を生み出すデザイナー' },
    en: { title: 'Design Quest AI', subtitle: 'Creating the Future with Design × AI', description: 'A designer creating new value through the fusion of creativity and technology' },
    zh: { title: 'Design Quest AI', subtitle: '用设计 × AI 创造未来', description: '通过创意与技术的融合创造新价值的设计师' }
  },
  about: {
    ja: { 
      title: 'ABOUT ME', 
      bio1: 'AI×デザインの力で、クリエイターの収益化を支援するデザイナーです。1,000件以上の案件を通じて培った経験で、あなたのアイデアを収益に変えるお手伝いをします。',
      bio2: 'グラフィックデザインをはじめ、Kindle出版、YouTubeサムネイルなど、幅広いジャンルでの制作実績があります。AIツールを活用した効率的なワークフローで、高品質な作品を短期間で制作いたします。',
      lab: 'Design Quest AIは、デザインとAIの共生を目指すクリエイティブ・ラボです。最高峰の生成AI技術を使いこなし、想像の限界を拡張します。',
      mainTools: '主な使用ツール', 
      aiTools: '使用AI', 
      fonts: '使用フォント', 
      imageGen: '画像生成', 
      videoGen: '動画生成',
      toolsList: 'Illustrator / Photoshop / Premiere Proなど',
      aiToolsList: 'ChatGPT(Codex) / Antigravity / Hermes / Claude Code など',
      fontsList: 'Adobeフォントなど',
      imageGenList: 'ComfyUI Anima / StableDiffusion EasyRefogeなど',
      videoGenList: 'Floyo MiniMax H3 / Tap Now / sousaku AI など'
    },
    en: { 
      title: 'ABOUT ME', 
      bio1: 'I am a designer who supports creator monetization through the power of AI and design. With experience gained through over 1,000 projects, I help turn your ideas into revenue.',
      bio2: 'I have a track record in a wide range of genres, including graphic design, Kindle publishing, and YouTube thumbnails. I produce high-quality work in a short period through efficient workflows utilizing AI tools.',
      lab: 'Design Quest AI is a creative lab aiming for the symbiosis of design and AI. We master the latest generative AI technologies to expand the limits of imagination.',
      mainTools: 'Main Tools', 
      aiTools: 'AI Tools', 
      fonts: 'Fonts', 
      imageGen: 'Image Generation', 
      videoGen: 'Video Generation',
      toolsList: 'Illustrator / Photoshop / Premiere Pro etc.',
      aiToolsList: 'ChatGPT (Codex) / Antigravity / Hermes / Claude Code, etc.',
      fontsList: 'Adobe Fonts etc.',
      imageGenList: 'ComfyUI Anima / StableDiffusion EasyRefoge, etc.',
      videoGenList: 'Floyo MiniMax H3 / Tap Now / Sousaku AI, etc.'
    },
    zh: { 
      title: '关于我', 
      bio1: '我是一名通过 AI 和设计的力量支持创作者变现的设计师。凭借在 1,000 多个项目中的经验，我能帮助您将想法转化为收益。',
      bio2: '我在平面设计、Kindle 出版和 YouTube 缩略图等多个领域均有丰富的制作经验。通过利用 AI 工具的高效工作流程，我能在短时间内创作出高质量的作品。',
      lab: 'Design Quest AI 是一个旨在实现设计与 AI 共生的创意实验室。我们熟练运用最顶尖的生成式 AI 技术，拓宽想象力的边界。',
      mainTools: '主要工具', 
      aiTools: 'AI工具', 
      fonts: '字体', 
      imageGen: '图像生成', 
      videoGen: '视频生成',
      toolsList: 'Illustrator / Photoshop / Premiere Pro 等',
      aiToolsList: 'ChatGPT(Codex) / Antigravity / Hermes / Claude Code 等',
      fontsList: 'Adobe 字体等',
      imageGenList: 'ComfyUI Anima / StableDiffusion EasyRefoge 等',
      videoGenList: 'Floyo MiniMax H3 / Tap Now / sousaku AI 等'
    }
  },
  aiManga: {
    ja: { title: 'AI MANGA SERIES', viewManga: 'View Manga', closeManga: 'Close Manga' },
    en: { title: 'AI MANGA SERIES', viewManga: 'View Manga', closeManga: 'Close Manga' },
    zh: { title: 'AI漫画系列', viewManga: '查看漫画', closeManga: '关闭漫画' }
  },
  portfolio: {
    ja: { title: '作品紹介', subtitle: 'デザインの力で、ビジネスに価値を', all: 'すべて' },
    en: { title: 'PORTFOLIO', subtitle: 'Adding Value to Business Through Design', all: 'All' },
    zh: { title: '作品集', subtitle: '通过设计为商业增值', all: '全部' }
  },
  categories: {
    ja: { 
      all: 'すべて',
      dtp: 'DTPデザイン',
      gaina: 'GAINA魂',
      logo: 'ロゴデザイン',
      kindle: 'Kindle表紙',
      ai: 'AI画像生成',
      thumb: 'サムネなど',
      reviews: 'デザイン講座評価'
    },
    en: { 
      all: 'All',
      dtp: 'DTP Design',
      gaina: 'GAINA Soul',
      logo: 'Logo Design',
      kindle: 'Kindle Cover',
      ai: 'AI Generation',
      thumb: 'Thumbnails',
      reviews: 'Design Reviews'
    },
    zh: { 
      all: '全部',
      dtp: 'DTP设计',
      gaina: 'GAINA魂',
      logo: '标志设计',
      kindle: 'Kindle封面',
      ai: 'AI图像生成',
      thumb: '缩略图',
      reviews: '设计评价'
    }
  },
  vibeCoding: {
    ja: { title: 'バイブコーディング', subtitle: 'ノーコード開発 × 生成AIによる次世代プロダクト', viewProject: 'View Project', launchProject: 'LAUNCH PROJECT' },
    en: { title: 'VIBE CODING', subtitle: 'Next-Gen Products with No-Code × Generative AI', viewProject: 'View Project', launchProject: 'LAUNCH PROJECT' },
    zh: { title: '氛围编程', subtitle: '无代码开发 × 生成AI的下一代产品', viewProject: '查看项目', launchProject: '启动项目' }
  },
  aiVideo: {
    ja: { title: 'AI動画コレクション', subtitle: '生成AIが織りなす映像美のフロンティア', watchVideo: 'Watch Video', aiVideoLabel: 'AI Video', sortLabel: '並べ替え', newest: '新しい順', oldest: '古い順', genre: 'ジャンル順', type: '種類順', tag: 'タグ順', tagFilter: 'タグ', allTags: 'すべて', countLabel: '作品' },
    en: { title: 'AI VIDEO COLLECTION', subtitle: 'Frontier of Visual Beauty Woven by Generative AI', watchVideo: 'Watch Video', aiVideoLabel: 'AI Video', sortLabel: 'Sort', newest: 'Newest', oldest: 'Oldest', genre: 'By Genre', type: 'By Type', tag: 'By Tag', tagFilter: 'Tag', allTags: 'All', countLabel: 'works' },
    zh: { title: 'AI视频集', subtitle: '生成AI编织的视觉美学前沿', watchVideo: '观看视频', aiVideoLabel: 'AI视频', sortLabel: '排序', newest: '最新', oldest: '最早', genre: '按类别', type: '按类型', tag: '按标签', tagFilter: '标签', allTags: '全部', countLabel: '件作品' }
  },
  portfolioDetail: {
    ja: { detail: 'Portfolio Detail', category: 'Category', projectTitle: 'Project Title', closeWindow: 'Close Window' },
    en: { detail: 'Portfolio Detail', category: 'Category', projectTitle: 'Project Title', closeWindow: 'Close Window' },
    zh: { detail: '作品详情', category: '类别', projectTitle: '项目标题', closeWindow: '关闭窗口' }
  },
  contact: {
    ja: { title: 'CONTACT', subtitle: 'お気軽にお問い合わせください', email: 'メールを送る' },
    en: { title: 'CONTACT', subtitle: 'Feel free to contact me', email: 'Send Email' },
    zh: { title: '联系方式', subtitle: '欢迎随时联系', email: '发送邮件' }
  },
  blog: {
    ja: { title: 'BLOG', subtitle: 'クリエイティブ・AI・働き方を発信する個人メディア', readArticle: 'noteで記事を読む' },
    en: { title: 'BLOG', subtitle: 'Sharing thoughts on creativity, AI, and career pathways', readArticle: 'Read on note' },
    zh: { title: '博客', subtitle: '分享创意、AI及工作方式的个人媒体', readArticle: '在note阅读文章' }
  }
};

// --- データ定義 ---

const categories = [
  { id: 'all', key: 'all' },
  { id: '01_dtp', key: 'dtp' },
  { id: '02_gaina', key: 'gaina' },
  { id: '03_logo', key: 'logo' },
  { id: '04_kindle', key: 'kindle' },
  { id: '05_ai', key: 'ai' },
  { id: '06_thumb', key: 'thumb' },
  { id: '07_reviews', key: 'reviews' },
];

const mangaPages = [
  '00_ai_manga/00_cover_manga.jpeg',
  '00_ai_manga/01_page.jpeg',
  '00_ai_manga/02_page.jpeg',
  '00_ai_manga/03_page.jpeg',
  '00_ai_manga/04_page.jpeg',
  '00_ai_manga/05_page.jpeg',
  '00_ai_manga/06_page.jpeg'
];

const getPortfolioItems = (language: Language) => {
  const titles = {
    ja: {
      101: '東公園パンフレット',
      102: 'ローター工業パンフレット',
      103: 'SCN会社案内',
      104: 'kaoriパンフレット',
      105: 'ぎょしょうリーフレット',
      106: 'イベントガイド',
      107: '豪円とうふプレゼン',
      108: '豪円湯院GOENプリン',
      109: '燻製豆腐リーフレット',
      110: 'バレエ団パンフレット',
      111: '春の出店展示会',
      201: 'GAINA魂ロゴ',
      202: 'GAINA魂ロゴイメージ',
      203: 'GAINA魂ポスター',
      204: 'GAINA魂パンフレット',
      205: 'GAINA魂チケット',
      206: 'GAINA魂SNS',
      207: 'GAINA魂ボードデザイン',
      208: 'GAINA魂米子ジム名刺',
      301: 'ロゴコンタクトシート',
      302: 'ガイナ魂ロゴ',
      303: '皮膚科ロゴ',
      304: '駅なかマルシェロゴ',
      305: 'Swanロゴ',
      401: 'Kindle表紙 01', 402: 'Kindle表紙 02', 403: 'Kindle表紙 03', 404: 'Kindle表紙 04', 405: 'Kindle表紙 05',
      406: 'Kindle表紙 06', 407: 'Kindle表紙 07', 408: 'Kindle表紙 08', 409: 'Kindle表紙 09', 410: 'Kindle表紙 10',
      411: 'Kindle表紙 11', 412: 'Kindle表紙 12', 413: 'Kindle表紙 13', 414: 'Kindle表紙 14', 415: 'Kindle表紙 15',
      501: 'AI画像生成 01', 502: 'AI画像生成 02', 503: 'AI画像生成 03', 504: 'AI画像生成 04', 505: 'AI画像生成 05', 506: 'AI画像生成 06',
      601: 'DQXシールモンスター採用おすもっこり',
      602: 'YouTubeサムネイル',
      603: 'バナー広告',
      701: '実績・感想 03',
      702: '評価 01',
      703: '評価 02',
      704: '評価 03'
    },
    en: {
      101: 'Higashi Park Brochure',
      102: 'Rotor Industry Brochure',
      103: 'SCN Company Profile',
      104: 'Kaori Brochure',
      105: 'Gyosho Leaflet',
      106: 'Event Guide',
      107: 'Goen Tofu Presentation',
      108: 'Goen Yuin GOEN Pudding',
      109: 'Smoked Tofu Leaflet',
      110: 'Ballet Company Brochure',
      111: 'Spring Store Exhibition',
      201: 'GAINA Soul Logo',
      202: 'GAINA Soul Logo Image',
      203: 'GAINA Soul Poster',
      204: 'GAINA Soul Brochure',
      205: 'GAINA Soul Tickets',
      206: 'GAINA Soul SNS',
      207: 'GAINA Soul Board Design',
      208: 'GAINA Soul Yonago Gym Business Card',
      301: 'Logo Contact Sheet',
      302: 'Gaina Soul Logo',
      303: 'Dermatology Logo',
      304: 'Station Marche Logo',
      305: 'Swan Logo',
      401: 'Kindle Cover 01', 402: 'Kindle Cover 02', 403: 'Kindle Cover 03', 404: 'Kindle Cover 04', 405: 'Kindle Cover 05',
      406: 'Kindle Cover 06', 407: 'Kindle Cover 07', 408: 'Kindle Cover 08', 409: 'Kindle Cover 09', 410: 'Kindle Cover 10',
      411: 'Kindle Cover 11', 412: 'Kindle Cover 12', 413: 'Kindle Cover 13', 414: 'Kindle Cover 14', 415: 'Kindle Cover 15',
      501: 'AI Generation 01', 502: 'AI Generation 02', 503: 'AI Generation 03', 504: 'AI Generation 04', 505: 'AI Generation 05', 506: 'AI Generation 06',
      601: 'DQX Seal Monster Adoption',
      602: 'YouTube Thumbnail',
      603: 'Banner Ad',
      701: 'Achievement & Review 03',
      702: 'Review 01',
      703: 'Review 02',
      704: 'Review 03'
    },
    zh: {
      101: '东公园宣传册',
      102: '转子工业宣传册',
      103: 'SCN公司介绍',
      104: 'Kaori宣传册',
      105: '渔业宣传单',
      106: '活动指南',
      107: '豪圆豆腐演示',
      108: '豪圆温泉GOEN布丁',
      109: '烟熏豆腐宣传单',
      110: '芭蕾舞团宣传册',
      111: '春季店铺展览会',
      201: 'GAINA魂标志',
      202: 'GAINA魂标志图像',
      203: 'GAINA魂海报',
      204: 'GAINA魂宣传册',
      205: 'GAINA魂门票',
      206: 'GAINA魂SNS',
      207: 'GAINA魂板设计',
      208: 'GAINA魂米子健身房名片',
      301: '标志联系表',
      302: '盖纳魂标志',
      303: '皮肤科标志',
      304: '车站市场标志',
      305: 'Swan标志',
      401: 'Kindle封面 01', 402: 'Kindle封面 02', 403: 'Kindle封面 03', 404: 'Kindle封面 04', 405: 'Kindle封面 05',
      406: 'Kindle封面 06', 407: 'Kindle封面 07', 408: 'Kindle封面 08', 409: 'Kindle封面 09', 410: 'Kindle封面 10',
      411: 'Kindle封面 11', 412: 'Kindle封面 12', 413: 'Kindle封面 13', 414: 'Kindle封面 14', 415: 'Kindle封面 15',
      501: 'AI图像生成 01', 502: 'AI图像生成 02', 503: 'AI图像生成 03', 504: 'AI图像生成 04', 505: 'AI图像生成 05', 506: 'AI图像生成 06',
      601: 'DQX印章怪物采用',
      602: 'YouTube缩略图',
      603: '横幅广告',
      701: '成果·感想 03',
      702: '评价 01',
      703: '评价 02',
      704: '评价 03'
    }
  };

  return [
    // 01_DTP Design
    { id: 101, category: '01_dtp', title: titles[language][101], src: '01_dtp_design/09_higashi_park.jpeg' },
    { id: 102, category: '01_dtp', title: titles[language][102], src: '01_dtp_design/10_rotor_industry.jpeg' },
    { id: 103, category: '01_dtp', title: titles[language][103], src: '01_dtp_design/11_scn_company.jpeg' },
    { id: 104, category: '01_dtp', title: titles[language][104], src: '01_dtp_design/12_kaori.jpeg' },
    { id: 105, category: '01_dtp', title: titles[language][105], src: '01_dtp_design/13_gyosho_leaf.jpeg' },
    { id: 106, category: '01_dtp', title: titles[language][106], src: '01_dtp_design/14_event_guide.jpeg' },
    { id: 107, category: '01_dtp', title: titles[language][107], src: '01_dtp_design/15_goen_tofu.jpeg' },
    { id: 108, category: '01_dtp', title: titles[language][108], src: '01_dtp_design/16_goen_pudding.jpeg' },
    { id: 109, category: '01_dtp', title: titles[language][109], src: '01_dtp_design/17_goen_smoked_tofu.jpeg' },
    { id: 110, category: '01_dtp', title: titles[language][110], src: '01_dtp_design/18_ballet.jpeg' },
    { id: 111, category: '01_dtp', title: titles[language][111], src: '01_dtp_design/19_spring_exhibition.jpeg' },
    
    // 02_GAINA Soul
    { id: 201, category: '02_gaina', title: titles[language][201], src: '02_gaina_soul/01_logo.jpeg' },
    { id: 202, category: '02_gaina', title: titles[language][202], src: '02_gaina_soul/02_logo_image.jpeg' },
    { id: 203, category: '02_gaina', title: titles[language][203], src: '02_gaina_soul/03_poster.jpeg' },
    { id: 204, category: '02_gaina', title: titles[language][204], src: '02_gaina_soul/04_pamphlet.jpeg' },
    { id: 205, category: '02_gaina', title: titles[language][205], src: '02_gaina_soul/05_tickets.jpeg' },
    { id: 206, category: '02_gaina', title: titles[language][206], src: '02_gaina_soul/06_sns.jpeg' },
    { id: 207, category: '02_gaina', title: titles[language][207], src: '02_gaina_soul/07_board_design.jpeg' },
    { id: 208, category: '02_gaina', title: titles[language][208], src: '02_gaina_soul/08_business_card.jpeg' },
    
    // 03_Logo Design
    { id: 301, category: '03_logo', title: titles[language][301], src: '03_logo_design/logo_contact_sheet.jpeg' },
    { id: 302, category: '03_logo', title: titles[language][302], src: '03_logo_design/gaina_soul.jpeg' },
    { id: 303, category: '03_logo', title: titles[language][303], src: '03_logo_design/dermatology.jpeg' },
    { id: 304, category: '03_logo', title: titles[language][304], src: '03_logo_design/station_marche.jpeg' },
    { id: 305, category: '03_logo', title: titles[language][305], src: '03_logo_design/swan.jpeg' },
    
    // 04_Kindle Cover
    { id: 401, category: '04_kindle', title: titles[language][401], src: '04_kindle_cover/00001_cover_a.jpeg' },
    { id: 402, category: '04_kindle', title: titles[language][402], src: '04_kindle_cover/00002_cover_a.jpeg' },
    { id: 403, category: '04_kindle', title: titles[language][403], src: '04_kindle_cover/00003_cover_a.jpeg' },
    { id: 404, category: '04_kindle', title: titles[language][404], src: '04_kindle_cover/00004_cover_a.jpeg' },
    { id: 405, category: '04_kindle', title: titles[language][405], src: '04_kindle_cover/00005_cover_a.jpeg' },
    { id: 406, category: '04_kindle', title: titles[language][406], src: '04_kindle_cover/00006_cover_a.jpeg' },
    { id: 407, category: '04_kindle', title: titles[language][407], src: '04_kindle_cover/00007_cover_a.jpeg' },
    { id: 408, category: '04_kindle', title: titles[language][408], src: '04_kindle_cover/00008_cover_a.jpeg' },
    { id: 409, category: '04_kindle', title: titles[language][409], src: '04_kindle_cover/00009_cover_b.jpeg' },
    { id: 410, category: '04_kindle', title: titles[language][410], src: '04_kindle_cover/00010_cover_b.jpeg' },
    { id: 411, category: '04_kindle', title: titles[language][411], src: '04_kindle_cover/00011_cover_b.jpeg' },
    { id: 412, category: '04_kindle', title: titles[language][412], src: '04_kindle_cover/00012_cover_b.jpeg' },
    { id: 413, category: '04_kindle', title: titles[language][413], src: '04_kindle_cover/00013_cover_b.jpeg' },
    { id: 414, category: '04_kindle', title: titles[language][414], src: '04_kindle_cover/00014_cover_b.jpeg' },
    { id: 415, category: '04_kindle', title: titles[language][415], src: '04_kindle_cover/00015_cover_b.jpeg' },
    
    // 05_AI Generation
    { id: 501, category: '05_ai', title: titles[language][501], src: '05_ai_generation/portfolio_01.jpeg' },
    { id: 502, category: '05_ai', title: titles[language][502], src: '05_ai_generation/portfolio_02.jpeg' },
    { id: 503, category: '05_ai', title: titles[language][503], src: '05_ai_generation/portfolio_03.jpeg' },
    { id: 504, category: '05_ai', title: titles[language][504], src: '05_ai_generation/portfolio_04.jpeg' },
    { id: 505, category: '05_ai', title: titles[language][505], src: '05_ai_generation/portfolio_05.jpeg' },
    { id: 506, category: '05_ai', title: titles[language][506], src: '05_ai_generation/portfolio_06.jpeg' },
    
    // 06_Thumbnails
    { id: 601, category: '06_thumb', title: titles[language][601], src: '06_thumbnails/20_dqx_seal_monster.jpeg' },
    { id: 602, category: '06_thumb', title: titles[language][602], src: '06_thumbnails/21_youtube_thumbnail.jpeg' },
    { id: 603, category: '06_thumb', title: titles[language][603], src: '06_thumbnails/22_banner_ad.jpeg' },
    
    // 07_Design Reviews
    { id: 701, category: '07_reviews', title: titles[language][701], src: '07_design_reviews/achievement_03.jpg' },
    { id: 702, category: '07_reviews', title: titles[language][702], src: '07_design_reviews/review_01.jpg' },
    { id: 703, category: '07_reviews', title: titles[language][703], src: '07_design_reviews/review_02.jpg' },
    { id: 704, category: '07_reviews', title: titles[language][704], src: '07_design_reviews/review_03.jpg' },
  ];
};

const getVibeCodingProjects = (language: Language) => {
  const projectsData = {
    ja: [
      {
        title: "AI美女ポートフォリオサイト",
        url: "https://aap-coral.vercel.app/",
        desc: "AI画像生成によるハイエンドな美女ポートフォリオ。洗練されたビジュアル表現を追求。",
        tags: ["AI画像生成", "Web開発"]
      },
      {
        title: "画像から3面図作成 (youware)",
        url: "https://youware.app/project/8n6f9cenc3?enter_from=share&screen_status=2",
        desc: "nanobananaを活用し、1つのキャラクターから精密な3面図を自動生成するプロジェクト。",
        tags: ["nanobanana", "Vibe Coding"]
      },
      {
        title: "nanobananaで漫画を作成 (youware)",
        url: "https://youware.app/project/l81ty32lam?enter_from=share&screen_status=2",
        desc: "AI生成画像を用いたストーリーテリングと、ノーコード環境による漫画制作フロー。",
        tags: ["漫画制作", "ノーコード"]
      }
    ],
    en: [
      {
        title: "AI Beauty Portfolio Site",
        url: "https://aap-coral.vercel.app/",
        desc: "High-end beauty portfolio using AI image generation. Pursuing refined visual expression.",
        tags: ["AI Generation", "Web Dev"]
      },
      {
        title: "3-View Drawing from Image (youware)",
        url: "https://youware.app/project/8n6f9cenc3?enter_from=share&screen_status=2",
        desc: "Project to automatically generate precise 3-view drawings from a single character using nanobanana.",
        tags: ["nanobanana", "Vibe Coding"]
      },
      {
        title: "Create Manga with nanobanana (youware)",
        url: "https://youware.app/project/l81ty32lam?enter_from=share&screen_status=2",
        desc: "Storytelling using AI-generated images and manga production flow in a no-code environment.",
        tags: ["Manga Creation", "No-Code"]
      }
    ],
    zh: [
      {
        title: "AI美女作品集网站",
        url: "https://aap-coral.vercel.app/",
        desc: "使用AI图像生成的高端美女作品集。追求精致的视觉表现。",
        tags: ["AI图像生成", "Web开发"]
      },
      {
        title: "从图像创建三视图 (youware)",
        url: "https://youware.app/project/8n6f9cenc3?enter_from=share&screen_status=2",
        desc: "利用nanobanana从单个角色自动生成精确三视图的项目。",
        tags: ["nanobanana", "Vibe Coding"]
      },
      {
        title: "使用nanobanana创作漫画 (youware)",
        url: "https://youware.app/project/l81ty32lam?enter_from=share&screen_status=2",
        desc: "使用AI生成图像进行故事讲述，以及在无代码环境中的漫画制作流程。",
        tags: ["漫画创作", "无代码"]
      }
    ]
  };
  return projectsData[language];
};

type AIVideoItem = {
  id?: string;
  title: string;
  url?: string;
  videoUrl?: string;
  embedUrl?: string;
  drivePreviewUrl?: string;
  platform?: 'x' | 'youtube' | 'local';
  thumbnail?: string;
  awardImage?: string;
  supportingImage?: string;
  supportingImageLabel?: string;
  badge?: string;
  challenge?: string;
  judgeComments?: string[];
  storyNumber?: number;
  relatedLinks?: { label: string; url: string }[];
  submissionNote?: string;
  featured?: boolean;
  localOnly?: boolean;
  date?: string;
  genre?: string;
  type?: string;
  sortGenre?: string;
  sortType?: string;
  qNumber?: number;
  tags?: string[];
  objectPosition?: string;
};

const sousakuAwardAssets = {
  eventUrl: 'https://sousaku.ai/event/agent-creation-cup-v1/vote?exp_mid=4fc8a120-0aad-487d-94c1-66818108dc2d',
  videoUrl: 'https://cdn.sousaku.ai/home/image/user/6389e286-572a-4089-a430-a033af42363b/10625820-6934-4c60-a0ea-af4895894115/origin/20260509-4fc8a1200aad487d94c166818108dc2d.mp4',
  thumbnail: '08_ai_video/previews/sousaku-featured.jpg',
  awardImage: '08_ai_video/sousaku_ai_agent_creation_cup_2026_award.png'
};

const getAIVideoSourceId = (url?: string) => {
  if (!url) return null;
  const statusMatch = url.match(/status\/(\d+)/);
  return statusMatch?.[1] || null;
};

const aiVideoMetaBySource: Record<string, Partial<AIVideoItem>> = {
  '2094183380527284391': { date: '2026-08-30', genre: '音楽', type: 'MV', sortGenre: 'music', sortType: 'mv', thumbnail: '08_ai_video/previews/x-2094183380527284391.jpg', tags: ['DQA', 'MV'] },
  '2093302634501595187': { date: '2026-08-28', genre: '音楽', type: 'MV', sortGenre: 'music', sortType: 'mv', thumbnail: '08_ai_video/previews/x-2093302634501595187.jpg' },
  '2092275374210076776': { date: '2026-08-25', genre: '音楽', type: 'MV', sortGenre: 'music', sortType: 'mv', thumbnail: '08_ai_video/previews/x-2092275374210076776.jpg' },
  '2091763869006061917': { date: '2026-08-24', genre: 'ダンス', type: 'AI社員', sortGenre: 'dance', sortType: 'dance', thumbnail: '08_ai_video/previews/x-2091763869006061917.jpg' },
  '2090584633108996264': { date: '2026-08-20', genre: '音楽', type: 'ニュースED', sortGenre: 'music', sortType: 'mv', thumbnail: '08_ai_video/previews/x-2090584633108996264.jpg' },
  '2090096682457571534': { date: '2026-08-20' },
  '2084342226986115178': { date: '2026-08-03', genre: 'アクション', type: 'コラボ映像', sortGenre: 'action', sortType: 'short', thumbnail: '08_ai_video/previews/x-2084342226986115178.jpg' },
  '2082301345034633579': { date: '2026-07-29', genre: '解説', type: 'チュートリアル', sortGenre: 'tutorial', sortType: 'tutorial', thumbnail: '08_ai_video/previews/x-2082301345034633579.jpg' },
  '2071973696450031747': { date: '2026-06-30', genre: 'ドラマ', type: '短編フィルム', sortGenre: 'drama', sortType: 'short', thumbnail: '08_ai_video/previews/x-2071973696450031747.jpg' },
};

const applyAIVideoMetadata = (items: AIVideoItem[]) => items.map((item) => {
  const sourceId = getAIVideoSourceId(item.url);
  const metadata = sourceId ? aiVideoMetaBySource[sourceId] : undefined;
  const storyNumberBySource: Record<string, number> = {
    '2071973696450031747': 3
  };
  const storyNumberById: Record<string, number> = {
    'dqa-story-01': 1,
    'dqa-story-02': 2,
    'crimson-mirror-pond': 4,
    'wfaia-ad': 5,
    'wfaia-drama': 6
  };
  const storyDetails = sourceId === '2071973696450031747' ? {
    challenge: 'コロテック応募作品 / AIしてもいいですか？ 第3話',
    relatedLinks: [
      { label: 'コロテック公式サイト', url: 'https://colo-tek.com/' },
      { label: 'X投稿', url: 'https://x.com/ARrow25989974/status/2071973696450031747' }
    ],
    submissionNote: `コロテック運営事務局でございます。\nこの度は、本コンテストに作品をご応募いただき、誠にありがとうございました。\n\n今回は、約350作品ものご応募をいただきました。いずれの作品からも、クリエイターの皆様の熱意と創造性が感じられ、審査は非常に難しいものとなりました。慎重に選考を重ねた結果、誠に残念ながら、今回はノミネート作品への選出を見送らせていただくこととなりました。\n\n今回の結果は、本コンテストの審査基準に基づき総合的に判断したものであり、作品そのものの価値や、皆様の創造性を否定するものではございません。\n\n魅力ある作品をご応募いただきましたことに、改めて心より御礼申し上げます。`
  } : undefined;
  const fallback = {
    genre: item.videoUrl ? 'ドラマ' : item.embedUrl ? '実写' : 'AI作品',
    type: item.videoUrl ? '短編フィルム' : item.embedUrl ? '密着編集' : 'X投稿',
    sortGenre: item.videoUrl ? 'drama' : item.embedUrl ? 'documentary' : 'other',
    sortType: item.videoUrl ? 'short' : item.embedUrl ? 'documentary' : 'post'
  };
  return {
    ...fallback,
    ...metadata,
    ...storyDetails,
    ...item,
    storyNumber: item.storyNumber || storyNumberById[item.id || ''] || storyNumberBySource[sourceId || ''],
    thumbnail: item.thumbnail || metadata?.thumbnail
  };
});

const aiVideoTagsByQ: Record<number, string[]> = {
  1: ['ディープフェイク'],
  2: ['ディープフェイク'],
  3: ['ディープフェイク'],
  4: ['AI動画'],
  5: ['AI動画'],
  6: ['ブログ', 'AI動画'],
  7: ['ブログ', 'AI動画'],
  8: ['ブログ', 'AI動画'],
  9: ['ブログ', 'AI動画'],
  10: ['ブログ', 'AI動画'],
  11: ['ブログ', 'AI動画'],
  12: ['ブログ', 'AI動画'],
  13: ['AI動画'],
  14: ['AI動画'],
  15: ['動画コンテスト', 'AI動画'],
  16: ['AI動画'],
  17: ['AI動画'],
  18: ['AI動画'],
  19: ['ブログ', 'AI動画'],
  20: ['ブログ', 'AI動画'],
  21: ['ブログ', 'AI動画'],
  22: ['AI動画'],
  23: ['Animon', 'チュートリアル'],
  24: ['Animon', '動画コンテスト', '受賞作品'],
  25: ['AI動画', 'チャレンジ記録'],
  26: ['動画コンテスト', 'ストーリー部門'],
  27: ['GAINA魂', '実績・案件', '広告・CM'],
  28: ['GAINA魂', '実績・案件', '実写'],
  29: ['GAINA魂', '実績・案件', '実写編集'],
  30: ['AI動画', 'ショートフィルム'],
  31: ['GAINA魂', '実績・案件', '実写編集'],
  32: ['動画コンテスト', 'SousakuAI Agent Creation Cup'],
  33: ['チュートリアル', 'AI動画'],
  34: ['動画コンテスト', 'WFAIA 2026', '広告・CM'],
  35: ['AI動画', 'アクション'],
  36: ['動画コンテスト', 'WFAIA 2026', 'ショートドラマ'],
  37: ['DQA', 'ニュースED', 'MV'],
  38: ['DQA', 'AI社員', 'ダンス'],
  39: ['DQA', '公式イメージソング', 'MV'],
  40: ['DQA', '公式イメージソング', 'MV'],
  41: ['AI動画', 'MV', 'Floyo H3 I2V Turbo']
};

const hiddenAIVideoFilterTags = new Set([
  'AI動画',
  'AI社員',
  'DQA',
  'Floyo H3 I2V Turbo',
  'SousakuAI Agent Creation Cup',
  'WFAIA 2026',
  'アクション',
  'ショートドラマ',
  'ショートフィルム',
  'ストーリー部門',
  'ダンス',
  'チュートリアル',
  'チャレンジ記',
  'チャレンジ記録',
  'ニュースED',
  '公式イメージソング',
  '広告・CM',
  '実写',
  '実写編集',
  '実績・案件',
  '受賞作品'
]);

// 追加作品でQ番号がずれても、作品そのものに対する分類を維持する。
const aiVideoTagOverrides: Record<string, string[]> = {
  // 1. AIアクション: 動画コンテストから外す
  '2084342226986115178': ['AI動画', 'アクション'],
  // 2. SousakuAIの使い方: チュートリアルではなく動画コンテスト
  '2082301345034633579': ['チュートリアル', 'SousakuAI Agent Creation Cup'],
  // 3. GAINA魂15秒CM: コンテストではなくGAINA魂
  'gaina-cm': ['GAINA魂', '広告・CM'],
  // 4. WFAIA広告: AI動画・チュートリアルを外し、動画コンテストへ
  'wfaia-ad': ['動画コンテスト', 'WFAIA 2026', '広告・CM'],
  // 5. クリムゾンミラーポンド: GAINA魂ではなくDQA物語（storyNumberで付与）
  'crimson-mirror-pond': [],
  // 6. 第3話: GAINA魂ではなく動画コンテスト
  '2071973696450031747': ['動画コンテスト'],
  // 7. DQA単体は外す。DQA物語は storyNumber から保持する。
  'dqa-story-02': ['動画コンテスト', 'ストーリー部門'],
  // 8以降: Animonへ
  'https://www.youtube.com/watch?v=1l8PwbJh8sM': ['GAINA魂', '実績・案件', '実写編集'],
  '1970635643949850761': ['Animon'],
  '1996874239379673494': ['Animon'],
  '2000872251089105122': ['Animon'],
  // GAINA魂は晃貴選手・県知事の実写記録に限定する。
  'https://www.youtube.com/watch?v=6qYAWsS7U0o': ['GAINA魂', '実績・案件', '実写'],
  // 5. WFAIAショートドラマ: 動画コンテスト
  'wfaia-drama': ['動画コンテスト', 'WFAIA 2026', 'ショートドラマ']
};

const aiVideoFilterTagOrder = [
  '動画コンテスト',
  'Animon',
  'DQA物語',
  'GAINA魂',
  'チュートリアル',
  'MV',
  'ブログ',
  'ディープフェイク'
];

const driveVideoLinks = {
  crimson: {
    url: 'https://drive.google.com/file/d/1AVj4fbOU_pruGKI0JTh49mpVehkJwVMZ/view',
    preview: 'https://drive.google.com/file/d/1AVj4fbOU_pruGKI0JTh49mpVehkJwVMZ/preview'
  },
  wfaiaAd: {
    url: 'https://drive.google.com/file/d/1IoYh5IjFO6QF5RCRBYVSMR1UTHpKtQ7F/view',
    preview: 'https://drive.google.com/file/d/1IoYh5IjFO6QF5RCRBYVSMR1UTHpKtQ7F/preview'
  },
  wfaiaDrama: {
    url: 'https://drive.google.com/file/d/1GrB8P9G5t38WMs1re2bvd-51gW9TYIqd/view',
    preview: 'https://drive.google.com/file/d/1GrB8P9G5t38WMs1re2bvd-51gW9TYIqd/preview'
  },
  gainaCm: {
    url: 'https://drive.google.com/file/d/1zAsibyRMWWJ5Ib2aM9asLm7SvxwOU5K9/view',
    preview: 'https://drive.google.com/file/d/1zAsibyRMWWJ5Ib2aM9asLm7SvxwOU5K9/preview'
  },
  gainaInstallation: {
    url: 'https://drive.google.com/file/d/1AyOSy8KVDYilJWunFxRAoDZeOYAdphZ5/view',
    preview: 'https://drive.google.com/file/d/1AyOSy8KVDYilJWunFxRAoDZeOYAdphZ5/preview'
  }
} as const;

const additionalAIVideoData: Record<Language, AIVideoItem[]> = {
  ja: [
    { title: '愛依の兵法ブリーフィング', url: 'https://x.com/ARrow25989974/status/2094183380527284391', badge: 'MV / Floyo H3 I2V Turbo' },
    { title: 'まんなかを歩け', url: 'https://x.com/ARrow25989974/status/2093302634501595187', badge: '公式イメージソング' },
    { title: 'ひとつずつ、とどけ', url: 'https://x.com/ARrow25989974/status/2092275374210076776', badge: '公式イメージソング' },
    { title: 'AI社員ダンス（仮）', url: 'https://x.com/ARrow25989974/status/2091763869006061917', badge: 'AI社員 / ダンス' },
    { title: '澪の向こうへ（Beyond the Waterway）', url: 'https://x.com/ARrow25989974/status/2090584633108996264', badge: 'DQAニュースED' },
    { title: '月夜の水没屋上バトル（仮）', url: 'https://x.com/ARrow25989974/status/2084342226986115178', badge: 'AIアクション' },
    { title: 'SousakuAIの使い方', url: 'https://x.com/ARrow25989974/status/2082301345034633579', badge: 'チュートリアル' },
    { title: 'DQA物語01', id: 'dqa-story-01', url: 'https://x.com/ARrow25989974/status/2033910500782969237', thumbnail: '08_ai_video/previews/dqa-story-01.png', badge: 'DQA物語01 / DQA', date: '2026-03-17', genre: 'DQA', type: 'ストーリー', sortGenre: 'dqa', sortType: 'story', storyNumber: 1 },
    { title: 'うちのAI社員が仕事もせず急に歌いだした', id: 'dqa-ai-employee-song', url: 'https://x.com/ARrow25989974/status/2090096682457571534', thumbnail: '08_ai_video/previews/ai-employee-sings.png', badge: 'DQA / AI社員 / MV', genre: '音楽', type: 'AI社員', sortGenre: 'music', sortType: 'mv', tags: ['DQA', 'AI社員', 'MV'] },
    { title: 'くりえみAIフィルムコンテスト制作映像（仮）', url: 'https://x.com/ARrow25989974/status/2039022920853512213', thumbnail: '08_ai_video/previews/kuriemi-ai-film.jpg', badge: 'チャレンジ記録' },
    { title: 'AIしてもいいですか？ 第3話', id: 'dqa-story-03', url: 'https://x.com/ARrow25989974/status/2071973696450031747', badge: 'ショートフィルム', challenge: 'コロテック応募作品 / AIしてもいいですか？ 第3話', storyNumber: 3, relatedLinks: [{ label: 'コロテック公式サイト', url: 'https://colo-tek.com/' }, { label: 'X投稿', url: 'https://x.com/ARrow25989974/status/2071973696450031747' }], submissionNote: `コロテック運営事務局でございます。\nこの度は、本コンテストに作品をご応募いただき、誠にありがとうございました。\n\n今回は、約350作品ものご応募をいただきました。いずれの作品からも、クリエイターの皆様の熱意と創造性が感じられ、審査は非常に難しいものとなりました。慎重に選考を重ねた結果、誠に残念ながら、今回はノミネート作品への選出を見送らせていただくこととなりました。\n\n今回の結果は、本コンテストの審査基準に基づき総合的に判断したものであり、作品そのものの価値や、皆様の創造性を否定するものではございません。\n\n魅力ある作品をご応募いただきましたことに、改めて心より御礼申し上げます。` },
    { title: 'クリムゾンミラーポンド', id: 'crimson-mirror-pond', url: driveVideoLinks.crimson.url, drivePreviewUrl: driveVideoLinks.crimson.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/crimson-mirror-pond.jpg', awardImage: '08_ai_video/previews/crimson-award.jpg', badge: 'SousakuAI Agent Creation Cup Vol.2', challenge: '特撮カテゴリ / AIアニメーション', date: '2026-07-22', genre: 'アクション', type: '短編アニメ', sortGenre: 'action', sortType: 'short', judgeComments: ['特撮カテゴリでアニメ映像への挑戦で評価に悩んだ作品です。アニメがダメなわけではないですが、コンテストの主旨として特撮らしい演出をもっと盛り込んで欲しかったです。', '「クリムゾンミラーポンド」というタイトルと、音楽の入りから一気に作品の世界観へ引き込まれました。登場するモンスターもとても愛らしく、作品ならではの魅力を感じました。', '物語の展開がやや唐突に感じられる場面があり、セリフの訛りや、BGM・環境音のバランスが整うことで、作品全体がさらに自然で見やすくなりそうです。'] },
    { title: 'WFAIA 2026 広告部門', id: 'wfaia-ad', url: driveVideoLinks.wfaiaAd.url, drivePreviewUrl: driveVideoLinks.wfaiaAd.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-ad.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 大会情報', badge: 'WFAIA 2026 / 広告部門', challenge: '2026年7月31日提出', date: '2026-07-31', genre: '広告', type: 'CM', sortGenre: 'advertising', sortType: 'cm' },
    { title: 'WFAIA 2026 ショートドラマ部門', id: 'wfaia-drama', url: driveVideoLinks.wfaiaDrama.url, drivePreviewUrl: driveVideoLinks.wfaiaDrama.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-drama.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 大会情報', badge: 'WFAIA 2026 / ショートドラマ部門', challenge: '2026年8月14日提出', date: '2026-08-14', genre: 'ドラマ', type: 'ショートドラマ', sortGenre: 'drama', sortType: 'short' },
    { title: '2026 GAINA魂 15秒CM', id: 'gaina-cm', url: driveVideoLinks.gainaCm.url, drivePreviewUrl: driveVideoLinks.gainaCm.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-cm-user.jpg', badge: '広告 / CM', challenge: '納品版と関連映像を1作品として掲載', date: '2026-06-21', genre: '広告', type: 'CM', sortGenre: 'advertising', sortType: 'cm' },
    { title: '2026 GAINA魂 設置例', id: 'gaina-installation', url: driveVideoLinks.gainaInstallation.url, drivePreviewUrl: driveVideoLinks.gainaInstallation.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-installation.jpg', badge: '設置例 / 実写', challenge: 'GAINA魂会場の設置例', date: '2026-06-21', genre: 'イベント', type: '設置例', sortGenre: 'event', sortType: 'installation' },
    { title: '晃貴・鳥取県知事表敬訪問【前編】', url: 'https://www.youtube.com/watch?v=6qYAWsS7U0o', embedUrl: 'https://www.youtube.com/embed/6qYAWsS7U0o?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-6qYAWsS7U0o.jpg', badge: '密着・実写編集', date: '2026-06-30', genre: '実写', type: '密着編集', sortGenre: 'documentary', sortType: 'documentary' },
    { title: '晃貴・鳥取凱旋【密着#2】', url: 'https://www.youtube.com/watch?v=1l8PwbJh8sM', embedUrl: 'https://www.youtube.com/embed/1l8PwbJh8sM?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-1l8PwbJh8sM.jpg', badge: '密着・実写編集', date: '2026-07-17', genre: '実写', type: '密着編集', sortGenre: 'documentary', sortType: 'documentary' }
  ],
  en: [
    { title: "Ayi's Art of War Briefing", url: 'https://x.com/ARrow25989974/status/2094183380527284391', badge: 'MV / Floyo H3 I2V Turbo' },
    { title: 'Walk the Middle', url: 'https://x.com/ARrow25989974/status/2093302634501595187', badge: 'Official Image Song' },
    { title: 'Deliver, One Thing at a Time', url: 'https://x.com/ARrow25989974/status/2092275374210076776', badge: 'Official Image Song' },
    { title: 'AI Employee Dance (Working Title)', url: 'https://x.com/ARrow25989974/status/2091763869006061917', badge: 'AI Employees / Dance' },
    { title: 'Beyond the Waterway', url: 'https://x.com/ARrow25989974/status/2090584633108996264', badge: 'DQA News ED' },
    { title: 'Moonlit Rooftop Battle (Working Title)', url: 'https://x.com/ARrow25989974/status/2084342226986115178', badge: 'AI Action' },
    { title: 'How to Use SousakuAI', url: 'https://x.com/ARrow25989974/status/2082301345034633579', badge: 'Tutorial' },
    { title: 'DQA Story 01', id: 'dqa-story-01', url: 'https://x.com/ARrow25989974/status/2033910500782969237', thumbnail: '08_ai_video/previews/dqa-story-01.png', badge: 'DQA Story 01 / DQA', date: '2026-03-17', genre: 'DQA', type: 'Story', sortGenre: 'dqa', sortType: 'story', storyNumber: 1 },
    { title: 'My AI Employee Suddenly Started Singing', id: 'dqa-ai-employee-song', url: 'https://x.com/ARrow25989974/status/2090096682457571534', thumbnail: '08_ai_video/previews/ai-employee-sings.png', badge: 'DQA / AI Employee / MV', genre: 'Music', type: 'AI Employee', sortGenre: 'music', sortType: 'mv', tags: ['DQA', 'AI社員', 'MV'] },
    { title: 'Kuriemi AI Film Contest Challenge (Working Title)', url: 'https://x.com/ARrow25989974/status/2039022920853512213', thumbnail: '08_ai_video/previews/kuriemi-ai-film.jpg', badge: 'Challenge Log' },
    { title: 'May I Love AI? Episode 3', url: 'https://x.com/ARrow25989974/status/2071973696450031747', badge: 'Short Film' },
    { title: 'Crimson Mirror Pond', id: 'crimson-mirror-pond', url: driveVideoLinks.crimson.url, drivePreviewUrl: driveVideoLinks.crimson.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/crimson-mirror-pond.jpg', awardImage: '08_ai_video/previews/crimson-award.jpg', badge: 'SousakuAI Agent Creation Cup Vol.2', challenge: 'Special Effects Category / AI Animation', date: '2026-07-22', genre: 'Action', type: 'Short Animation', sortGenre: 'action', sortType: 'short', judgeComments: ['This was a challenging entry in the special-effects category, and we struggled with how to evaluate its animated approach. Animation is not a problem, but we wanted to see more special-effects-style direction for the contest theme.', 'The title and the opening music pulled us straight into the world of Crimson Mirror Pond. The monsters were charming and gave the work a distinctive appeal.', 'Some story turns felt abrupt. Smoother dialogue, BGM, and ambience would make the work even easier to follow.'] },
    { title: 'WFAIA 2026 Advertising Category', id: 'wfaia-ad', url: driveVideoLinks.wfaiaAd.url, drivePreviewUrl: driveVideoLinks.wfaiaAd.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-ad.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 event information', badge: 'WFAIA 2026 / Advertising', challenge: 'Submitted July 31, 2026', date: '2026-07-31', genre: 'Advertising', type: 'Commercial', sortGenre: 'advertising', sortType: 'cm' },
    { title: 'WFAIA 2026 Short Drama Category', id: 'wfaia-drama', url: driveVideoLinks.wfaiaDrama.url, drivePreviewUrl: driveVideoLinks.wfaiaDrama.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-drama.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 event information', badge: 'WFAIA 2026 / Short Drama', challenge: 'Submitted August 14, 2026', date: '2026-08-14', genre: 'Drama', type: 'Short Drama', sortGenre: 'drama', sortType: 'short' },
    { title: '2026 GAINA Soul 15s Commercial', id: 'gaina-cm', url: driveVideoLinks.gainaCm.url, drivePreviewUrl: driveVideoLinks.gainaCm.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-cm-user.jpg', badge: 'Advertising / Commercial', challenge: 'Two related delivery videos represented as one work', date: '2026-06-21', genre: 'Advertising', type: 'Commercial', sortGenre: 'advertising', sortType: 'cm' },
    { title: '2026 GAINA Soul Installation Example', id: 'gaina-installation', url: driveVideoLinks.gainaInstallation.url, drivePreviewUrl: driveVideoLinks.gainaInstallation.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-installation.jpg', badge: 'Installation / Live Action', challenge: 'GAINA Soul venue installation example', date: '2026-06-21', genre: 'Event', type: 'Installation', sortGenre: 'event', sortType: 'installation' },
    { title: 'Koki Visits the Tottori Governor (Part 1)', url: 'https://www.youtube.com/watch?v=6qYAWsS7U0o', embedUrl: 'https://www.youtube.com/embed/6qYAWsS7U0o?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-6qYAWsS7U0o.jpg', badge: 'Documentary Edit', date: '2026-06-30', genre: 'Documentary', type: 'Documentary Edit', sortGenre: 'documentary', sortType: 'documentary' },
    { title: 'Koki Returns to Tottori (Behind the Scenes #2)', url: 'https://www.youtube.com/watch?v=1l8PwbJh8sM', embedUrl: 'https://www.youtube.com/embed/1l8PwbJh8sM?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-1l8PwbJh8sM.jpg', badge: 'Documentary Edit', date: '2026-07-17', genre: 'Documentary', type: 'Documentary Edit', sortGenre: 'documentary', sortType: 'documentary' }
  ],
  zh: [
    { title: '爱依的孙子兵法简报', url: 'https://x.com/ARrow25989974/status/2094183380527284391', badge: 'MV / Floyo H3 I2V Turbo' },
    { title: '走在正中间', url: 'https://x.com/ARrow25989974/status/2093302634501595187', badge: '官方印象曲' },
    { title: '一件一件地，送达', url: 'https://x.com/ARrow25989974/status/2092275374210076776', badge: '官方印象曲' },
    { title: 'AI员工舞蹈（暂定）', url: 'https://x.com/ARrow25989974/status/2091763869006061917', badge: 'AI员工 / 舞蹈' },
    { title: '水道彼方（Beyond the Waterway）', url: 'https://x.com/ARrow25989974/status/2090584633108996264', badge: 'DQA新闻片尾' },
    { title: '月夜沉没屋顶之战（暂定）', url: 'https://x.com/ARrow25989974/status/2084342226986115178', badge: 'AI动作' },
    { title: 'SousakuAI使用方法', url: 'https://x.com/ARrow25989974/status/2082301345034633579', badge: '教程' },
    { title: 'DQA故事01', id: 'dqa-story-01', url: 'https://x.com/ARrow25989974/status/2033910500782969237', thumbnail: '08_ai_video/previews/dqa-story-01.png', badge: 'DQA故事01 / DQA', date: '2026-03-17', genre: 'DQA', type: '故事', sortGenre: 'dqa', sortType: 'story', storyNumber: 1 },
    { title: '我的AI员工突然开始唱歌', id: 'dqa-ai-employee-song', url: 'https://x.com/ARrow25989974/status/2090096682457571534', thumbnail: '08_ai_video/previews/ai-employee-sings.png', badge: 'DQA / AI员工 / MV', genre: '音乐', type: 'AI员工', sortGenre: 'music', sortType: 'mv', tags: ['DQA', 'AI社員', 'MV'] },
    { title: 'Kuriemi AI电影大赛挑战（暂定）', url: 'https://x.com/ARrow25989974/status/2039022920853512213', thumbnail: '08_ai_video/previews/kuriemi-ai-film.jpg', badge: '挑战记录' },
    { title: '可以爱上AI吗？ 第3话', url: 'https://x.com/ARrow25989974/status/2071973696450031747', badge: '短片' },
    { title: '绯红镜池', id: 'crimson-mirror-pond', url: driveVideoLinks.crimson.url, drivePreviewUrl: driveVideoLinks.crimson.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/crimson-mirror-pond.jpg', awardImage: '08_ai_video/previews/crimson-award.jpg', badge: 'SousakuAI Agent Creation Cup Vol.2', challenge: '特摄类别 / AI动画', date: '2026-07-22', genre: '动作', type: '短篇动画', sortGenre: 'action', sortType: 'short', judgeComments: ['这是一部在特摄类别中挑战动画表现的作品，我们在评价上曾感到犹豫。动画本身并不是问题，但如果更加入特摄风格的演出，会更贴合比赛主题。', '作品标题与音乐一开始就把观众带入了绯红镜池的世界。登场怪物非常可爱，也形成了作品独有的魅力。', '部分故事展开略显突然。如果对白、BGM与环境音的平衡更顺畅，作品会更易观看。'] },
    { title: 'WFAIA 2026 广告类别', id: 'wfaia-ad', url: driveVideoLinks.wfaiaAd.url, drivePreviewUrl: driveVideoLinks.wfaiaAd.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-ad.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 大赛信息', badge: 'WFAIA 2026 / 广告', challenge: '2026年7月31日提交', date: '2026-07-31', genre: '广告', type: 'CM', sortGenre: 'advertising', sortType: 'cm' },
    { title: 'WFAIA 2026 短剧类别', id: 'wfaia-drama', url: driveVideoLinks.wfaiaDrama.url, drivePreviewUrl: driveVideoLinks.wfaiaDrama.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/wfaia-drama.jpg', supportingImage: '08_ai_video/previews/wfaia-context.jpg', supportingImageLabel: 'WFAIA 2026 大赛信息', badge: 'WFAIA 2026 / 短剧', challenge: '2026年8月14日提交', date: '2026-08-14', genre: '剧情', type: '短剧', sortGenre: 'drama', sortType: 'short' },
    { title: '2026 GAINA魂 15秒CM', id: 'gaina-cm', url: driveVideoLinks.gainaCm.url, drivePreviewUrl: driveVideoLinks.gainaCm.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-cm-user.jpg', badge: '广告 / CM', challenge: '两份相关交付视频作为一件作品展示', date: '2026-06-21', genre: '广告', type: 'CM', sortGenre: 'advertising', sortType: 'cm' },
    { title: '2026 GAINA魂 设置示例', id: 'gaina-installation', url: driveVideoLinks.gainaInstallation.url, drivePreviewUrl: driveVideoLinks.gainaInstallation.preview, platform: 'local', localOnly: true, thumbnail: '08_ai_video/previews/gaina-installation.jpg', badge: '设置示例 / 实拍', challenge: 'GAINA魂会场设置示例', date: '2026-06-21', genre: '活动', type: '设置示例', sortGenre: 'event', sortType: 'installation' },
    { title: '晃贵拜访鸟取县知事【前篇】', url: 'https://www.youtube.com/watch?v=6qYAWsS7U0o', embedUrl: 'https://www.youtube.com/embed/6qYAWsS7U0o?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-6qYAWsS7U0o.jpg', badge: '跟拍 / 实拍剪辑', date: '2026-06-30', genre: '纪实', type: '跟拍剪辑', sortGenre: 'documentary', sortType: 'documentary' },
    { title: '晃贵回到鸟取【跟拍#2】', url: 'https://www.youtube.com/watch?v=1l8PwbJh8sM', embedUrl: 'https://www.youtube.com/embed/1l8PwbJh8sM?rel=0', platform: 'youtube', thumbnail: '08_ai_video/previews/youtube-1l8PwbJh8sM.jpg', badge: '跟拍 / 实拍剪辑', date: '2026-07-17', genre: '纪实', type: '跟拍剪辑', sortGenre: 'documentary', sortType: 'documentary' }
  ]
};

// AI動画データ - 日時降順（Status IDが大きい順）でソート
const getAIVideoData = (language: Language): AIVideoItem[] => {
  const awardCopy = {
    ja: {
      title: 'AIしてもいいですか？',
      badge: 'ストーリー部門 参加作品',
      challenge: '近未来SF / AIヒューマンドラマ / ショートフィルム',
      judgeComments: [
        '新しいものを買いがちな自分にも刺さりました。曲もとても好みでしたが、途中でロボット2人が戦い出す理由付けが、もうちょっと何か欲しいなと思いました。',
        '作品に込めた情熱と、AI Agentを駆使した表現力は本当に素晴らしいものでした。'
      ]
    },
    en: {
      title: 'May I Love AI?',
      badge: 'Storytelling Category Entry',
      challenge: 'Near-Future Sci-Fi / AI Human Drama / Short Film',
      judgeComments: [
        'As someone who tends to buy new things, this really resonated with me. I also loved the song, though I wanted a little more motivation for why the two robots suddenly started fighting.',
        'The passion poured into the work and the expressive power achieved through AI Agents were truly outstanding.'
      ]
    },
    zh: {
      title: '可以爱上AI吗？',
      badge: '故事部门 参赛作品',
      challenge: '近未来科幻 / AI人性剧情 / 短片',
      judgeComments: [
        '这部作品也触动了总是容易购买新东西的我。我也很喜欢音乐，不过如果能再补充一些两个机器人中途开战的理由就更好了。',
        '作品中倾注的热情，以及运用AI Agent展现出的表现力，真的非常出色。'
      ]
    }
  }[language];

  const awardVideo: AIVideoItem = {
    ...awardCopy,
    id: 'dqa-story-02',
    storyNumber: 2,
    url: sousakuAwardAssets.eventUrl,
    videoUrl: sousakuAwardAssets.videoUrl,
    thumbnail: sousakuAwardAssets.thumbnail,
    awardImage: sousakuAwardAssets.awardImage,
    date: '2026-06-21',
    genre: 'ドラマ',
    type: '短編フィルム',
    sortGenre: 'drama',
    sortType: 'short',
    featured: true
  };

  const videoData = {
    ja: [
      { title: "Animon動画チャレンジ「2026年の願い」", url: "https://x.com/ARrow25989974/status/2013537013883097376", thumbnail: "thumbnails/2013537013883097376.jpg", badge: "Animon感謝賞 受賞作品" },
      { title: "アニモン動画チャレンジ:フレーム抽出・切り抜き機能登場!", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1", thumbnail: "thumbnails/2000872251089105122.jpg" },
      { title: "アニモン動画チャレンジ:15秒CM「新モデル＆大型アップデート」", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20", thumbnail: "thumbnails/1996874239379673494.jpg" },
      { title: "あなたの市場価値、もうゼロになりますよ?―デザイナーの気づき", url: "https://x.com/i/status/1993896080162029641", thumbnail: "thumbnails/1993896080162029641.jpg" },
      { title: "アニモンニュース:APIプラットフォーム正式リリース", url: "https://x.com/i/status/1991162516550873523", thumbnail: "thumbnails/1991162516550873523.jpg" },
      { title: "アニモン banana登場", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1", thumbnail: "thumbnails/1970635643949850761.jpg" },
      { title: "ちゃっちぱい「学園モチーフ」", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1", thumbnail: "thumbnails/1961406607054799279.jpg" },
      { title: "ルーター攻撃", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1", thumbnail: "thumbnails/1960726834204827922.jpg" },
      { title: "みちぽっぽ", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1", thumbnail: "thumbnails/1945170933490106776.jpg" },
      { title: "「ドラグーンクエストzero」 #ViduGameShow", url: "https://x.com/i/status/1944091331946791330", thumbnail: "thumbnails/1944091331946791330.jpg" },
      { title: "もふたんラジオ", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1", thumbnail: "thumbnails/1926330046676959698.jpg" },
      { title: "ふくぎょう物語テーマ", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1", thumbnail: "thumbnails/1915256448382353733.jpg" },
      { title: "近未来マネタイズ少女", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1", thumbnail: "thumbnails/1892505972783935836.jpg" },
      { title: "「シティーハンター」と「Get Wild」の深い絆", url: "https://x.com/i/status/1790776395083510023", thumbnail: "thumbnails/1790776395083510023.jpg" },
      { title: "スヌーピーファミリーのオラフ:自己否定せずに生きることの大切さ", url: "https://x.com/i/status/1790031826997682486", thumbnail: "thumbnails/1790031826997682486.jpg" },
      { title: "プロレスラー大岩選手のBLから学ぶ:裏切りを乗り越える心理テクニック", url: "https://x.com/i/status/1789658408905568703", thumbnail: "thumbnails/1789658408905568703.jpg" },
      { title: "AI副業での挫折を乗り越え、成功へ導く方法", url: "https://x.com/i/status/1788592514691420539", thumbnail: "thumbnails/1788592514691420539.jpg" },
      { title: "新型 Switchとマリオと共に未来へジャンプ:任天堂の戦略", url: "https://x.com/i/status/1788236161787498663", thumbnail: "thumbnails/1788236161787498663.jpg" },
      { title: "マクロスの歌姫から学ぶ:歌詞が記憶に刻む感情の力", url: "https://x.com/i/status/1787855899681489148", thumbnail: "thumbnails/1787855899681489148.jpg" },
      { title: "中学生でも理解できる!究極のターゲットオーディエンス明確化方法", url: "https://x.com/i/status/1784560592101240883", thumbnail: "thumbnails/1784560592101240883.jpg" },
      { title: "アルミンに学ぶ!頭脳派の副業戦略", url: "https://x.com/i/status/1777349276882116673", thumbnail: "thumbnails/1777349276882116673.jpg" },
      { title: "山の頂上で瞑想:AIによるディープフェイク表現", url: "https://x.com/i/status/1769009441066881332", thumbnail: "thumbnails/1769009441066881332.jpg", objectPosition: 'top' },
      { title: "ディープフェイクダンス完成!", url: "https://x.com/i/status/1762397789261283597", thumbnail: "thumbnails/1762397789261283597.jpg", objectPosition: 'top' },
      { title: "ダンス元画像比較", url: "https://x.com/i/status/1762150135101096436", thumbnail: "thumbnails/1762150135101096436.jpg", objectPosition: 'center 12%' }
    ],
    en: [
      { title: "Animon Video Challenge: A Wish for 2026", url: "https://x.com/ARrow25989974/status/2013537013883097376", thumbnail: "thumbnails/2013537013883097376.jpg", badge: "Animon Appreciation Award Winner" },
      { title: "Animon Video Challenge: Frame Extraction & Cutout Feature!", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1", thumbnail: "thumbnails/2000872251089105122.jpg" },
      { title: "Animon Video Challenge: 15s CM 'New Model & Major Update'", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20", thumbnail: "thumbnails/1996874239379673494.jpg" },
      { title: "Your Market Value Will Be Zero - Designer's Realization", url: "https://x.com/i/status/1993896080162029641", thumbnail: "thumbnails/1993896080162029641.jpg" },
      { title: "Animon News: API Platform Official Release", url: "https://x.com/i/status/1991162516550873523", thumbnail: "thumbnails/1991162516550873523.jpg" },
      { title: "Animon Banana Debut", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1", thumbnail: "thumbnails/1970635643949850761.jpg" },
      { title: "Chatchipai 'School Motif'", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1", thumbnail: "thumbnails/1961406607054799279.jpg" },
      { title: "Router Attack", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1", thumbnail: "thumbnails/1960726834204827922.jpg" },
      { title: "Michipoppo", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1", thumbnail: "thumbnails/1945170933490106776.jpg" },
      { title: "'Dragoon Quest Zero' #ViduGameShow", url: "https://x.com/i/status/1944091331946791330", thumbnail: "thumbnails/1944091331946791330.jpg" },
      { title: "Mofutan Radio", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1", thumbnail: "thumbnails/1926330046676959698.jpg" },
      { title: "Side Business Story Theme", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1", thumbnail: "thumbnails/1915256448382353733.jpg" },
      { title: "Near-Future Monetization Girl", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1", thumbnail: "thumbnails/1892505972783935836.jpg" },
      { title: "Deep Bond Between 'City Hunter' and 'Get Wild'", url: "https://x.com/i/status/1790776395083510023", thumbnail: "thumbnails/1790776395083510023.jpg" },
      { title: "Olaf from Snoopy Family: Importance of Living Without Self-Denial", url: "https://x.com/i/status/1790031826997682486", thumbnail: "thumbnails/1790031826997682486.jpg" },
      { title: "Learning from Wrestler Oiwa's BL: Psychological Techniques to Overcome Betrayal", url: "https://x.com/i/status/1789658408905568703", thumbnail: "thumbnails/1789658408905568703.jpg" },
      { title: "Overcoming Setbacks in AI Side Business and Leading to Success", url: "https://x.com/i/status/1788592514691420539", thumbnail: "thumbnails/1788592514691420539.jpg" },
      { title: "Jumping to the Future with New Switch and Mario: Nintendo's Strategy", url: "https://x.com/i/status/1788236161787498663", thumbnail: "thumbnails/1788236161787498663.jpg" },
      { title: "Learning from Macross Divas: The Power of Lyrics to Engrave Emotions in Memory", url: "https://x.com/i/status/1787855899681489148", thumbnail: "thumbnails/1787855899681489148.jpg" },
      { title: "Even Middle Schoolers Can Understand! Ultimate Target Audience Clarification Method", url: "https://x.com/i/status/1784560592101240883", thumbnail: "thumbnails/1784560592101240883.jpg" },
      { title: "Learning from Armin! Intellectual Side Business Strategy", url: "https://x.com/i/status/1777349276882116673", thumbnail: "thumbnails/1777349276882116673.jpg" },
      { title: "Meditation on Mountain Peak: AI Deepfake Expression", url: "https://x.com/i/status/1769009441066881332", thumbnail: "thumbnails/1769009441066881332.jpg", objectPosition: 'top' },
      { title: "Deepfake Dance Complete!", url: "https://x.com/i/status/1762397789261283597", thumbnail: "thumbnails/1762397789261283597.jpg", objectPosition: 'top' },
      { title: "Original Dance Image Comparison", url: "https://x.com/i/status/1762150135101096436", thumbnail: "thumbnails/1762150135101096436.jpg", objectPosition: 'center 12%' }
    ],
    zh: [
      { title: "Animon视频挑战：2026年的愿望", url: "https://x.com/ARrow25989974/status/2013537013883097376", thumbnail: "thumbnails/2013537013883097376.jpg", badge: "Animon感谢奖 获奖作品" },
      { title: "Animon视频挑战：帧提取·剪切功能登场！", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1", thumbnail: "thumbnails/2000872251089105122.jpg" },
      { title: "Animon视频挑战：15秒CM「新模型&大型更新」", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20", thumbnail: "thumbnails/1996874239379673494.jpg" },
      { title: "你的市场价值将归零——设计师的觉悟", url: "https://x.com/i/status/1993896080162029641", thumbnail: "thumbnails/1993896080162029641.jpg" },
      { title: "Animon新闻：API平台正式发布", url: "https://x.com/i/status/1991162516550873523", thumbnail: "thumbnails/1991162516550873523.jpg" },
      { title: "Animon Banana登场", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1", thumbnail: "thumbnails/1970635643949850761.jpg" },
      { title: "Chatchipai「学园主题」", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1", thumbnail: "thumbnails/1961406607054799279.jpg" },
      { title: "路由器攻击", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1", thumbnail: "thumbnails/1960726834204827922.jpg" },
      { title: "Michipoppo", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1", thumbnail: "thumbnails/1945170933490106776.jpg" },
      { title: "「龙骑士任务Zero」#ViduGameShow", url: "https://x.com/i/status/1944091331946791330", thumbnail: "thumbnails/1944091331946791330.jpg" },
      { title: "Mofutan电台", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1", thumbnail: "thumbnails/1926330046676959698.jpg" },
      { title: "副业故事主题", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1", thumbnail: "thumbnails/1915256448382353733.jpg" },
      { title: "近未来变现少女", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1", thumbnail: "thumbnails/1892505972783935836.jpg" },
      { title: "「城市猎人」与「Get Wild」的深厚羁绊", url: "https://x.com/i/status/1790776395083510023", thumbnail: "thumbnails/1790776395083510023.jpg" },
      { title: "史努比家族的奥拉夫：不自我否定地生活的重要性", url: "https://x.com/i/status/1790031826997682486", thumbnail: "thumbnails/1790031826997682486.jpg" },
      { title: "从摔跤手大岩选手的BL学习：克服背叛的心理技巧", url: "https://x.com/i/status/1789658408905568703", thumbnail: "thumbnails/1789658408905568703.jpg" },
      { title: "克服AI副业挫折并走向成功的方法", url: "https://x.com/i/status/1788592514691420539", thumbnail: "thumbnails/1788592514691420539.jpg" },
      { title: "与新型Switch和马里奥一起跳向未来：任天堂的战略", url: "https://x.com/i/status/1788236161787498663", thumbnail: "thumbnails/1788236161787498663.jpg" },
      { title: "从Macross歌姬学习：歌词铭刻记忆的情感力量", url: "https://x.com/i/status/1787855899681489148", thumbnail: "thumbnails/1787855899681489148.jpg" },
      { title: "中学生也能理解！终极目标受众明确化方法", url: "https://x.com/i/status/1784560592101240883", thumbnail: "thumbnails/1784560592101240883.jpg" },
      { title: "向阿尔敏学习！智囊型副业战略", url: "https://x.com/i/status/1777349276882116673", thumbnail: "thumbnails/1777349276882116673.jpg" },
      { title: "山顶冥想：AI深度伪造表现", url: "https://x.com/i/status/1769009441066881332", thumbnail: "thumbnails/1769009441066881332.jpg", objectPosition: 'top' },
      { title: "深度伪造舞蹈完成！", url: "https://x.com/i/status/1762397789261283597", thumbnail: "thumbnails/1762397789261283597.jpg", objectPosition: 'top' },
      { title: "舞蹈原始图像对比", url: "https://x.com/i/status/1762150135101096436", thumbnail: "thumbnails/1762150135101096436.jpg", objectPosition: 'center 12%' }
    ]
  };
  return applyAIVideoMetadata([awardVideo, ...additionalAIVideoData[language], ...videoData[language]]);
};

// --- コンポーネント ---

const Navigation = ({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations.nav[language];
  const links = [
    { name: t.about, href: '#about' },
    { name: t.aiManga, href: '#aimanga' },
    { name: t.aiVideo, href: '#aivideos' },
    { name: t.portfolio, href: '#portfolio' },
    { name: t.vibeCoding, href: '#vibecoding' },
    { name: t.blog, href: 'https://note.com/dql', external: true },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <a href="#" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <span className="text-white">Design Quest</span>
          <span className="text-orange-500">AI</span>
        </a>

        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (link.external) {
                  e.preventDefault();
                  window.open(link.href, '_blank', 'noopener,noreferrer');
                }
              }}
              className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider"
            >
              {link.name}
            </a>
          ))}
          
          {/* Language Switcher */}
          <div className="flex items-center gap-2 ml-4 border-l border-gray-700 pl-4">
            {(['ja', 'en', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                  language === lang 
                    ? 'text-orange-500 border-b-2 border-orange-500' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-950 border-b border-gray-800 p-6 flex flex-col space-y-4 shadow-2xl">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-lg font-medium text-gray-300 hover:text-orange-500"
              onClick={(e) => {
                setIsOpen(false);
                if (link.external) {
                  e.preventDefault();
                  window.open(link.href, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {link.name}
            </a>
          ))}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
            {(['ja', 'en', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setIsOpen(false); }}
                className={`px-3 py-1 text-sm font-bold uppercase tracking-wider transition-all ${
                  language === lang 
                    ? 'text-orange-500 border-b-2 border-orange-500' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ language }: { language: Language }) => {
  const t = translations.hero[language];
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950/20 z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
      
      <div className="relative z-10 text-center px-4 w-full max-w-[98vw] mx-auto">
        <div className="inline-block mb-8 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
          New Era of Creativity
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-10 text-white leading-none tracking-tighter uppercase py-4">
          {t.title.split(' ').slice(0, -1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 font-black">{t.title.split(' ').slice(-1)}</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
          {t.subtitle}<br className="hidden md:block" />
          {t.description}
        </p>
      </div>
    </section>
  );
};

const About = ({ language }: { language: Language }) => {
  const t = translations.about[language];
  
  return (
    <section id="about" className="py-24 bg-gray-950">
      <div className="max-w-5xl mx-auto px-6">
      <div className="bg-gray-900/40 p-10 md:p-20 rounded-[3rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[120px] -mr-40 -mt-40"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">{t.title}</h2>
            <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-500 hover:scale-110">
              <SmartImage 
                src="img/あろうAiデザインメンター_icon.jpeg" 
                alt="あろうAiデザインメンター" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="max-w-4xl space-y-8">
            <p className="text-lg md:text-2xl text-white font-bold leading-snug tracking-tight">
              {t.bio1}
            </p>
            <p className="text-sm md:text-lg text-gray-400 leading-relaxed font-light">
              {t.bio2}
            </p>
            
            <div className="pt-8 max-w-3xl mx-auto">
              <p className="text-gray-300 font-bold text-sm md:text-base leading-relaxed border-t border-gray-800 pt-8">
                {t.lab}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Layout size={14} strokeWidth={3} /> {t.mainTools}
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">{t.toolsList}</p>
            </div>
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Cpu size={14} strokeWidth={3} /> {t.aiTools}
              </h4>
              <p className="text-white text-xs md:text-sm leading-relaxed font-bold">{t.aiToolsList}</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <span className="text-lg font-black italic">F</span> {t.fonts}
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">{t.fontsList}</p>
            </div>
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <ImageIcon size={14} strokeWidth={3} /> {t.imageGen}
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">{t.imageGenList}</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Video size={14} strokeWidth={3} /> {t.videoGen}
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">{t.videoGenList}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};
const AIManga = ({ language }: { language: Language }) => {
  const t = translations.aiManga[language];
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <section id="aimanga" className="py-24 bg-gray-950 border-y border-gray-800/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-12 tracking-tighter uppercase">{t.title}</h2>
        
        <div 
          onClick={() => setIsOpen(true)}
          className="group relative inline-block cursor-pointer overflow-hidden rounded-[2.5rem] border border-gray-800 hover:border-orange-500 transition-all shadow-2xl">
          <SmartImage 
            src="00_ai_manga/thumbnail_cover.jpeg" 
            alt="AI漫画サムネイル" 
            className="w-full max-w-md h-auto transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
            <div className="flex items-center gap-2 text-white font-black text-lg uppercase tracking-widest">
              <Play size={24} /> {t.viewManga}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto overscroll-contain">
          <button
            onClick={() => setIsOpen(false)}
            aria-label={t.closeManga}
            className="fixed top-4 right-4 md:top-8 md:right-8 z-[110] p-3 md:p-4 bg-gray-900 rounded-full text-white hover:bg-orange-600 transition-colors shadow-2xl"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 md:gap-16 px-4 pt-24 md:pt-32 pb-40">
            {mangaPages.map((page, idx) => (
              <SmartImage 
                key={idx} 
                src={page} 
                alt={`Manga Page ${idx}`} 
                className="w-full h-auto shadow-2xl rounded-xl"
              />
            ))}
          </div>

          <div className="fixed bottom-0 left-0 z-[110] w-full p-4 md:p-8 flex justify-center pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent">
             <button 
               onClick={() => setIsOpen(false)}
               className="pointer-events-auto bg-white text-black font-black px-12 py-5 rounded-full shadow-2xl hover:scale-105 transition-transform text-xs uppercase tracking-widest"
             >
               {t.closeManga}
             </button>
          </div>
        </div>
      )}
    </section>
  );
};

const Portfolio = ({ language }: { language: Language }) => {
  const t = translations.portfolio[language];
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const portfolioItems = getPortfolioItems(language);
  
  const filteredItems = activeTab === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeTab);

  return (
    <section id="portfolio" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter uppercase">{t.title}</h2>
          <p className="text-gray-500 text-lg">{t.subtitle}</p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-orange-500 mx-auto rounded-full mb-12"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
              activeTab === cat.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
              {translations.categories[language][cat.key as keyof typeof translations.categories.ja]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[4/3] bg-gray-900/40 rounded-[2.5rem] overflow-hidden border border-gray-800/50 hover:border-orange-500/50 transition-all shadow-2xl cursor-pointer"
            >
              <SmartImage 
                src={item.src} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-10">
                <p className="text-orange-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">
                  {translations.categories[language][categories.find(c => c.id === item.category)?.key as keyof typeof translations.categories.ja]}
                </p>
                <h3 className="text-white font-bold text-xl tracking-tight leading-tight">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 backdrop-blur-3xl bg-black/95 animate-in fade-in duration-500">
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-[110]"
          >
            <X size={48} strokeWidth={1} />
          </button>
          
          <div className="w-full max-w-6xl bg-gray-950 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-800 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 md:px-12 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500">{translations.portfolioDetail[language].detail}</span>
              </div>
              <p className="font-bold text-white text-xl tracking-tight">{selectedItem.title}</p>
            </div>
            
            <div className="flex flex-col lg:flex-row h-full max-h-[75vh] overflow-hidden bg-black">
              <div className="flex-grow flex items-center justify-center p-6 md:p-10 overflow-hidden relative">
                <SmartImage 
                  src={selectedItem.src} 
                  alt={selectedItem.title} 
                  className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-xl"
                />
              </div>
              <div className="lg:w-96 p-10 md:p-12 border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-950 flex flex-col justify-between">
                <div className="space-y-10">
                  <div>
                    <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">{translations.portfolioDetail[language].category}</h4>
                    <p className="text-white font-bold text-lg">{translations.categories[language][categories.find(c => c.id === selectedItem.category)?.key as keyof typeof translations.categories.ja]}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">{translations.portfolioDetail[language].projectTitle}</h4>
                    <p className="text-white font-medium text-lg leading-snug">{selectedItem.title}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl mt-12"
                >
                  {translations.portfolioDetail[language].closeWindow}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const VibeCoding = ({ language }: { language: Language }) => {
  const t = translations.vibeCoding[language];
  const projects = getVibeCodingProjects(language);
  
  return (
  <section id="vibecoding" className="py-24 bg-gray-900/30 border-y border-gray-800/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-20 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">{t.title}</h2>
        <p className="text-gray-500 text-lg font-medium">{t.subtitle}</p>
        <div className="w-16 h-1.5 bg-orange-500 mt-6 rounded-full hidden md:block"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {projects.map((proj, i) => (
          <a key={i} href={proj.url} target="_blank" rel="noopener" className="group flex flex-col p-10 bg-gray-900 border border-gray-800 rounded-[2.5rem] text-white transition-all hover:bg-gray-800 h-full">
            <div className="flex flex-wrap gap-2 mb-6">
              {proj.tags.map(tag => <span key={tag} className="text-[10px] px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg uppercase font-black border border-orange-500/20">{tag}</span>)}
            </div>
            <h3 className="text-2xl font-bold mb-6 group-hover:text-orange-500 transition-colors leading-tight">{proj.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 flex-grow">{proj.desc}</p>
            <div className="mt-auto flex items-center gap-3 text-xs font-black uppercase tracking-widest">
              {t.launchProject} <ExternalLink size={14} className="opacity-50" />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
  );
};

type AIVideoSortMode = 'newest' | 'oldest' | 'genre' | 'type' | 'tag';

const compareAIVideos = (a: AIVideoItem, b: AIVideoItem, mode: AIVideoSortMode) => {
  if (mode === 'genre' || mode === 'type' || mode === 'tag') {
    const aKey = mode === 'genre'
      ? (a.sortGenre || a.genre || 'other')
      : mode === 'type'
        ? (a.sortType || a.type || 'other')
        : (a.tags?.[0] || 'other');
    const bKey = mode === 'genre'
      ? (b.sortGenre || b.genre || 'other')
      : mode === 'type'
        ? (b.sortType || b.type || 'other')
        : (b.tags?.[0] || 'other');
    const groupOrder = aKey.localeCompare(bKey);
    if (groupOrder !== 0) return groupOrder;
  }

  const aTime = a.date ? Date.parse(a.date) : null;
  const bTime = b.date ? Date.parse(b.date) : null;
  if (aTime !== bTime) {
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return mode === 'oldest' ? aTime - bTime : bTime - aTime;
  }

  const aSource = getAIVideoSourceId(a.url) || a.id || '';
  const bSource = getAIVideoSourceId(b.url) || b.id || '';
  return mode === 'oldest' ? aSource.localeCompare(bSource) : bSource.localeCompare(aSource);
};

const AIVideos = ({ language }: { language: Language }) => {
  const t = translations.aiVideo[language];
  const [selectedVideo, setSelectedVideo] = useState<AIVideoItem | null>(null);
  const [sortMode, setSortMode] = useState<AIVideoSortMode>('newest');
  const [tagFilter, setTagFilter] = useState('all');
  const tweetContainerRef = useRef<HTMLDivElement>(null);
  const aiVideoData = getAIVideoData(language);
  const videoKey = (video: AIVideoItem) => video.id || video.url || video.title;
  const qOrderedVideos = [...aiVideoData].sort((a, b) => compareAIVideos(a, b, 'newest'));
  const qNumberByVideoKey = new Map(
    qOrderedVideos.map((video, index) => [videoKey(video), qOrderedVideos.length - index])
  );
  const taggedVideos = aiVideoData.map((video) => {
    const qNumber = qNumberByVideoKey.get(videoKey(video));
    const manualTags = video.tags || [];
    const legacyQNumber = video.storyNumber === 1 || manualTags.length > 0 ? undefined : qNumber && qNumber > 27 ? qNumber - 2 : qNumber;
    const tagKey = getAIVideoSourceId(video.url) || video.id || video.url || video.title;
    const baseTags = aiVideoTagOverrides[tagKey]
      || (legacyQNumber ? aiVideoTagsByQ[legacyQNumber] || [] : []);
    const storyTags = video.storyNumber ? ['DQA物語', ...(video.storyNumber === 1 ? ['DQA'] : [])] : [];
    return {
      ...video,
      qNumber,
      tags: [...new Set([...storyTags, ...manualTags, ...baseTags])]
    };
  });
  const availableTags = [...new Set(taggedVideos.flatMap((video) => video.tags || []))]
    .filter((tag) => !hiddenAIVideoFilterTags.has(tag))
    .sort((a, b) => {
      const aIndex = aiVideoFilterTagOrder.indexOf(a);
      const bIndex = aiVideoFilterTagOrder.indexOf(b);
      const aRank = aIndex === -1 ? aiVideoFilterTagOrder.length : aIndex;
      const bRank = bIndex === -1 ? aiVideoFilterTagOrder.length : bIndex;
      return aRank - bRank || a.localeCompare(b, 'ja');
    });
  const filteredVideos = tagFilter === 'all'
    ? taggedVideos
    : taggedVideos.filter((video) => video.tags?.includes(tagFilter));
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (tagFilter === 'DQA物語') {
      const storyOrder = (a.storyNumber || Number.MAX_SAFE_INTEGER) - (b.storyNumber || Number.MAX_SAFE_INTEGER);
      if (storyOrder !== 0) return storyOrder;
    }
    return compareAIVideos(a, b, sortMode);
  });

  useEffect(() => {
    if (selectedVideo && !selectedVideo.videoUrl && !selectedVideo.embedUrl && !selectedVideo.localOnly && (window as any).twttr) {
      if (tweetContainerRef.current) {
        tweetContainerRef.current.innerHTML = '';
        const tweetId = getAIVideoSourceId(selectedVideo.url);
        if (tweetId) {
          (window as any).twttr.widgets.createTweet(tweetId, tweetContainerRef.current, {
            theme: 'dark',
            align: 'center',
            conversation: 'none',
            cards: 'visible'
          });
        }
      }
    }
  }, [selectedVideo]);

  return (
    <section id="aivideos" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">{t.title}</h2>
          <p className="text-gray-500 text-lg">{t.subtitle}</p>
        </div>

        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.25em]">
            {sortedVideos.length} {t.countLabel}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <label className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest">
              <span>{t.sortLabel}</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as AIVideoSortMode)}
                className="min-w-40 rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-white outline-none focus:border-orange-500"
              >
                <option value="newest">{t.newest}</option>
                <option value="oldest">{t.oldest}</option>
                <option value="genre">{t.genre}</option>
                <option value="type">{t.type}</option>
                <option value="tag">{t.tag}</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-gray-400 text-xs font-black tracking-widest">
              <span>{t.tagFilter}</span>
              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="min-w-40 rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-white outline-none focus:border-orange-500"
              >
                <option value="all">{t.allTags}</option>
                {availableTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedVideos.map((video, i) => (
            <button 
              key={video.id || video.url || video.title}
              onClick={() => setSelectedVideo(video)}
              className={`relative aspect-video bg-gray-900 border rounded-2xl hover:border-red-600 transition-all group overflow-hidden shadow-xl ${video.featured ? 'border-orange-500/70' : 'border-gray-800/50'}`}
            >
              {video.badge && (
                <div className="absolute top-3 left-3 z-30 px-3 py-1.5 rounded-full bg-orange-500 text-black text-[9px] font-black tracking-wider shadow-xl">
                  {video.badge}
                </div>
              )}
              {video.thumbnail ? (
                <SmartImage
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: video.objectPosition || 'center' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-transparent opacity-20 group-hover:opacity-10 transition-opacity"></div>
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/80 transition-colors z-0"></div>
              
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white transform group-hover:scale-90 group-hover:opacity-0 transition-all duration-300">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>

              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <p className="text-white text-[11px] md:text-xs font-bold leading-relaxed line-clamp-3 text-center">
                  {video.title}
                </p>
                {video.tags?.length ? (
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {video.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-1 text-[8px] font-black text-orange-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                  {t.watchVideo} <Play size={10} fill="currentColor" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-60">{t.aiVideoLabel} #{video.qNumber ?? sortedVideos.length - i}</p>
                <Maximize2 size={12} className="text-white opacity-40" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl bg-black/95">
          <button 
            onClick={() => setSelectedVideo(null)}
            aria-label="Close video"
            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-[110]"
          >
            <X size={40} strokeWidth={1} />
          </button>
          
          <div className={`w-full ${selectedVideo.videoUrl || selectedVideo.submissionNote ? 'max-w-[1500px]' : 'max-w-5xl'} bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-800 flex flex-col animate-in zoom-in-95 duration-300`}>
            <div className="p-6 md:px-10 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Exclusive Video Preview</span>
                {selectedVideo.badge && !selectedVideo.videoUrl && (
                  <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-orange-500 text-black text-[9px] font-black tracking-wider">
                    {selectedVideo.badge}
                  </span>
                )}
              </div>
              {selectedVideo.url ? (
                <a href={selectedVideo.url} target="_blank" rel="noopener" className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                  {selectedVideo.videoUrl ? 'VIEW ON SOUSAKU.AI' : selectedVideo.drivePreviewUrl ? 'OPEN IN GOOGLE DRIVE' : selectedVideo.embedUrl ? 'WATCH ON YOUTUBE' : 'WATCH ON X (TWITTER)'} <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">LOCAL PREVIEW</span>
              )}
            </div>
            
            <div className="max-h-[78vh] overflow-y-auto bg-black">
              {selectedVideo.videoUrl ? (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] max-h-[78vh] bg-gray-950">
                  <div className="flex items-center justify-center bg-black min-h-[260px]">
                    <video
                      src={selectedVideo.videoUrl}
                      poster={selectedVideo.thumbnail}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[78vh] aspect-video bg-black"
                    />
                  </div>

                  <div className="space-y-6 p-6 md:p-8 text-left overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-800">
                    <div>
                      <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3">SousakuAI Agent Creation Cup 2026</p>
                      <div>
                        <span className="inline-flex px-3 py-1.5 rounded-full bg-orange-500 text-black text-[10px] font-black tracking-wider">
                          {selectedVideo.badge}
                        </span>
                        <h3 className="mt-4 text-2xl md:text-3xl text-white font-black">{selectedVideo.title}</h3>
                        <p className="mt-3 text-sm text-orange-300 font-bold leading-relaxed">{selectedVideo.challenge}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">審査員コメント</p>
                      <div className="space-y-3">
                        {selectedVideo.judgeComments?.map((comment) => (
                          <blockquote key={comment} className="border-l-2 border-orange-500 pl-4 text-sm text-gray-300 leading-relaxed">
                            {comment}
                          </blockquote>
                        ))}
                      </div>
                    </div>

                    {selectedVideo.awardImage && (
                      <SmartImage
                        src={selectedVideo.awardImage}
                        alt="SousakuAI Agent Creation Cup 2026 表彰状"
                        className="w-full h-auto rounded-2xl border border-orange-500/30 shadow-2xl"
                      />
                    )}

                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black text-xs font-black hover:bg-orange-500 transition-colors"
                    >
                      SousakuAIで作品を見る <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ) : selectedVideo.localOnly ? (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] bg-gray-950">
                  <div className="flex items-center justify-center bg-black p-4 md:p-8">
                    {selectedVideo.drivePreviewUrl ? (
                      <div className="w-full aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
                        <iframe
                          src={selectedVideo.drivePreviewUrl}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          loading="lazy"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <SmartImage
                        src={selectedVideo.thumbnail || ''}
                        alt={selectedVideo.title}
                        className="w-full aspect-video object-cover rounded-2xl border border-gray-800"
                      />
                    )}
                  </div>

                  <div className="space-y-6 p-6 md:p-8 text-left border-t lg:border-t-0 lg:border-l border-gray-800">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.genre && <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-300 text-[10px] font-black">{selectedVideo.genre}</span>}
                        {selectedVideo.type && <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-black">{selectedVideo.type}</span>}
                      </div>
                      <h3 className="mt-4 text-2xl md:text-3xl text-white font-black">{selectedVideo.title}</h3>
                      {selectedVideo.date && <p className="mt-3 text-xs text-gray-500 font-bold tracking-widest">{selectedVideo.date}</p>}
                      {selectedVideo.challenge && <p className="mt-3 text-sm text-orange-300 font-bold leading-relaxed">{selectedVideo.challenge}</p>}
                    </div>

                    {selectedVideo.judgeComments && (
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">審査員コメント</p>
                        <div className="space-y-3">
                          {selectedVideo.judgeComments.map((comment) => (
                            <blockquote key={comment} className="border-l-2 border-orange-500 pl-4 text-sm text-gray-300 leading-relaxed">
                              {comment}
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedVideo.awardImage && (
                      <SmartImage
                        src={selectedVideo.awardImage}
                        alt="作品の表彰状"
                        className="w-full h-auto rounded-2xl border border-orange-500/30 shadow-2xl"
                      />
                    )}

                    {selectedVideo.supportingImage && (
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">{selectedVideo.supportingImageLabel || '関連画像'}</p>
                        <SmartImage
                          src={selectedVideo.supportingImage}
                          alt={selectedVideo.supportingImageLabel || selectedVideo.title}
                          className="w-full h-auto rounded-2xl border border-gray-800"
                        />
                      </div>
                    )}

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {selectedVideo.drivePreviewUrl
                        ? 'Google Driveの共有プレビューを表示しています。再生処理中の動画はDrive側の処理完了後に再生できます。'
                        : '原本動画はローカル素材として保管し、ここでは軽量プレビューと作品情報を表示しています。'}
                    </p>
                  </div>
                </div>
              ) : selectedVideo.embedUrl ? (
                <div className="p-4 md:p-8 bg-black">
                  <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
                    <iframe
                      src={selectedVideo.embedUrl}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className={`p-4 md:p-8 bg-black ${selectedVideo.submissionNote ? 'grid lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start' : ''}`}>
                  <div className={selectedVideo.submissionNote ? 'min-w-0 flex flex-col items-center' : 'flex flex-col items-center'}>
                    <div ref={tweetContainerRef} className="w-full flex justify-center min-h-[300px]">
                    <div className="flex flex-col items-center justify-center text-gray-600 gap-4">
                      <Play className="animate-spin" size={32} />
                      <p className="text-xs font-bold uppercase tracking-widest">Loading Video Content...</p>
                    </div>
                    </div>
                  </div>
                  {selectedVideo.submissionNote && (
                    <aside className="space-y-5 rounded-2xl border border-gray-800 bg-gray-950 p-6 text-left">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">コロテック応募情報</p>
                        <h3 className="mt-3 text-xl font-black text-white">{selectedVideo.title}</h3>
                        {selectedVideo.date && <p className="mt-2 text-xs font-bold tracking-widest text-gray-500">{selectedVideo.date}</p>}
                        {selectedVideo.challenge && <p className="mt-3 text-sm font-bold leading-relaxed text-orange-300">{selectedVideo.challenge}</p>}
                      </div>
                      {selectedVideo.relatedLinks && (
                        <div className="flex flex-wrap gap-2">
                          {selectedVideo.relatedLinks.map((link) => (
                            <a key={link.url} href={link.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-2 text-[10px] font-black text-gray-300 transition-colors hover:border-orange-500 hover:text-white">
                              {link.label} <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      )}
                      <div>
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">応募結果・運営通知</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{selectedVideo.submissionNote}</p>
                      </div>
                    </aside>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 px-10 bg-gray-950/50 text-gray-600 text-[10px] font-medium tracking-widest text-center uppercase">
              Design Quest AI Experimental Video Unit
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const gainaTranslations = {
  ja: {
    title: 'GAINA魂 2022', subtitle: 'キックボクシング大会記録',
    desc: '米子ジム主催のキックボクシング興行「Gaina魂」の大会記録映像。選手の熱気と会場の興奮を伝える作品。'
  },
  en: {
    title: 'GAINA Soul 2022', subtitle: 'Kickboxing Event Record',
    desc: 'Event footage from "Gaina Soul," a kickboxing event hosted by Yonago Gym, capturing the fighters’ intensity and the venue’s excitement.'
  },
  zh: {
    title: 'GAINA魂 2022', subtitle: '搏击大会记录',
    desc: '米子健身房主办的搏击赛事「Gaina魂」的大会记录影像，传达选手的热情与会场的兴奋感。'
  }
};

const gainaImages = [
  '02_gaina_soul/01_logo.jpeg',
  '02_gaina_soul/02_logo_image.jpeg',
  '02_gaina_soul/03_poster.jpeg',
  '02_gaina_soul/04_pamphlet.jpeg',
  '02_gaina_soul/05_tickets.jpeg',
  '02_gaina_soul/06_sns.jpeg',
  '02_gaina_soul/07_board_design.jpeg',
  '02_gaina_soul/08_business_card.jpeg'
];

const GainaShowcase = ({ language }: { language: Language }) => {
  const t = gainaTranslations[language];

  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">{t.title}</h2>
          <p className="text-gray-500 text-lg font-medium">{t.subtitle}</p>
          <div className="w-16 h-1.5 bg-orange-500 mt-6 rounded-full hidden md:block"></div>
          <p className="text-gray-400 text-sm leading-relaxed mt-6 max-w-2xl">{t.desc}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {gainaImages.map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
              <SmartImage src={src} alt={`GAINA Soul ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const App = () => {
  const [language, setLanguage] = useState<Language>('ja');

  return (
    <div className="bg-gray-950 min-h-screen">
      <Navigation language={language} setLanguage={setLanguage} />
      <main>
        <Hero language={language} />
        <About language={language} />
        <AIManga language={language} />
        <AIVideos language={language} />
        <Portfolio language={language} />
        <VibeCoding language={language} />
        <GainaShowcase language={language} />
      </main>
      
      <footer className="py-12 bg-gray-950 border-t border-gray-900 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-white">Design Quest</span>
            <span className="text-orange-500">AI</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs text-gray-400 font-medium">
            <a href="https://x.com/ARrow25989974" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              X: @ARrow25989974
            </a>
            <a href="https://line.me/R/ti/p/@347weexf?from=page&searchId=347weexf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              LINE: 公式アカウント
            </a>
            <a href="mailto:nvng75@dojyokko.ne.jp" className="hover:text-white transition-colors">
              Contact: nvng75@dojyokko.ne.jp
            </a>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; 2026 Design Quest AI. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
