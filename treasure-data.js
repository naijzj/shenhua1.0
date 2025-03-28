/**
 * 宝物阁商品数据 - 神话·天命
 * 包含丹药、法宝和典籍等物品信息
 */

// 物品分类
export const ItemCategories = {
    PILL: "丹药",
    ARTIFACT: "法宝",
    BOOK: "典籍"
};

// 物品稀有度
export const RarityLevels = {
    COMMON: { name: "凡品", multiplier: 1.0, color: "#A0A0A0" },
    UNCOMMON: { name: "下品", multiplier: 1.5, color: "#42B983" },
    RARE: { name: "中品", multiplier: 2.5, color: "#4A90E2" },
    EPIC: { name: "上品", multiplier: 4.0, color: "#9b59b6" },
    LEGENDARY: { name: "极品", multiplier: 8.0, color: "#FF9500" },
    MYTHIC: { name: "仙品", multiplier: 15.0, color: "#FF5E3A" }
};

// 灵石汇率 (影响所有物品价格)
export const SpiritStoneRate = {
    value: 1.0,
    min: 0.8,
    max: 1.2,
    // 每次交易后有几率变动汇率
    fluctuate() {
        // 70%概率波动，最多波动5%
        if (Math.random() < 0.7) {
            const fluctuation = (Math.random() - 0.5) * 0.1;
            this.value = Math.max(this.min, Math.min(this.max, this.value + fluctuation));
        }
        return this.value;
    }
};

// 物品基础数据
const TreasureItems = [
    // 丹药
    {
        id: "pill_1",
        name: "聚灵丹",
        description: "入门级丹药，服用后可小幅提升修为",
        category: ItemCategories.PILL,
        rarity: RarityLevels.COMMON,
        basePrice: 50,
        stock: 10,
        icon: "assets/icons/pill_blue.png",
        effects: {
            cultivation: 100,
            instant: true
        }
    },
    {
        id: "pill_2",
        name: "归元丹",
        description: "修复受损灵脉，恢复灵力消耗",
        category: ItemCategories.PILL,
        rarity: RarityLevels.UNCOMMON,
        basePrice: 120,
        stock: 5,
        icon: "assets/icons/pill_green.png",
        effects: {
            recovery: 0.5, // 恢复50%灵力
            instant: true
        }
    },
    {
        id: "pill_3",
        name: "紫雷凝心丹",
        description: "雷属性修士专用，可提升修炼效率",
        category: ItemCategories.PILL,
        rarity: RarityLevels.RARE,
        basePrice: 350,
        stock: 3,
        icon: "assets/icons/pill_purple.png",
        effects: {
            efficiencyBoost: 0.2, // 提升20%修炼效率
            duration: 3600, // 持续1小时
            attribute: "雷"
        }
    },
    {
        id: "pill_4",
        name: "金丹凝婴丹",
        description: "突破元婴期必备丹药，大幅提高突破成功率",
        category: ItemCategories.PILL,
        rarity: RarityLevels.EPIC,
        basePrice: 1200,
        stock: 1,
        icon: "assets/icons/pill_gold.png",
        effects: {
            breakthroughBoost: 0.3, // 提升30%突破几率
            targetRealm: "元婴初期",
            instant: true
        }
    },
    {
        id: "pill_5",
        name: "九转还魂丹",
        description: "传说中的丹药，可在致命伤势下救回一命",
        category: ItemCategories.PILL,
        rarity: RarityLevels.LEGENDARY,
        basePrice: 5000,
        stock: 1,
        icon: "assets/icons/pill_red.png",
        effects: {
            resurrection: true,
            healthRestore: 1.0, // 完全恢复
            instant: true
        }
    },
    
    // 法宝
    {
        id: "artifact_1",
        name: "引灵符",
        description: "可增强周围灵气浓度，提升修炼速度",
        category: ItemCategories.ARTIFACT,
        rarity: RarityLevels.COMMON,
        basePrice: 80,
        stock: 8,
        icon: "assets/icons/talisman.png",
        effects: {
            cultivationBoost: 0.05, // 提升5%修炼速度
            charges: 10 // 可使用10次
        }
    },
    {
        id: "artifact_2",
        name: "聚灵阵盘",
        description: "摆放后可形成小型聚灵阵，提高修炼效率",
        category: ItemCategories.ARTIFACT,
        rarity: RarityLevels.UNCOMMON,
        basePrice: 300,
        stock: 3,
        icon: "assets/icons/formation_plate.png",
        effects: {
            cultivationBoost: 0.15, // 提升15%修炼速度
            duration: 86400 // 持续24小时
        }
    },
    {
        id: "artifact_3",
        name: "紫雷玉",
        description: "蕴含雷属性灵力的奇特玉石，可辅助雷修修炼",
        category: ItemCategories.ARTIFACT,
        rarity: RarityLevels.RARE,
        basePrice: 800,
        stock: 2,
        icon: "assets/icons/thunder_jade.png",
        effects: {
            cultivationBoost: 0.25, // 提升25%修炼速度
            attribute: "雷",
            duration: -1 // 永久使用
        }
    },
    {
        id: "artifact_4",
        name: "八卦镇灵塔",
        description: "可镇压体内杂质，提高突破成功率",
        category: ItemCategories.ARTIFACT,
        rarity: RarityLevels.EPIC,
        basePrice: 2000,
        stock: 1,
        icon: "assets/icons/pagoda.png",
        effects: {
            breakthroughBoost: 0.2, // 提升20%突破几率
            cultivationBoost: 0.1, // 提升10%修炼速度
            duration: -1 // 永久使用
        }
    },
    {
        id: "artifact_5",
        name: "天罡玄气罩",
        description: "上古法宝，可形成防护罩抵御攻击",
        category: ItemCategories.ARTIFACT,
        rarity: RarityLevels.LEGENDARY,
        basePrice: 8000,
        stock: 1,
        icon: "assets/icons/shield.png",
        effects: {
            defense: 500, // 增加500点防御
            duration: -1, // 永久使用
            cooldown: 3600 // 使用后冷却1小时
        }
    },
    
    // 典籍
    {
        id: "book_1",
        name: "《修仙入门》",
        description: "基础修仙知识汇总，适合初学者阅读",
        category: ItemCategories.BOOK,
        rarity: RarityLevels.COMMON,
        basePrice: 30,
        stock: 15,
        icon: "assets/icons/book_basic.png",
        effects: {
            knowledgeGain: 50, // 增加知识点
            instant: true
        }
    },
    {
        id: "book_2",
        name: "《灵药大全》",
        description: "详述各类灵草灵药的特性和用途",
        category: ItemCategories.BOOK,
        rarity: RarityLevels.UNCOMMON,
        basePrice: 150,
        stock: 5,
        icon: "assets/icons/book_herb.png",
        effects: {
            herbSkill: 0.1, // 提升10%炼丹成功率
            knowledgeGain: 100,
            instant: true
        }
    },
    {
        id: "book_3",
        name: "《紫雷心法》",
        description: "专为雷灵根修士撰写的修炼心法",
        category: ItemCategories.BOOK,
        rarity: RarityLevels.RARE,
        basePrice: 500,
        stock: 2,
        icon: "assets/icons/book_thunder.png",
        effects: {
            unlockSkill: "thunderEssence", // 解锁紫雷真意功法
            attribute: "雷",
            instant: true
        }
    },
    {
        id: "book_4",
        name: "《九天玄功》",
        description: "记载上古修仙秘法，修炼难度极高",
        category: ItemCategories.BOOK,
        rarity: RarityLevels.EPIC,
        basePrice: 3000,
        stock: 1,
        icon: "assets/icons/book_advanced.png",
        effects: {
            unlockSkill: "celestialCode", // 解锁天命真解功法
            cultivationBoost: 0.3, // 提升30%修炼速度
            instant: true
        }
    }
];

// 导出物品数据
export default TreasureItems; 