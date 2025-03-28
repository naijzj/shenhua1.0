/**
 * 功法数据 - 神话·天命
 * 包含各种修炼功法的属性和效果
 */
const SkillsData = {
    // 基础功法
    "qiRefining": {
        id: "qiRefining",
        name: "聚气诀",
        description: "初级修炼功法，适合筑基期修士使用",
        type: "基础",
        element: "无",
        level: 1,
        baseEfficiency: 1.0,
        cultivationSpeed: 10, // 每秒增加修为点数
        costPerHour: 5, // 每小时消耗灵石
        requirements: {
            minRealm: "练气初期",
            maxRealm: "筑基后期"
        },
        unlockCondition: null // 默认解锁
    },
    
    // 雷属性功法
    "thunderEssence": {
        id: "thunderEssence",
        name: "紫雷真意",
        description: "雷属性高级功法，修炼后可引动天雷淬体",
        type: "高级",
        element: "雷",
        level: 4,
        baseEfficiency: 2.5,
        cultivationSpeed: 45, // 每秒增加修为点数
        costPerHour: 50, // 每小时消耗灵石
        requirements: {
            minRealm: "筑基中期",
            maxRealm: "元婴后期"
        },
        unlockCondition: "完成紫雷山秘境"
    },
    
    // 火属性功法
    "flameDance": {
        id: "flameDance",
        name: "烈焰舞经",
        description: "火属性中级功法，可提高丹方成功率",
        type: "中级",
        element: "火",
        level: 3,
        baseEfficiency: 1.8,
        cultivationSpeed: 25, // 每秒增加修为点数
        costPerHour: 30, // 每小时消耗灵石
        requirements: {
            minRealm: "练气后期",
            maxRealm: "结丹后期"
        },
        unlockCondition: "在火焰谷修炼7天"
    },
    
    // 水属性功法
    "flowingWater": {
        id: "flowingWater",
        name: "流水心经",
        description: "水属性中级功法，可增加灵力回复速度",
        type: "中级",
        element: "水",
        level: 2,
        baseEfficiency: 1.5,
        cultivationSpeed: 20, // 每秒增加修为点数
        costPerHour: 15, // 每小时消耗灵石
        requirements: {
            minRealm: "练气中期",
            maxRealm: "结丹中期"
        },
        unlockCondition: "完成清水湖历练"
    },
    
    // 顶级功法
    "celestialCode": {
        id: "celestialCode",
        name: "天命真解",
        description: "顶级无属性功法，修炼可窥探天道规则",
        type: "绝世",
        element: "无",
        level: 9,
        baseEfficiency: 5.0,
        cultivationSpeed: 100, // 每秒增加修为点数
        costPerHour: 200, // 每小时消耗灵石
        requirements: {
            minRealm: "元婴初期",
            maxRealm: "无上限"
        },
        unlockCondition: "悟道石前顿悟"
    }
};

// 境界等级映射表
const CultivationRealms = [
    { name: "练气初期", threshold: 1000 },
    { name: "练气中期", threshold: 3000 },
    { name: "练气后期", threshold: 6000 },
    { name: "筑基初期", threshold: 10000 },
    { name: "筑基中期", threshold: 15000 },
    { name: "筑基后期", threshold: 25000 },
    { name: "结丹初期", threshold: 40000 },
    { name: "结丹中期", threshold: 70000 },
    { name: "结丹后期", threshold: 100000 },
    { name: "元婴初期", threshold: 150000 },
    { name: "元婴中期", threshold: 250000 },
    { name: "元婴后期", threshold: 400000 },
    { name: "化神初期", threshold: 700000 }
];

// 导出数据
export { SkillsData, CultivationRealms }; 