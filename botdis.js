const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteerExtra.use(StealthPlugin());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = 'MTQ1NDIyMjYyOTAyNzMxOTkwOA.GZLtyC.kHG-vtE2K9AGt4GZim24Ffz26Dn76cKjeloUII';
const LOG_FILE = 'logbypass.txt';
let targetChannelId = null;

async function waitForRecaptcha(page) {
  try {
    console.log('Đang chờ tiện ích giải reCAPTCHA v2...');
    let attempts = 0;
    const maxAttempts = 90;
    while (attempts < maxAttempts) {
      const recaptchaSolved = await page.evaluate(() => {
        const textarea = document.getElementById('g-recaptcha-response');
        return textarea && textarea.value && textarea.value.length > 0;
      });
      if (recaptchaSolved) {
        console.log('reCAPTCHA đã được xác nhận giải xong bởi tiện ích.');
        return true;
      }
      console.log(`Lần kiểm tra ${attempts + 1}: Chưa thấy g-recaptcha-response, chờ thêm...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }
    throw new Error('Timeout: Tiện ích không giải được reCAPTCHA v2 trong 90 giây.');
  } catch (error) {
    throw new Error(`Lỗi khi chờ reCAPTCHA: ${error.message}`);
  }
}

function loadLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return new Map(JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')));
    }
    return new Map();
  } catch (error) {
    console.error(`Lỗi khi tải log: ${error.message}`);
    return new Map();
  }
}

function saveLog(logMap) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify([...logMap.entries()]), 'utf8');
  } catch (error) {
    console.error(`Lỗi khi lưu log: ${error.message}`);
  }
}

client.once('clientReady', async () => {
  console.log(`Đã đăng nhập với tên ${client.user.tag} vào ${new Date().toLocaleString('vi-VN')}`);
});

client.on('error', (error) => {
  console.error(`Lỗi Discord: ${error.message}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!setupchannel') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('Chỉ có admin mới được dùng lệnh này!');
      await message.reply({ embeds: [embed] });
      return;
    }
    targetChannelId = message.channel.id;
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setDescription('Kênh này đã được thiết lập để lắng nghe tin nhắn.');
    await message.reply({ embeds: [embed] });
    return;
  }

  if (message.channel.id !== targetChannelId) return;

  if (message.content.startsWith('!link4m ')) {
    const link = message.content.split(' ')[1];
    if (!link || !link.startsWith('https://link4m.com/')) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('Kiểm tra lại web của mày đi thằng ngu đéo phải link4m hoặc đéo có https://');
      await message.reply({ embeds: [embed] });
      return;
    }

    const logMap = loadLog();
    if (logMap.has(link)) {
      const cachedResult = logMap.get(link);
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setDescription(`Web sau khi bypass đây cu (từ cache): ${cachedResult}\n\nbot làm bởi bố vịt ko ví với "hỗ trợ" từ xAI và nó free 100% nhé ko như của con thỏ cute vip pro nào đấy vào server của bố nào các con https://discord.gg/fK3BZWtxCA`);
      await message.reply({ embeds: [successEmbed], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setDescription('Chờ tí ngồi đợi bot giải nốt cái captcha rách đã ngồi xơi nước tầm 30 giây đi');
    const startTime = Date.now();
    await message.reply({ embeds: [embed] });

    let browser = null;
    let page = null;
    try {
      browser = await puppeteerExtra.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--remote-debugging-port=9222',
          '--enable-extensions',
          `--load-extension=C:/Users/Administrator/Downloads/source2share/bypassskibii/bypassskibii`,
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 60000,
      });
      page = await browser.newPage();

      const hasExtension = await page.evaluate(() => {
        return window.chrome && window.chrome.runtime && window.chrome.runtime.id;
      });
      console.log(`Tiện ích có sẵn: ${hasExtension}`);

      console.log('Đang chờ cửa sổ bypass load xong...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log(`Đang điều hướng đến ${link}...`);
      try {
        await page.goto(link, {
          waitUntil: 'networkidle2',
          timeout: 90000,
        });
      } catch (navError) {
        throw new Error(`Lỗi điều hướng đến link: ${navError.message}`);
      }

      console.log('Đang chờ captcha được giải...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await waitForRecaptcha(page);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Đang tìm nút <a class="btn btn-success get-link">Click here to continue</a>...');
      const newPagePromise = new Promise((resolve) => {
        browser.on('targetcreated', async (target) => {
          const newPage = await target.page();
          if (newPage) resolve(newPage);
        });
      });

      await page.evaluate(() => {
        const btn = document.querySelector('a.btn.btn-success.get-link');
        if (btn && btn.href) {
          console.log(`Tìm thấy nút với href: ${btn.href}`);
          window.open(btn.href, '_blank');
        } else {
          console.log('Không tìm thấy nút hoặc href không hợp lệ.');
        }
      });

      const newPage = await Promise.race([
        newPagePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Hết thời gian chờ tab mới')), 30000)),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      const newUrl = newPage.url();
      console.log(`URL từ trang mới sau 3 giây: ${newUrl}`);

      const endTime = Date.now();
      const bypassTime = Math.floor((endTime - startTime) / 1000);

      if (newUrl && newUrl !== '#' && newUrl !== '') {
        const successEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setDescription(`Web sau khi bypass đây cu: ${newUrl}\nBypass thành công sau ${bypassTime} giây!\n\nbot làm bởi bố vịt ko ví với "hỗ trợ" từ xAI và nó free 100% nhé ko như của con thỏ cute vip pro nào đấy vào server của bố nào các con https://discord.gg/fK3BZWtxCA`);
        await message.reply({ embeds: [successEmbed], ephemeral: true });
        logMap.set(link, newUrl);
        saveLog(logMap);
      } else {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription('Không lấy được URL từ trang mới. Vui lòng kiểm tra lại link.');
        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý liên kết: ${error.message}`);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription(`Địt mẹ link4m nó đã dùng phương pháp skibidi toa lét nào đấy dám chặn tao chúng mày bypass lại đi ko làm bây thất vọng đâu😡`);
      await message.reply({ embeds: [embed] });
    } finally {
      if (browser) await browser.close();
    }
  }
});

async function loginBot() {
  try {
    console.log('Đang đăng nhập vào Discord...');
    await client.login(TOKEN);
  } catch (error) {
    console.error(`Lỗi đăng nhập Discord: ${error.message}`);
    process.exit(1);
  }
}

loginBot();

cd C:\Users\Administrator\Downloads\source2share
git init
git add .
git commit -m "Initial commit"