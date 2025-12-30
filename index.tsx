import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu, X, ExternalLink, Mail, ArrowRight, Video, ImageIcon, Cpu, Layout, Play, Maximize2, BookOpen } from 'lucide-react';

// --- ヘルパー: パス正規化とリトライ機能 ---

/**
 * 画像読み込み失敗時に、異なる正規化形式や拡張子でリトライするコンポーネント
 */
const SmartImage = ({ src, alt, className, style }: { src: string, alt: string, className?: string, style?: React.CSSProperties }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setIsError(false);
  }, [src]);

  const handleError = () => {
    // リトライ戦略
    if (retryCount === 0) {
      // 1. パス全体を NFD (Mac等のファイルシステム) へ変換
      setCurrentSrc(currentSrc.normalize('NFD'));
      setRetryCount(1);
    } else if (retryCount === 1) {
      // 2. 拡張子の違いを試みる (.jpeg <-> .jpg)
      const next = currentSrc.endsWith('.jpeg') 
        ? currentSrc.replace('.jpeg', '.jpg') 
        : currentSrc.endsWith('.jpg') 
          ? currentSrc.replace('.jpg', '.jpeg')
          : currentSrc;
      setCurrentSrc(next);
      setRetryCount(2);
    } else if (retryCount === 2) {
      // 3. 共通の接尾辞（（大）（中）など）の有無によるパターンを試す
      let next = currentSrc;
      if (next.includes('（大）')) {
        next = next.replace('（大）', '');
      } else if (!next.includes('（大）') && !next.includes('img/') && !next.includes('Xgd')) {
         const parts = next.split('.');
         const ext = parts.pop();
         next = parts.join('.') + '（大）.' + ext;
      }
      setCurrentSrc(next);
      setRetryCount(3);
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

// --- データ定義 ---

const categories = [
  { id: 'all', name: 'すべて' },
  { id: '01_dtp', name: '01_DTPデザイン' },
  { id: '02_gaina', name: '02_GAINA魂' },
  { id: '03_logo', name: '03_ロゴデザイン' },
  { id: '04_kindle', name: '04_kindle表紙' },
  { id: '05_ai', name: '05_AI画像生成' },
  { id: '06_thumb', name: '06_サムネなど' },
  { id: '07_reviews', name: '07_デザイン講座評価' },
];

const mangaPages = [
  '00_AI漫画/00 - 表紙_あろうマンガ表紙（大）（中）.jpeg',
  '00_AI漫画/01 - 2025年11月26日 11.33.49 (7)（大）（中）.jpeg',
  '00_AI漫画/02 - 2025年11月26日 11.33.49 (6)（大）（中）.jpeg',
  '00_AI漫画/03 - 2025年11月26日 11.33.49 (2)（大）（中）.jpeg',
  '00_AI漫画/04_Make_the_character_on_the_left_appear_as_if_it_is_-1764164772017（大）（中）.jpeg',
  '00_AI漫画/05_未_設定 - 2025年11月26日 11.33.49 (5)（大）（中）.jpeg',
  '00_AI漫画/06_未_設定---2025年11月26日-11.33.49-(3)（大）（中）.jpeg'
];

const portfolioItems = [
  // 01_DTPデザイン
  { id: 101, category: '01_dtp', title: '東公園パンフレット', src: '01_DTPデザイン/09東公園パンフ（大）（中）.jpeg' },
  { id: 102, category: '01_dtp', title: 'ローター工業パンフレット', src: '01_DTPデザイン/10ローター工業パンフ（大）（中）.jpeg' },
  { id: 103, category: '01_dtp', title: 'SCN会社案内', src: '01_DTPデザイン/11SCN会社案内02（大）（中）.jpeg' },
  { id: 104, category: '01_dtp', title: 'kaoriパンフレット', src: '01_DTPデザイン/12kaoriパンフ（大）（中）.jpeg' },
  { id: 105, category: '01_dtp', title: 'ぎょしょうリーフレット', src: '01_DTPデザイン/13ぎょしょうリーフ（大）（中）.jpeg' },
  { id: 106, category: '01_dtp', title: 'イベントガイド', src: '01_DTPデザイン/14イベントガイド（大）（中）.jpeg' },
  { id: 107, category: '01_dtp', title: '豪円とうふプレゼン', src: '01_DTPデザイン/15豪円とうふプレゼン（大）（中）.jpeg' },
  { id: 108, category: '01_dtp', title: '豪円湯院GOENプリン', src: '01_DTPデザイン/16豪円湯院GOENプリン-型抜-7丁（大）（中）.jpeg' },
  { id: 109, category: '01_dtp', title: '燻製豆腐リーフレット', src: '01_DTPデザイン/17豪円湯院燻製豆腐リーフ（大）（中）.jpeg' },
  { id: 110, category: '01_dtp', title: 'バレエ団パンフレット', src: '01_DTPデザイン/18バレエ団パンフレット02（大）（中）.jpeg' },
  { id: 111, category: '01_dtp', title: '春の出店展示会', src: '01_DTPデザイン/19春の出店展示会（大）（中）.jpeg' },
  
  // 02_GAINA魂
  { id: 201, category: '02_gaina', title: 'GAINA魂ロゴ', src: '02_GAINA魂/01GAINA魂ロゴ（大）（中）.jpeg' },
  { id: 202, category: '02_gaina', title: 'GAINA魂ロゴイメージ', src: '02_GAINA魂/02GAINA魂ロゴイメージ（大）（中）.jpeg' },
  { id: 203, category: '02_gaina', title: 'GAINA魂ポスター', src: '02_GAINA魂/03GAINA魂ポスター03（大）（中）.jpeg' },
  { id: 204, category: '02_gaina', title: 'GAINA魂パンフレット', src: '02_GAINA魂/04GAINA魂パンフレット02（大）（中）.jpeg' },
  { id: 205, category: '02_gaina', title: 'GAINA魂チケット', src: '02_GAINA魂/05GAINA魂チケット一覧（大）（中）.jpeg' },
  { id: 206, category: '02_gaina', title: 'GAINA魂SNS', src: '02_GAINA魂/06GAINA魂SNS（大）（中）.jpeg' },
  { id: 207, category: '02_gaina', title: 'GAINA魂ボードデザイン', src: '02_GAINA魂/07GAINA魂ボードデザイン（大）（中）.jpeg' },
  { id: 208, category: '02_gaina', title: 'GAINA魂米子ジム名刺', src: '02_GAINA魂/08GAINA魂米子ジム名刺（大）（中）.jpeg' },
  
  // 03_ロゴデザイン
  { id: 301, category: '03_logo', title: 'ロゴコンタクトシート', src: '03_ロゴデザイン/ロゴコンタクトシートカラー（大）.jpeg' },
  { id: 302, category: '03_logo', title: 'ガイナ魂ロゴ', src: '03_ロゴデザイン/ガイナ魂（大）.jpeg' },
  { id: 303, category: '03_logo', title: '皮膚科ロゴ', src: '03_ロゴデザイン/皮膚科（大）.jpeg' },
  { id: 304, category: '03_logo', title: '駅なかマルシェロゴ', src: '03_ロゴデザイン/駅なかマルシェ（大）.jpeg' },
  { id: 305, category: '03_logo', title: 'Swanロゴ', src: '03_ロゴデザイン/swan（大）.jpeg' },
  
  // 04_kindle表紙
  { id: 401, category: '04_kindle', title: 'Kindle表紙 01', src: '04_kindle表紙/00001_kindle表紙A（大）（中）.jpeg' },
  { id: 402, category: '04_kindle', title: 'Kindle表紙 02', src: '04_kindle表紙/00002_kindle表紙A（大）（中）.jpeg' },
  { id: 403, category: '04_kindle', title: 'Kindle表紙 03', src: '04_kindle表紙/00003_kindle表紙A（大）（中）.jpeg' },
  { id: 404, category: '04_kindle', title: 'Kindle表紙 04', src: '04_kindle表紙/00004_kindle表紙A（大）（中）.jpeg' },
  { id: 405, category: '04_kindle', title: 'Kindle表紙 05', src: '04_kindle表紙/00005_kindle表紙A（大）（中）.jpeg' },
  { id: 406, category: '04_kindle', title: 'Kindle表紙 06', src: '04_kindle表紙/00006_kindle表紙A（大）（中）.jpeg' },
  { id: 407, category: '04_kindle', title: 'Kindle表紙 07', src: '04_kindle表紙/00007_kindle表紙A（大）（中）.jpeg' },
  { id: 408, category: '04_kindle', title: 'Kindle表紙 08', src: '04_kindle表紙/00008_kindle表紙A（大）（中）.jpeg' },
  { id: 409, category: '04_kindle', title: 'Kindle表紙 09', src: '04_kindle表紙/00009_kindle表紙B（大）（中）.jpeg' },
  { id: 410, category: '04_kindle', title: 'Kindle表紙 10', src: '04_kindle表紙/00010_kindle表紙B（大）（中）.jpeg' },
  { id: 411, category: '04_kindle', title: 'Kindle表紙 11', src: '04_kindle表紙/00011_kindle表紙B（大）（中）.jpeg' },
  { id: 412, category: '04_kindle', title: 'Kindle表紙 12', src: '04_kindle表紙/00012_kindle表紙B（大）（中）.jpeg' },
  { id: 413, category: '04_kindle', title: 'Kindle表紙 13', src: '04_kindle表紙/00013_kindle表紙B（大）（中）.jpeg' },
  { id: 414, category: '04_kindle', title: 'Kindle表紙 14', src: '04_kindle表紙/00014_kindle表紙B（大）（中）.jpeg' },
  { id: 415, category: '04_kindle', title: 'Kindle表紙 15', src: '04_kindle表紙/00015_kindle表紙B（大）（中）.jpeg' },
  
  // 05_AI画像生成
  { id: 501, category: '05_ai', title: 'AI画像生成 01', src: '05_AI画像生成/portfolio_01（大）.jpeg' },
  { id: 502, category: '05_ai', title: 'AI画像生成 02', src: '05_AI画像生成/portfolio_02（大）.jpeg' },
  { id: 503, category: '05_ai', title: 'AI画像生成 03', src: '05_AI画像生成/portfolio-03（大）.jpeg' },
  { id: 504, category: '05_ai', title: 'AI画像生成 04', src: '05_AI画像生成/portfolio-04（大）.jpeg' },
  { id: 505, category: '05_ai', title: 'AI画像生成 05', src: '05_AI画像生成/portfolio-05（大）.jpeg' },
  { id: 506, category: '05_ai', title: 'AI画像生成 06', src: '05_AI画像生成/portfolio-06（大）.jpeg' },
  
  // 06_サムネなど
  { id: 601, category: '06_thumb', title: 'DQXシールモンスター採用おすもっこり', src: '06_サムネなど/20DQXシールモンスター採用おすもっこり（中）.jpeg' },
  { id: 602, category: '06_thumb', title: 'YouTubeサムネイル', src: '06_サムネなど/21youtubeサムネ（中）.jpeg' },
  { id: 603, category: '06_thumb', title: 'バナー広告', src: '06_サムネなど/22バナー広告（中）.jpeg' },
  
  // 07_デザイン講座評価
  { id: 701, category: '07_reviews', title: '実績・感想 03', src: '07_デザイン講座評価/実績・感想03.jpg' },
  { id: 702, category: '07_reviews', title: '評価 01', src: '07_デザイン講座評価/評価01.jpg' },
  { id: 703, category: '07_reviews', title: '評価 02', src: '07_デザイン講座評価/評価02.jpg' },
  { id: 704, category: '07_reviews', title: '評価 03', src: '07_デザイン講座評価/評価03.jpg' },
];

const vibeCodingProjects = [
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
];

const aiVideoData = [
  { title: "1.🐻Animon動画チャレンジ🐻「フレーム抽出」機能「画像切り抜き」「動画切り抜き」登場！いまだけ無料でお試し", url: "https://x.com/ARrow25989974/status/2000872251089105122/video/1" },
  { title: "2.🐻Animon動画チャレンジ🐻 15秒CM「アニメ創作者に朗報！Animonに新モデル＆大型アップデート登場」", url: "https://x.com/ARrow25989974/status/1996874239379673494?s=20" },
  { title: "3.あなたの市場価値、もうゼロになりますよ？―崖っぷちデザイナーが気づいた価値", url: "https://x.com/i/status/1993896080162029641" },
  { title: "4.🐻Animonニュース🐻 Animon API プラットフォーム、正式にリリース", url: "https://x.com/i/status/1991162516550873523" },
  { title: "5.「ドラグーンクエストzero」 #ViduGameShow", url: "https://x.com/i/status/1944091331946791330" },
  { title: "6.「シティーハンター」と「Get Wild」の深い絆 #AIブログ動画", url: "https://x.com/i/status/1790776395083510023" },
  { id: 7, title: "7.【実は6人兄弟？】スヌーピーファミリーのオラフって知ってる?自己否定せずに生きることの大切さ #AIブログ動画", url: "https://x.com/i/status/1790031826997682486" },
  { id: 8, title: "8.【マックスめんどくせえ!】プロレスラー大岩選手のボーイズラブから裏切りを乗り越える心理テクニック #AIブログ動画", url: "https://x.com/i/status/1789658408905568703" },
  { id: 9, title: "9.【5月9日は何の日？】◯○◯◯からの教訓: AI副業での挫折を乗り越え、成功へ導く方法 #AIブログ動画", url: "https://x.com/i/status/1788592514691420539" },
  { id: 10, title: "10.【2025年春“発表”予定】新型 Switchとマリオと共に未来へジャンプ：任天堂のマルチメディア戦略 #AIブログ動画", url: "https://x.com/i/status/1788236161787498663" },
  { id: 11, title: "11.【圧倒的な魅力！】マクロススの歌姫から学ぶ：歌で聞く歌詞が記憶に刻む感情の力 #AIブログ動画", url: "https://x.com/i/status/1787855899681489148" },
  { id: 12, title: "12.中学生でも理解できる！究極のターゲットオーディエンスの明確化方法を公開！ #AIブログ動画", url: "https://x.com/i/status/1784560592101240883" },
  { id: 13, title: "13.【ネタバレ注意】アルミンに学ぶ！頭脳派の副業戦略 - 知識を武器に年収1000万円を目指せ！ #AIブログ動画", url: "https://x.com/i/status/1777349276882116673" },
  { id: 14, title: "14.八百万の神々が立ち寄って休憩される山の頂上で瞑想(ディープフェイク 元本人)", url: "https://x.com/i/status/1769009441066881332" },
  { id: 15, title: "15.ディープフェイクダンス完成！", url: "https://x.com/i/status/1762397789261283597" },
  { id: 16, title: "16.ダンス元画像！", url: "https://x.com/i/status/1762150135101096436" }
];

// --- コンポーネント ---

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'ABOUT', href: '#about' },
    { name: 'AI漫画', href: '#aimanga' },
    { name: '作品紹介', href: '#portfolio' },
    { name: 'バイブコーディング', href: '#vibecoding' },
    { name: 'AI動画', href: '#aivideos' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <a href="#" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <span className="text-white">Design Quest</span>
          <span className="text-orange-500">AI</span>
        </a>

        <div className="hidden md:flex space-x-8">
          {links.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-orange-500 transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        <button className="md:hidden text-gray-300 p-2 hover:bg-gray-800 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-950 border-b border-gray-800 p-6 flex flex-col space-y-4 shadow-2xl">
          {links.map((link) => (
            <a key={link.name} href={link.href} className="text-lg font-medium text-gray-300 hover:text-orange-500" onClick={() => setIsOpen(false)}>
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-950">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950/20 z-0"></div>
    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
    
    <div className="relative z-10 text-center px-4 w-full max-w-[98vw] mx-auto">
      <div className="inline-block mb-8 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
        New Era of Creativity
      </div>
      <h1 className="text-5xl md:text-8xl font-black mb-10 text-white leading-none tracking-tighter uppercase py-4">
        DESIGN QUEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 font-black">AI</span>
      </h1>
      <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
        AIと共創する未来のデザイン。従来の概念を破壊し、<br className="hidden md:block" />
        テクノロジーの力で新たな美学を定義する。
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href="#portfolio" className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm tracking-widest transition-all transform hover:scale-105 shadow-2xl shadow-red-900/40 flex items-center justify-center gap-3">
          作品紹介を見る <ArrowRight size={20} />
        </a>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-24 bg-gray-950">
    <div className="max-w-5xl mx-auto px-6">
      <div className="bg-gray-900/40 p-10 md:p-20 rounded-[3rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[120px] -mr-40 -mt-40"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">ABOUT ME</h2>
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
              AI×デザインの力で、クリエイターの収益化を支援するデザイナーです。<br />
              1,000件以上の案件を通じて培った経験で、あなたのアイデアを収益に変えるお手伝いをします。
            </p>
            <p className="text-sm md:text-lg text-gray-400 leading-relaxed font-light">
              グラフィックデザインをはじめ、Kindle出版、YouTubeサムネイルなど、幅広いジャンルでの制作実績があります。<br className="hidden lg:block" /> 
              AIツールを活用した効率的なワークフローで、高品質な作品を短期間で制作いたします。
            </p>
            
            <div className="pt-8 max-w-3xl mx-auto">
              <p className="text-gray-300 font-bold text-sm md:text-base leading-relaxed border-t border-gray-800 pt-8">
                Design Quest AIは、デザインとAIの共生を目指すクリエイティブ・ラボです。<br />
                最高峰の生成AI技術を使いこなし、想像の限界を拡張します。
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Layout size={14} strokeWidth={3} /> 主な使用ツール
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">Illustrator(Adobe Fonts) / Photoshop / Premiere Pro</p>
            </div>
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Cpu size={14} strokeWidth={3} /> 使用AI
              </h4>
              <p className="text-white text-xs md:text-sm leading-relaxed font-bold">ChatGPT / codex CLI / Antigravity / Google AI Studio / Gemini / NotebookLM</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <span className="text-lg font-black italic">F</span> 使用フォント
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">Adobeフォント</p>
            </div>
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <ImageIcon size={14} strokeWidth={3} /> 画像生成
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">NanobananaPro / StableDiffusion</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-3 justify-center lg:justify-start text-red-500 font-black mb-3 uppercase tracking-[0.2em] text-[10px]">
                 <Video size={14} strokeWidth={3} /> 動画生成
              </h4>
              <p className="text-white text-xs md:text-sm font-bold">Sora2 / Animon AI / Wan2.2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AIManga = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="aimanga" className="py-24 bg-gray-950 border-y border-gray-800/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-12 tracking-tighter uppercase">AI MANGA SERIES</h2>
        
        <div 
          onClick={() => setIsOpen(true)}
          className="group relative inline-block cursor-pointer overflow-hidden rounded-[2.5rem] border border-gray-800 hover:border-orange-500 transition-all shadow-2xl"
        >
          <SmartImage 
            src="00_AI漫画/サムネ - DQA表紙（大）（中）.jpeg" 
            alt="AI漫画サムネイル" 
            className="max-w-full h-auto transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <BookOpen size={40} className="text-white" />
            </div>
            <p className="mt-6 text-white font-black text-xs uppercase tracking-[0.4em]">Read Full Manga</p>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center animate-in fade-in duration-300 overflow-y-auto">
          <div className="sticky top-0 w-full z-[110] flex justify-between items-center p-6 bg-black/80 backdrop-blur-xl border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-black text-xs tracking-widest text-gray-400">Vertical Reading Mode</span>
            </div>
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

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const filteredItems = activeTab === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeTab);

  return (
    <section id="portfolio" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter uppercase">作品紹介</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-orange-500 mx-auto rounded-full mb-12"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeTab === cat.id ? 'bg-white border-white text-black shadow-2xl scale-105' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'}`}
            >
              {cat.name}
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
                  {categories.find(c => c.id === item.category)?.name}
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
                <span className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500">Portfolio Detail</span>
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
                    <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Category</h4>
                    <p className="text-white font-bold text-lg">{categories.find(c => c.id === selectedItem.category)?.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Project Title</h4>
                    <p className="text-white font-medium text-lg leading-snug">{selectedItem.title}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl mt-12"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const VibeCoding = () => (
  <section id="vibecoding" className="py-24 bg-gray-900/30 border-y border-gray-800/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-20 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">08_バイブコーディング</h2>
        <p className="text-gray-500 text-lg font-medium">ノーコード開発 × 生成AIによる次世代プロダクト</p>
        <div className="w-16 h-1.5 bg-orange-500 mt-6 rounded-full hidden md:block"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {vibeCodingProjects.map((proj, i) => (
          <a key={i} href={proj.url} target="_blank" rel="noopener" className="group flex flex-col p-10 bg-gray-900 border border-gray-800 rounded-[2.5rem] text-white transition-all hover:bg-gray-800 h-full">
            <div className="flex flex-wrap gap-2 mb-6">
              {proj.tags.map(tag => <span key={tag} className="text-[10px] px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg uppercase font-black border border-orange-500/20">{tag}</span>)}
            </div>
            <h3 className="text-2xl font-bold mb-6 group-hover:text-orange-500 transition-colors leading-tight">{proj.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 flex-grow">{proj.desc}</p>
            <div className="mt-auto flex items-center gap-3 text-xs font-black uppercase tracking-widest">
              Launch Project <ExternalLink size={14} className="opacity-50" />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

const AIVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const tweetContainerRef = useRef<HTMLDivElement>(null);

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
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">09_AI動画コレクション</h2>
          <p className="text-gray-500 text-lg">生成AIが織りなす映像美のフロンティア</p>
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
                  Watch Video <Play size={10} fill="currentColor" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-60">AI Video #{i+1}</p>
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

const PromotionLinks = () => (
  <section className="py-24 bg-gray-950">
    <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
      <a href="https://pf01.dq-l.com/" target="_blank" rel="noopener" className="group p-10 bg-gray-900 hover:bg-gray-800 rounded-[2.5rem] text-white font-bold flex flex-col justify-between transition-all shadow-2xl border border-gray-800 h-48">
        <span className="text-[10px] uppercase font-black tracking-widest opacity-70 text-red-500">10_Promotion Details</span>
        <div className="flex justify-between items-end">
          <span className="text-2xl md:text-3xl tracking-tighter group-hover:text-red-500 transition-colors">GAINA魂 2022 詳細</span>
          <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform text-white" />
        </div>
      </a>
      <a href="https://dq-l.com/" target="_blank" rel="noopener" className="group p-10 bg-gray-900 hover:bg-gray-800 rounded-[2.5rem] text-white font-bold flex flex-col justify-between transition-all border border-gray-800 h-48 shadow-2xl">
        <span className="text-[10px] uppercase font-black tracking-widest opacity-50 text-orange-500">11_Official Identity</span>
        <div className="flex justify-between items-end">
          <span className="text-2xl md:text-3xl tracking-tighter group-hover:text-orange-500 transition-colors">My ホームページ</span>
          <ExternalLink size={32} className="opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
    </div>
  </section>
);

const App = () => (
  <div className="bg-gray-950 min-h-screen text-gray-100 selection:bg-red-600/50 font-sans">
    <Navigation />
    <main>
      <Hero />
      <About />
      <AIManga />
      <Portfolio />
      <VibeCoding />
      <AIVideos />
      <PromotionLinks />
      <section id="contact" className="py-40 bg-gray-950 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-red-600 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <h2 className="text-5xl md:text-8xl font-black text-white mb-16 tracking-tighter uppercase">GET IN TOUCH</h2>
          <a href="mailto:info@dq-l.com" className="inline-flex items-center gap-6 px-16 py-8 bg-white text-black hover:bg-red-600 hover:text-white rounded-[2rem] font-black text-lg md:text-2xl transition-all shadow-2xl hover:-translate-y-4 hover:rotate-2 mb-20">
            <Mail size={32} /> メールで問い合わせ
          </a>
          
          <div className="mt-12 group">
            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl shadow-white/10 transform transition-transform group-hover:scale-105">
              <SmartImage 
                src="img/Xgd_9gp1F.png" 
                alt="QR Code" 
                className="w-32 h-32 md:w-48 md:h-48"
              />
            </div>
            <p className="mt-6 text-gray-600 text-[10px] font-black tracking-widest uppercase">Connect via QR</p>
          </div>

          <div className="mt-32 w-full border-t border-gray-900 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-700 text-[10px] font-black tracking-[0.5em] uppercase">© {new Date().getFullYear()} DESIGN QUEST AI | CRAFTED BY AI</p>
            <div className="flex gap-8 text-gray-700 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-red-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-red-500 transition-colors">Instagram</a>
              <a href="#" className="hover:text-red-500 transition-colors">Vimeo</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);