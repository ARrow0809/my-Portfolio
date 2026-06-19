import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexTsxPath = path.join(__dirname, 'index.tsx');
const thumbnailsDir = path.join(__dirname, 'public', 'thumbnails');

// ディレクトリ作成
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// 画像ダウンロード関数
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// OGPフォールバック取得関数
function fetchOgpImageUrl(tweetUrl) {
  return new Promise((resolve, reject) => {
    https.get(tweetUrl, {
      headers: {
        'User-Agent': 'Twitterbot'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const match = data.match(/property="og:image"\s+content="([^"]+)"/) || data.match(/content="([^"]+)"\s+property="og:image"/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          reject(new Error('og:image not found in HTML'));
        }
      });
    }).on('error', reject);
  });
}

// Jina AIプロキシ経由での画像URL抽出関数
function fetchOgpImageUrlWithJina(tweetUrl) {
  return new Promise((resolve, reject) => {
    const jinaUrl = `https://r.jina.ai/${tweetUrl}`;
    https.get(jinaUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Jina failed with status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // pbs.twimg.comの画像URLを検索
        const match = data.match(/https:\/\/pbs\.twimg\.com\/[^\s\)\"\']+/);
        if (match && match[0]) {
          let imgUrl = match[0].replace(/[,\)\"\']+$/, '');
          resolve(imgUrl);
        } else {
          reject(new Error('No twimg URL found in Jina response'));
        }
      });
    }).on('error', reject);
  });
}


// スタイリッシュなSVGプレースホルダー画像を生成する関数
function generateSvgThumbnail(title, tweetId) {
  const destPath = path.join(thumbnailsDir, `${tweetId}.svg`);
  
  // 文字数が長い場合に改行する簡易ロジック
  let line1 = title;
  let line2 = "";
  if (title.length > 15) {
    // 適切な区切り文字（スペース、コロンなど）で分割を試みる
    const splitIndex = title.indexOf(':') !== -1 ? title.indexOf(':') + 1 : Math.floor(title.length / 2);
    line1 = title.substring(0, splitIndex).trim();
    line2 = title.substring(splitIndex).trim();
  }

  const svgContent = `<svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${tweetId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#1e1b4b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#311005;stop-opacity:1" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="640" height="360" fill="url(#grad-${tweetId})" />
  
  <!-- 装飾用の幾何学パターン -->
  <circle cx="580" cy="60" r="120" fill="#ea580c" opacity="0.05" />
  <circle cx="60" cy="300" r="80" fill="#dc2626" opacity="0.03" />
  
  <!-- 再生アイコン風の背景装飾 -->
  <polygon points="300,140 300,220 360,180" fill="#ffffff" opacity="0.02" />
  
  <!-- タイトルテキスト -->
  <text x="50%" y="${line2 ? '40%' : '48%'}" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="bold" fill="#f8fafc" letter-spacing="1">
    ${escapeXml(line1)}
  </text>
  ${line2 ? `
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="#f8fafc" letter-spacing="1">
    ${escapeXml(line2)}
  </text>` : ''}
  
  <!-- サブテキスト・ブランド -->
  <text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#f97316" letter-spacing="6" opacity="0.8">
    DESIGN QUEST AI
  </text>
</svg>`;

  fs.writeFileSync(destPath, svgContent, 'utf8');
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function main() {
  let content = fs.readFileSync(indexTsxPath, 'utf8');

  // タイトルとURLを抽出する正規表現
  const objectRegex = /\{\s*title:\s*"([^"]+)",\s*url:\s*"([^"]+)"/g;
  let match;
  const videoItems = [];

  while ((match = objectRegex.exec(content)) !== null) {
    const title = match[1];
    const url = match[2];
    if (url.includes('x.com') || url.includes('twitter.com')) {
      videoItems.push({ title, url });
    }
  }

  console.log(`Found ${videoItems.length} X.com/Twitter video items in index.tsx.`);

  for (const item of videoItems) {
    const tweetUrl = item.url;
    const title = item.title;
    
    const idMatch = tweetUrl.match(/status\/(\d+)/);
    if (!idMatch) continue;
    const tweetId = idMatch[1];
    
    const destPngPath = path.join(thumbnailsDir, `${tweetId}.png`);
    const destSvgPath = path.join(thumbnailsDir, `${tweetId}.svg`);

    // 既にPNG画像が存在する場合は何もしない
    if (fs.existsSync(destPngPath) && fs.statSync(destPngPath).size > 0) {
      console.log(`PNG Thumbnail for ${tweetId} (${title}) already exists. Skipping.`);
      continue;
    }
    
    // すでにSVGが存在していても、本物画像を試すためここではスキップしない
    
    console.log(`Processing: ${title} (${tweetId})`);
    try {
      // 1. 直接プレビュー画像を試みる
      const previewUrl = `https://jf.x.com/images/media-preview/${tweetId}`;
      await downloadImage(previewUrl, destPngPath);
      console.log(`-> Successfully downloaded PNG preview for ${tweetId}`);
      if (fs.existsSync(destSvgPath)) {
        fs.unlinkSync(destSvgPath);
      }
    } catch (err) {
      console.log(`-> PNG download failed: ${err.message}. Trying OGP fallback...`);
      try {
        // 2. OGP経由で取得を試みる
        const ogpUrl = await fetchOgpImageUrl(tweetUrl);
        await downloadImage(ogpUrl, destPngPath);
        console.log(`-> Successfully downloaded OGP PNG for ${tweetId}`);
        if (fs.existsSync(destSvgPath)) {
          fs.unlinkSync(destSvgPath);
        }
      } catch (fallbackErr) {
        console.log(`-> OGP fallback failed: ${fallbackErr.message}. Trying Jina AI OGP fallback...`);
        try {
          // 3. Jina AI OGP経由で取得を試みる
          const jinaOgpUrl = await fetchOgpImageUrlWithJina(tweetUrl);
          await downloadImage(jinaOgpUrl, destPngPath);
          console.log(`-> Successfully downloaded Jina OGP PNG for ${tweetId}`);
          if (fs.existsSync(destSvgPath)) {
            fs.unlinkSync(destSvgPath);
          }
        } catch (jinaErr) {
          console.log(`-> All PNG download attempts failed: ${jinaErr.message}. Checking SVG placeholder...`);
          // 4. PNGが無理ならSVGプレースホルダーを生成する
          if (!fs.existsSync(destSvgPath) || fs.statSync(destSvgPath).size === 0) {
            generateSvgThumbnail(title, tweetId);
            console.log(`-> Successfully generated SVG placeholder for ${tweetId}`);
          } else {
            console.log(`-> SVG placeholder already exists. Keeping it.`);
          }
        }
      }
    }
  }

  // index.tsxの書き換え
  console.log('Updating index.tsx with thumbnail paths...');
  let updatedContent = content;

  for (const item of videoItems) {
    const tweetUrl = item.url;
    const idMatch = tweetUrl.match(/status\/(\d+)/);
    if (!idMatch) continue;
    const tweetId = idMatch[1];

    // PNGが存在すればPNG、無ければSVGを割り当てる
    const destPngPath = path.join(thumbnailsDir, `${tweetId}.png`);
    const destSvgPath = path.join(thumbnailsDir, `${tweetId}.svg`);
    
    let thumbnailPath = '';
    if (fs.existsSync(destPngPath) && fs.statSync(destPngPath).size > 0) {
      thumbnailPath = `thumbnails/${tweetId}.png`;
    } else if (fs.existsSync(destSvgPath) && fs.statSync(destSvgPath).size > 0) {
      thumbnailPath = `thumbnails/${tweetId}.svg`;
    } else {
      continue; // 画像が無い場合は追加しない
    }

    const escapedUrl = tweetUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // すでに thumbnail が定義されているかチェックするための正規表現
    // url: "URL",\s*thumbnail: ... もしくは thumbnail: ...,\s*url: "URL"
    const hasThumbnailRegex = new RegExp(`url:\\s*"${escapedUrl}"[^\\}]+thumbnail:`, 's');
    const isAlreadyAdded = hasThumbnailRegex.test(updatedContent);

    if (isAlreadyAdded) {
      // 既存の thumbnail パスが異なる場合は更新する（PNGからSVGへの切り替えなど）
      const updateThumbnailRegex = new RegExp(`(url:\\s*"${escapedUrl}"[^\\}]+thumbnail:\\s*")([^"]+)`, 's');
      updatedContent = updatedContent.replace(updateThumbnailRegex, `$1${thumbnailPath}`);
    } else {
      const targetRegex = new RegExp(`(url:\\s*"${escapedUrl}")`, 'g');
      updatedContent = updatedContent.replace(targetRegex, `$1, thumbnail: "${thumbnailPath}"`);
    }
  }

  fs.writeFileSync(indexTsxPath, updatedContent, 'utf8');
  console.log('index.tsx updated successfully!');
}

main().catch(console.error);
