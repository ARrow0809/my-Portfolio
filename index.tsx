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
    ja: { about: 'ABOUT', aiManga: 'AI漫画', aiVideo: 'AI動画', portfolio: '作品紹介', vibeCoding: 'バイブコーディング' },
    en: { about: 'ABOUT', aiManga: 'AI MANGA', aiVideo: 'AI VIDEO', portfolio: 'PORTFOLIO', vibeCoding: 'VIBE CODING' },
    zh: { about: '关于', aiManga: 'AI漫画', aiVideo: 'AI视频', portfolio: '作品集', vibeCoding: '氛围编程' }
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
      aiToolsList: 'ChatGPT / codex CLI / Antigravity / Google AI Studio / Gemini / NotebookLMなど',
      fontsList: 'Adobeフォントなど',
      imageGenList: 'NanobananaPro / StableDiffusionなど',
      videoGenList: 'Sora2 / Wan2.2など'
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
      aiToolsList: 'ChatGPT / codex CLI / Antigravity / Google AI Studio / Gemini / NotebookLM etc.',
      fontsList: 'Adobe Fonts etc.',
      imageGenList: 'NanobananaPro / StableDiffusion etc.',
      videoGenList: 'Sora2 / Wan2.2 etc.'
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
      aiToolsList: 'ChatGPT / codex CLI / Antigravity / Google AI Studio / Gemini / NotebookLM 等',
      fontsList: 'Adobe 字体等',
      imageGenList: 'NanobananaPro / StableDiffusion 等',
      videoGenList: 'Sora2 / Wan2.2 等'
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
    ja: { title: 'AI動画コレクション', subtitle: '生成AIが織りなす映像美のフロンティア', watchVideo: 'Watch Video', aiVideoLabel: 'AI Video' },
    en: { title: 'AI VIDEO COLLECTION', subtitle: 'Frontier of Visual Beauty Woven by Generative AI', watchVideo: 'Watch Video', aiVideoLabel: 'AI Video' },
    zh: { title: 'AI视频集', subtitle: '生成AI编织的视觉美学前沿', watchVideo: '观看视频', aiVideoLabel: 'AI视频' }
  },
  portfolioDetail: {
    ja: { detail: 'Portfolio Detail', category: 'Category', projectTitle: 'Project Title', closeWindow: 'Close Window' },
    en: { detail: 'Portfolio Detail', category: 'Category', projectTitle: 'Project Title', closeWindow: 'Close Window' },
    zh: { detail: '作品详情', category: '类别', projectTitle: '项目标题', closeWindow: '关闭窗口' }
  },
  promotions: {
    ja: { promo1Title: 'GAINA魂 2022 詳細', promo1Label: 'Promotion Details', promo2Title: 'My ホームページ', promo2Label: 'Official Identity' },
    en: { promo1Title: 'GAINA Soul 2022 Details', promo1Label: 'Promotion Details', promo2Title: 'My Homepage', promo2Label: 'Official Identity' },
    zh: { promo1Title: 'GAINA魂 2022 详情', promo1Label: '推广详情', promo2Title: '我的主页', promo2Label: '官方身份' }
  },
  contact: {
    ja: { title: 'CONTACT', subtitle: 'お気軽にお問い合わせください', email: 'メールを送る' },
    en: { title: 'CONTACT', subtitle: 'Feel free to contact me', email: 'Send Email' },
    zh: { title: '联系方式', subtitle: '欢迎随时联系', email: '发送邮件' }
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

// AI動画データ - 日時降順（Status IDが大きい順）でソート
const getAIVideoData = (language: Language) => {
  const videoData = {
    ja: [
      { title: "アニモン動画チャレンジ:新モデル登場!", url: "https://x.com/ARrow25989974/status/2013537013883097376" },
      { title: "アニモン動画チャレンジ:フレーム抽出・切り抜き機能登場!", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1" },
      { title: "アニモン動画チャレンジ:15秒CM「新モデル＆大型アップデート」", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20" },
      { title: "あなたの市場価値、もうゼロになりますよ?―デザイナーの気づき", url: "https://x.com/i/status/1993896080162029641" },
      { title: "アニモンニュース:APIプラットフォーム正式リリース", url: "https://x.com/i/status/1991162516550873523" },
      { title: "アニモン banana登場", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1" },
      { title: "ちゃっちぱい「学園モチーフ」", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1" },
      { title: "ルーター攻撃", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1" },
      { title: "みちぽっぽ", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1" },
      { title: "「ドラグーンクエストzero」 #ViduGameShow", url: "https://x.com/i/status/1944091331946791330" },
      { title: "もふたんラジオ", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1" },
      { title: "ふくぎょう物語テーマ", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1" },
      { title: "近未来マネタイズ少女", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1" },
      { title: "「シティーハンター」と「Get Wild」の深い絆", url: "https://x.com/i/status/1790776395083510023" },
      { title: "スヌーピーファミリーのオラフ:自己否定せずに生きることの大切さ", url: "https://x.com/i/status/1790031826997682486" },
      { title: "プロレスラー大岩選手のBLから学ぶ:裏切りを乗り越える心理テクニック", url: "https://x.com/i/status/1789658408905568703" },
      { title: "AI副業での挫折を乗り越え、成功へ導く方法", url: "https://x.com/i/status/1788592514691420539" },
      { title: "新型 Switchとマリオと共に未来へジャンプ:任天堂の戦略", url: "https://x.com/i/status/1788236161787498663" },
      { title: "マクロスの歌姫から学ぶ:歌詞が記憶に刻む感情の力", url: "https://x.com/i/status/1787855899681489148" },
      { title: "中学生でも理解できる!究極のターゲットオーディエンス明確化方法", url: "https://x.com/i/status/1784560592101240883" },
      { title: "アルミンに学ぶ!頭脳派の副業戦略", url: "https://x.com/i/status/1777349276882116673" },
      { title: "山の頂上で瞑想:AIによるディープフェイク表現", url: "https://x.com/i/status/1769009441066881332" },
      { title: "ディープフェイクダンス完成!", url: "https://x.com/i/status/1762397789261283597" },
      { title: "ダンス元画像比較", url: "https://x.com/i/status/1762150135101096436" }
    ],
    en: [
      { title: "Animon Video Challenge: New Model Released!", url: "https://x.com/ARrow25989974/status/2013537013883097376" },
      { title: "Animon Video Challenge: Frame Extraction & Cutout Feature!", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1" },
      { title: "Animon Video Challenge: 15s CM 'New Model & Major Update'", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20" },
      { title: "Your Market Value Will Be Zero - Designer's Realization", url: "https://x.com/i/status/1993896080162029641" },
      { title: "Animon News: API Platform Official Release", url: "https://x.com/i/status/1991162516550873523" },
      { title: "Animon Banana Debut", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1" },
      { title: "Chatchipai 'School Motif'", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1" },
      { title: "Router Attack", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1" },
      { title: "Michipoppo", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1" },
      { title: "'Dragoon Quest Zero' #ViduGameShow", url: "https://x.com/i/status/1944091331946791330" },
      { title: "Mofutan Radio", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1" },
      { title: "Side Business Story Theme", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1" },
      { title: "Near-Future Monetization Girl", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1" },
      { title: "Deep Bond Between 'City Hunter' and 'Get Wild'", url: "https://x.com/i/status/1790776395083510023" },
      { title: "Olaf from Snoopy Family: Importance of Living Without Self-Denial", url: "https://x.com/i/status/1790031826997682486" },
      { title: "Learning from Wrestler Oiwa's BL: Psychological Techniques to Overcome Betrayal", url: "https://x.com/i/status/1789658408905568703" },
      { title: "Overcoming Setbacks in AI Side Business and Leading to Success", url: "https://x.com/i/status/1788592514691420539" },
      { title: "Jumping to the Future with New Switch and Mario: Nintendo's Strategy", url: "https://x.com/i/status/1788236161787498663" },
      { title: "Learning from Macross Divas: The Power of Lyrics to Engrave Emotions in Memory", url: "https://x.com/i/status/1787855899681489148" },
      { title: "Even Middle Schoolers Can Understand! Ultimate Target Audience Clarification Method", url: "https://x.com/i/status/1784560592101240883" },
      { title: "Learning from Armin! Intellectual Side Business Strategy", url: "https://x.com/i/status/1777349276882116673" },
      { title: "Meditation on Mountain Peak: AI Deepfake Expression", url: "https://x.com/i/status/1769009441066881332" },
      { title: "Deepfake Dance Complete!", url: "https://x.com/i/status/1762397789261283597" },
      { title: "Original Dance Image Comparison", url: "https://x.com/i/status/1762150135101096436" }
    ],
    zh: [
      { title: "Animon视频挑战：新模型登场！", url: "https://x.com/ARrow25989974/status/2013537013883097376" },
      { title: "Animon视频挑战：帧提取·剪切功能登场！", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1" },
      { title: "Animon视频挑战：15秒CM「新模型&大型更新」", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20" },
      { title: "你的市场价值将归零——设计师的觉悟", url: "https://x.com/i/status/1993896080162029641" },
      { title: "Animon新闻：API平台正式发布", url: "https://x.com/i/status/1991162516550873523" },
      { title: "Animon Banana登场", url: "https://x.com/ARrow25989974/status/1970635643949850761/video/1" },
      { title: "Chatchipai「学园主题」", url: "https://x.com/ARrow25989974/status/1961406607054799279/video/1" },
      { title: "路由器攻击", url: "https://x.com/ARrow25989974/status/1960726834204827922/video/1" },
      { title: "Michipoppo", url: "https://x.com/ARrow25989974/status/1945170933490106776/video/1" },
      { title: "「龙骑士任务Zero」#ViduGameShow", url: "https://x.com/i/status/1944091331946791330" },
      { title: "Mofutan电台", url: "https://x.com/ARrow25989974/status/1926330046676959698/video/1" },
      { title: "副业故事主题", url: "https://x.com/ARrow25989974/status/1915256448382353733/video/1" },
      { title: "近未来变现少女", url: "https://x.com/ARrow25989974/status/1892505972783935836/video/1" },
      { title: "「城市猎人」与「Get Wild」的深厚羁绊", url: "https://x.com/i/status/1790776395083510023" },
      { title: "史努比家族的奥拉夫：不自我否定地生活的重要性", url: "https://x.com/i/status/1790031826997682486" },
      { title: "从摔跤手大岩选手的BL学习：克服背叛的心理技巧", url: "https://x.com/i/status/1789658408905568703" },
      { title: "克服AI副业挫折并走向成功的方法", url: "https://x.com/i/status/1788592514691420539" },
      { title: "与新型Switch和马里奥一起跳向未来：任天堂的战略", url: "https://x.com/i/status/1788236161787498663" },
      { title: "从Macross歌姬学习：歌词铭刻记忆的情感力量", url: "https://x.com/i/status/1787855899681489148" },
      { title: "中学生也能理解！终极目标受众明确化方法", url: "https://x.com/i/status/1784560592101240883" },
      { title: "向阿尔敏学习！智囊型副业战略", url: "https://x.com/i/status/1777349276882116673" },
      { title: "山顶冥想：AI深度伪造表现", url: "https://x.com/i/status/1769009441066881332" },
      { title: "深度伪造舞蹈完成！", url: "https://x.com/i/status/1762397789261283597" },
      { title: "舞蹈原始图像对比", url: "https://x.com/i/status/1762150135101096436" }
    ]
  };
  return videoData[language];
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
            <a key={link.href} href={link.href} className="text-gray-400 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider">
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
            <a key={link.href} href={link.href} className="text-lg font-medium text-gray-300 hover:text-orange-500" onClick={() => setIsOpen(false)}>
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
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-4 bg-gray-900 rounded-full text-white hover:bg-orange-600 transition-colors"
            >
              <X size={32} />
            </button>
          </div>
          
          <div className="w-full max-w-4xl flex flex-col gap-16 py-32 px-4 pb-80">
            {mangaPages.map((page, idx) => (
              <SmartImage 
                key={idx} 
                src={page} 
                alt={`Manga Page ${idx}`} 
                className="w-full h-auto shadow-2xl rounded-xl"
              />
            ))}
          </div>

          <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none">
             <button 
               onClick={() => setIsOpen(false)}
               className="pointer-events-auto bg-white text-black font-black px-12 py-5 rounded-full shadow-2xl hover:scale-105 transition-transform text-xs uppercase tracking-widest"
             >
               Close Manga
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

const AIVideos = ({ language }: { language: Language }) => {
  const t = translations.aiVideo[language];
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const tweetContainerRef = useRef<HTMLDivElement>(null);
  const aiVideoData = getAIVideoData(language);

  const getTweetId = (url: string) => {
    const parts = url.split('/');
    const statusIndex = parts.indexOf('status');
    if (statusIndex !== -1 && parts[statusIndex + 1]) {
      return parts[statusIndex + 1].split('?')[0];
    }
    return url.split('/').pop()?.split('?')[0] || null;
  };

  useEffect(() => {
    if (selectedVideo && (window as any).twttr) {
      if (tweetContainerRef.current) {
        tweetContainerRef.current.innerHTML = '';
        const tweetId = getTweetId(selectedVideo);
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {aiVideoData.map((video, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedVideo(video.url)}
              className="relative aspect-video bg-gray-900 border border-gray-800/50 rounded-2xl hover:border-red-600 transition-all group overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-transparent opacity-20 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white transform group-hover:scale-90 group-hover:opacity-0 transition-all duration-300">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>

              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <p className="text-white text-[11px] md:text-xs font-bold leading-relaxed line-clamp-3 text-center">
                  {video.title}
                </p>
                <div className="mt-4 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                  {t.watchVideo} <Play size={10} fill="currentColor" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-60">{t.aiVideoLabel} #{i+1}</p>
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
            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-[110]"
          >
            <X size={40} strokeWidth={1} />
          </button>
          
          <div className="w-full max-w-5xl bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-800 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 md:px-10 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Exclusive Video Preview</span>
              </div>
              <a href={selectedVideo} target="_blank" rel="noopener" className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                WATCH ON X (TWITTER) <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto bg-black p-4 flex flex-col items-center">
              <div ref={tweetContainerRef} className="w-full flex justify-center min-h-[300px]">
                <div className="flex flex-col items-center justify-center text-gray-600 gap-4">
                  <Play className="animate-spin" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading Video Content...</p>
                </div>
              </div>
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

const PromotionLinks = ({ language }: { language: Language }) => {
  const t = translations.promotions[language];
  
  return (
  <section className="py-24 bg-gray-950">
    <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
      <a href="https://pf01.dq-l.com/" target="_blank" rel="noopener" className="group p-10 bg-gray-900 hover:bg-gray-800 rounded-[2.5rem] text-white font-bold flex flex-col justify-between transition-all shadow-2xl border border-gray-800 h-48">
        <span className="text-[10px] uppercase font-black tracking-widest opacity-70 text-red-500">{t.promo1Label}</span>
        <div className="flex justify-between items-end">
          <span className="text-2xl md:text-3xl tracking-tighter group-hover:text-red-500 transition-colors">{t.promo1Title}</span>
          <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform text-white" />
        </div>
      </a>
      <a href="https://dq-l.com/" target="_blank" rel="noopener" className="group p-10 bg-gray-900 hover:bg-gray-800 rounded-[2.5rem] text-white font-bold flex flex-col justify-between transition-all border border-gray-800 h-48 shadow-2xl">
        <span className="text-[10px] uppercase font-black tracking-widest opacity-50 text-orange-500">{t.promo2Label}</span>
        <div className="flex justify-between items-end">
          <span className="text-2xl md:text-3xl tracking-tighter group-hover:text-orange-500 transition-colors">{t.promo2Title}</span>
          <ExternalLink size={32} className="opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
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
        <PromotionLinks language={language} />
      </main>
      
      <footer className="py-12 bg-gray-950 border-t border-gray-900 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-white">Design Quest</span>
            <span className="text-orange-500">AI</span>
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
