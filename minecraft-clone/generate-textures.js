const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 纹理大小
const SIZE = 16;

// 纹理列表
const textures = [
    { name: 'stone', color: '#7D7D7D', pattern: 'noise', noise: 0.1 },
    { name: 'dirt', color: '#866043', pattern: 'noise', noise: 0.2 },
    { name: 'grass_top', color: '#5D9E47', pattern: 'noise', noise: 0.1 },
    { name: 'grass_side', color: '#866043', pattern: 'side', topColor: '#5D9E47', height: 4, noise: 0.1 },
    { name: 'log_side', color: '#6B511F', pattern: 'wood', noise: 0.05 },
    { name: 'log_top', color: '#A0814B', pattern: 'rings', noise: 0.05 },
    { name: 'leaves', color: '#3D7A23', pattern: 'noise', noise: 0.3, transparent: true },
    { name: 'planks', color: '#A0814B', pattern: 'planks', noise: 0.05 },
    { name: 'sand', color: '#E6D9A8', pattern: 'noise', noise: 0.15 },
    { name: 'water', color: '#2D5AE0', pattern: 'water', noise: 0.05, transparent: true },
    { name: 'glass', color: '#FFFFFF', pattern: 'glass', transparent: true },
    { name: 'cobblestone', color: '#7D7D7D', pattern: 'cobble', noise: 0.2 },
    { name: 'bedrock', color: '#333333', pattern: 'noise', noise: 0.3 },
    { name: 'coal_ore', color: '#7D7D7D', pattern: 'ore', oreColor: '#222222', noise: 0.1 },
    { name: 'iron_ore', color: '#7D7D7D', pattern: 'ore', oreColor: '#D8AF93', noise: 0.1 },
    { name: 'gold_ore', color: '#7D7D7D', pattern: 'ore', oreColor: '#FCDC5F', noise: 0.1 },
    { name: 'diamond_ore', color: '#7D7D7D', pattern: 'ore', oreColor: '#5DECF5', noise: 0.1 },
    { name: 'crafting_table_top', color: '#A0814B', pattern: 'crafting_top', noise: 0.05 },
    { name: 'crafting_table_side', color: '#A0814B', pattern: 'crafting_side', noise: 0.05 },
    { name: 'crafting_table_front', color: '#A0814B', pattern: 'crafting_front', noise: 0.05 },
    { name: 'furnace_top', color: '#7D7D7D', pattern: 'furnace_top', noise: 0.1 },
    { name: 'furnace_side', color: '#7D7D7D', pattern: 'furnace_side', noise: 0.1 },
    { name: 'furnace_front', color: '#7D7D7D', pattern: 'furnace_front', noise: 0.1 }
];

// 确保目录存在
const texturesDir = path.join(__dirname, 'assets', 'textures');
if (!fs.existsSync(texturesDir)) {
    fs.mkdirSync(texturesDir, { recursive: true });
}

// 生成纹理
for (const texture of textures) {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    
    // 填充背景色
    ctx.fillStyle = texture.color;
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    // 根据纹理类型生成图案
    switch (texture.pattern) {
        case 'noise':
            addNoise(ctx, texture.noise);
            break;
        case 'side':
            addGrassSide(ctx, texture.topColor, texture.height, texture.noise);
            break;
        case 'wood':
            addWoodPattern(ctx, texture.noise);
            break;
        case 'rings':
            addWoodRings(ctx, texture.noise);
            break;
        case 'planks':
            addPlanksPattern(ctx, texture.noise);
            break;
        case 'water':
            addWaterPattern(ctx, texture.noise);
            break;
        case 'glass':
            addGlassPattern(ctx);
            break;
        case 'cobble':
            addCobblePattern(ctx, texture.noise);
            break;
        case 'ore':
            addOrePattern(ctx, texture.oreColor, texture.noise);
            break;
        case 'crafting_top':
            addCraftingTableTop(ctx, texture.noise);
            break;
        case 'crafting_side':
            addCraftingTableSide(ctx, texture.noise);
            break;
        case 'crafting_front':
            addCraftingTableFront(ctx, texture.noise);
            break;
        case 'furnace_top':
            addFurnaceTop(ctx, texture.noise);
            break;
        case 'furnace_side':
            addFurnaceSide(ctx, texture.noise);
            break;
        case 'furnace_front':
            addFurnaceFront(ctx, texture.noise);
            break;
    }
    
    // 保存纹理
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(texturesDir, `${texture.name}.png`), buffer);
    
    console.log(`生成纹理: ${texture.name}.png`);
}

console.log('所有纹理生成完成！');

// 添加噪声
function addNoise(ctx, intensity) {
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// 添加草方块侧面纹理
function addGrassSide(ctx, topColor, height, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加顶部草
    ctx.fillStyle = topColor;
    ctx.fillRect(0, 0, SIZE, height);
    
    // 添加草的噪声
    const imageData = ctx.getImageData(0, 0, SIZE, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 0.2 * 255;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 添加草的过渡
    for (let y = height; y < height + 2; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (Math.random() > 0.5) {
                ctx.fillStyle = topColor;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// 添加木头纹理
function addWoodPattern(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加木纹
    for (let i = 0; i < SIZE; i += 4) {
        ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        ctx.fillRect(i, 0, 2, SIZE);
    }
}

// 添加木头顶部纹理
function addWoodRings(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加年轮
    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    
    for (let r = SIZE / 2; r > 0; r -= 2) {
        ctx.fillStyle = r % 4 === 0 ? `rgba(0, 0, 0, 0.1)` : `rgba(0, 0, 0, 0.05)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 添加木板纹理
function addPlanksPattern(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加木板纹理
    ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
    ctx.fillRect(0, SIZE / 2 - 1, SIZE, 2);
    ctx.fillRect(SIZE / 2 - 1, 0, 2, SIZE);
    
    // 添加木板纹理细节
    ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
    ctx.fillRect(0, SIZE / 4 - 1, SIZE, 1);
    ctx.fillRect(0, SIZE * 3 / 4 - 1, SIZE, 1);
    ctx.fillRect(SIZE / 4 - 1, 0, 1, SIZE);
    ctx.fillRect(SIZE * 3 / 4 - 1, 0, 1, SIZE);
}

// 添加水纹理
function addWaterPattern(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加水波纹
    for (let y = 0; y < SIZE; y += 4) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.fillRect(0, y, SIZE, 1);
    }
    
    // 设置透明度
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = 180; // 设置alpha通道
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// 添加玻璃纹理
function addGlassPattern(ctx) {
    // 清除背景
    ctx.clearRect(0, 0, SIZE, SIZE);
    
    // 添加边框
    ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
    ctx.fillRect(0, 0, SIZE, 1);
    ctx.fillRect(0, 0, 1, SIZE);
    ctx.fillRect(0, SIZE - 1, SIZE, 1);
    ctx.fillRect(SIZE - 1, 0, 1, SIZE);
    
    // 添加高光
    ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
    for (let i = 2; i < SIZE - 2; i += 4) {
        ctx.fillRect(i, 2, 2, 2);
        ctx.fillRect(SIZE - i - 2, SIZE - 4, 2, 2);
    }
}

// 添加鹅卵石纹理
function addCobblePattern(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加石块纹理
    for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * SIZE);
        const y = Math.floor(Math.random() * SIZE);
        const size = Math.floor(Math.random() * 6) + 4;
        
        ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 添加裂缝
    ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 3; i++) {
        const x1 = Math.floor(Math.random() * SIZE);
        const y1 = Math.floor(Math.random() * SIZE);
        const x2 = Math.floor(Math.random() * SIZE);
        const y2 = Math.floor(Math.random() * SIZE);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// 添加矿石纹理
function addOrePattern(ctx, oreColor, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加矿石斑点
    ctx.fillStyle = oreColor;
    
    for (let i = 0; i < 4; i++) {
        const x = Math.floor(Math.random() * SIZE);
        const y = Math.floor(Math.random() * SIZE);
        const size = Math.floor(Math.random() * 3) + 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 添加工作台顶部纹理
function addCraftingTableTop(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加工作台网格
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.fillRect(0, SIZE / 2 - 1, SIZE, 2);
    ctx.fillRect(SIZE / 2 - 1, 0, 2, SIZE);
    
    // 添加工具痕迹
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(SIZE / 4, SIZE / 4, SIZE / 2, SIZE / 2);
}

// 添加工作台侧面纹理
function addCraftingTableSide(ctx, noise) {
    // 添加木板纹理
    addPlanksPattern(ctx, noise);
    
    // 添加工具痕迹
    ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
    ctx.fillRect(SIZE / 4, SIZE / 4, SIZE / 2, SIZE / 2);
}

// 添加工作台前面纹理
function addCraftingTableFront(ctx, noise) {
    // 添加木板纹理
    addPlanksPattern(ctx, noise);
    
    // 添加工具痕迹
    ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
    ctx.fillRect(SIZE / 4, SIZE / 4, SIZE / 2, SIZE / 2);
    
    // 添加工具图案
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.fillRect(SIZE / 3, SIZE / 3, SIZE / 3, SIZE / 3);
}

// 添加熔炉顶部纹理
function addFurnaceTop(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加边框
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, SIZE, 2);
    ctx.fillRect(0, 0, 2, SIZE);
    ctx.fillRect(0, SIZE - 2, SIZE, 2);
    ctx.fillRect(SIZE - 2, 0, 2, SIZE);
}

// 添加熔炉侧面纹理
function addFurnaceSide(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加边框
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, SIZE, 2);
    ctx.fillRect(0, 0, 2, SIZE);
    ctx.fillRect(0, SIZE - 2, SIZE, 2);
    ctx.fillRect(SIZE - 2, 0, 2, SIZE);
}

// 添加熔炉前面纹理
function addFurnaceFront(ctx, noise) {
    // 添加噪声
    addNoise(ctx, noise);
    
    // 添加边框
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(0, 0, SIZE, 2);
    ctx.fillRect(0, 0, 2, SIZE);
    ctx.fillRect(0, SIZE - 2, SIZE, 2);
    ctx.fillRect(SIZE - 2, 0, 2, SIZE);
    
    // 添加熔炉开口
    ctx.fillStyle = `#333333`;
    ctx.fillRect(SIZE / 4, SIZE / 2, SIZE / 2, SIZE / 3);
    
    // 添加火焰
    ctx.fillStyle = `#FF5500`;
    ctx.fillRect(SIZE / 3, SIZE / 2 + SIZE / 8, SIZE / 3, SIZE / 6);
}
