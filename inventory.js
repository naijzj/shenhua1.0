/**
 * 背包管理系统 - 神话·天命
 * 用于管理玩家物品、装备和消耗品
 */
import PlayerModule from './player.js';

class InventorySystem {
    constructor() {
        // 玩家背包数据结构
        this.inventory = {
            items: [], // 物品列表
            maxSize: 20, // 初始背包容量
            equipped: {} // 已装备物品
        };
        
        // 是否已初始化
        this.initialized = false;
        
        // 观察者列表 - 用于通知UI更新
        this.observers = [];
        
        // 初始化背包
        this.initialize();
    }
    
    /**
     * 初始化背包系统
     */
    initialize() {
        // 从本地存储加载背包数据
        this.loadFromStorage();
        
        // 标记为已初始化
        this.initialized = true;
        
        // 通知观察者
        this.notifyObservers();
    }
    
    /**
     * 从本地存储加载背包数据
     */
    loadFromStorage() {
        const savedInventory = localStorage.getItem('playerInventory');
        if (savedInventory) {
            try {
                const parsedInventory = JSON.parse(savedInventory);
                this.inventory = parsedInventory;
            } catch (e) {
                console.error('背包数据加载失败:', e);
            }
        } else {
            // 如果没有保存的数据，创建初始物品
            this.addInitialItems();
        }
    }
    
    /**
     * 保存背包数据到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem('playerInventory', JSON.stringify(this.inventory));
        } catch (e) {
            console.error('背包数据保存失败:', e);
        }
    }
    
    /**
     * 添加初始物品
     */
    addInitialItems() {
        // 添加一些基础物品
        const initialItems = [
            {
                id: 'initial_pill',
                name: '引气丹',
                description: '初学者修炼辅助丹药，微量提升修为',
                category: '丹药',
                rarity: { name: '凡品', multiplier: 1.0, color: '#A0A0A0' },
                basePrice: 20,
                sellPrice: 10,
                icon: 'assets/icons/pill_blue.png',
                quantity: 3,
                stackable: true,
                effects: {
                    cultivation: 50,
                    instant: true
                }
            },
            {
                id: 'initial_sword',
                name: '练气剑',
                description: '初学者常用的法器，有助于引导灵力',
                category: '法宝',
                rarity: { name: '凡品', multiplier: 1.0, color: '#A0A0A0' },
                basePrice: 50,
                sellPrice: 25,
                icon: 'assets/icons/sword.png',
                quantity: 1,
                stackable: false,
                effects: {
                    cultivationBoost: 0.05,
                    duration: -1
                }
            }
        ];
        
        initialItems.forEach(item => this.addItem(item));
    }
    
    /**
     * 添加观察者
     * @param {Function} observer - 观察者回调函数
     */
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    /**
     * 通知所有观察者
     */
    notifyObservers() {
        this.observers.forEach(observer => observer(this.inventory));
    }
    
    /**
     * 添加物品到背包
     * @param {Object} item - 物品对象
     * @param {number} quantity - 数量，默认为1
     * @returns {boolean} - 是否添加成功
     */
    addItem(item, quantity = 1) {
        // 检查背包是否已满
        if (this.inventory.items.length >= this.inventory.maxSize && !this.hasItem(item.id)) {
            return false;
        }
        
        // 如果物品可堆叠，查找是否已有相同物品
        if (item.stackable) {
            const existingItem = this.inventory.items.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                // 添加新物品
                item.quantity = quantity;
                this.inventory.items.push(item);
            }
        } else {
            // 不可堆叠物品，每个占一个位置
            for (let i = 0; i < quantity; i++) {
                if (this.inventory.items.length < this.inventory.maxSize) {
                    const newItem = {...item, quantity: 1};
                    this.inventory.items.push(newItem);
                } else {
                    return false; // 背包已满
                }
            }
        }
        
        // 保存并通知
        this.saveToStorage();
        this.notifyObservers();
        return true;
    }
    
    /**
     * 移除物品
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 数量，默认为1
     * @returns {boolean} - 是否移除成功
     */
    removeItem(itemId, quantity = 1) {
        const itemIndex = this.inventory.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const item = this.inventory.items[itemIndex];
        
        // 检查是否已装备，已装备物品需要先卸下
        if (this.isEquipped(itemId)) {
            return false;
        }
        
        if (item.quantity > quantity) {
            // 减少数量
            item.quantity -= quantity;
        } else {
            // 移除物品
            this.inventory.items.splice(itemIndex, 1);
        }
        
        // 保存并通知
        this.saveToStorage();
        this.notifyObservers();
        return true;
    }
    
    /**
     * 检查是否拥有指定物品
     * @param {string} itemId - 物品ID
     * @returns {boolean} - 是否拥有
     */
    hasItem(itemId) {
        return this.inventory.items.some(item => item.id === itemId);
    }
    
    /**
     * 获取物品数量
     * @param {string} itemId - 物品ID
     * @returns {number} - 物品数量
     */
    getItemQuantity(itemId) {
        const item = this.inventory.items.find(item => item.id === itemId);
        return item ? item.quantity : 0;
    }
    
    /**
     * 使用物品
     * @param {string} itemId - 物品ID
     * @returns {boolean} - 是否使用成功
     */
    useItem(itemId) {
        const item = this.inventory.items.find(item => item.id === itemId);
        if (!item) return false;
        
        // 根据物品类型执行不同效果
        if (item.category === '丹药') {
            // 丹药效果
            if (item.effects.cultivation) {
                // 增加修为
                PlayerModule.addCultivation(item.effects.cultivation);
            }
            
            // 消耗物品
            this.removeItem(itemId, 1);
            return true;
        } else if (item.category === '法宝') {
            // 法宝类物品通常需要装备
            this.equipItem(itemId);
            return true;
        } else if (item.category === '典籍') {
            // 典籍效果 - 例如解锁功法
            if (item.effects.unlockSkill) {
                // 这里可以添加解锁功法的逻辑
                console.log(`解锁功法: ${item.effects.unlockSkill}`);
            }
            
            // 有些典籍使用后消耗，有些保留
            if (item.effects.consume) {
                this.removeItem(itemId, 1);
            }
            return true;
        }
        
        return false;
    }
    
    /**
     * 装备物品
     * @param {string} itemId - 物品ID
     * @returns {boolean} - 是否装备成功
     */
    equipItem(itemId) {
        const item = this.inventory.items.find(item => item.id === itemId);
        if (!item || item.category !== '法宝') return false;
        
        // 如果已有同类型装备，先卸下
        if (this.inventory.equipped[item.category]) {
            // 卸下当前装备
            this.unequipItem(item.category);
        }
        
        // 装备新物品
        this.inventory.equipped[item.category] = itemId;
        
        // 应用装备效果
        if (item.effects.cultivationBoost) {
            // 这里可以添加增加修炼效率的逻辑
            console.log(`装备增加修炼效率: ${item.effects.cultivationBoost * 100}%`);
        }
        
        // 保存并通知
        this.saveToStorage();
        this.notifyObservers();
        return true;
    }
    
    /**
     * 卸下装备
     * @param {string} category - 装备类型
     * @returns {boolean} - 是否卸下成功
     */
    unequipItem(category) {
        if (!this.inventory.equipped[category]) return false;
        
        // 移除装备效果
        const itemId = this.inventory.equipped[category];
        const item = this.inventory.items.find(item => item.id === itemId);
        
        if (item && item.effects.cultivationBoost) {
            // 这里可以添加移除修炼效率加成的逻辑
            console.log(`移除装备修炼效率加成: ${item.effects.cultivationBoost * 100}%`);
        }
        
        // 卸下装备
        delete this.inventory.equipped[category];
        
        // 保存并通知
        this.saveToStorage();
        this.notifyObservers();
        return true;
    }
    
    /**
     * 检查物品是否已装备
     * @param {string} itemId - 物品ID
     * @returns {boolean} - 是否已装备
     */
    isEquipped(itemId) {
        return Object.values(this.inventory.equipped).includes(itemId);
    }
    
    /**
     * 获取背包中的所有物品
     * @returns {Array} - 物品列表
     */
    getAllItems() {
        return [...this.inventory.items];
    }
    
    /**
     * 按类别分类获取背包物品
     * @returns {Object} - 按类别分类的物品
     */
    getItemsByCategory() {
        const categories = {};
        
        this.inventory.items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        return categories;
    }
    
    /**
     * 扩展背包容量
     * @param {number} slots - 增加的格子数
     * @returns {boolean} - 是否扩展成功
     */
    expandInventory(slots) {
        this.inventory.maxSize += slots;
        this.saveToStorage();
        this.notifyObservers();
        return true;
    }
    
    /**
     * 出售物品给商店
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 数量
     * @returns {number} - 获得的灵石数量，失败返回0
     */
    sellItem(itemId, quantity = 1) {
        const item = this.inventory.items.find(item => item.id === itemId);
        if (!item || item.quantity < quantity) return 0;
        
        // 检查是否已装备，已装备物品需要先卸下
        if (this.isEquipped(itemId)) {
            return 0;
        }
        
        // 计算出售获得的灵石
        const sellValue = item.sellPrice || Math.floor(item.basePrice * 0.5);
        const totalValue = sellValue * quantity;
        
        // 移除物品
        if (this.removeItem(itemId, quantity)) {
            // 增加玩家灵石
            PlayerModule.updateCurrency(totalValue);
            return totalValue;
        }
        
        return 0;
    }
    
    /**
     * 对背包进行排序
     * @param {string} sortBy - 排序方式，可选: rarity, category, value
     * @param {boolean} ascending - 是否升序
     */
    sortInventory(sortBy = 'category', ascending = true) {
        // 排序策略
        const sorters = {
            rarity: (a, b) => {
                const rarityA = a.rarity.multiplier;
                const rarityB = b.rarity.multiplier;
                return ascending ? rarityA - rarityB : rarityB - rarityA;
            },
            category: (a, b) => {
                if (ascending) {
                    return a.category.localeCompare(b.category) || 
                           a.name.localeCompare(b.name);
                } else {
                    return b.category.localeCompare(a.category) || 
                           b.name.localeCompare(a.name);
                }
            },
            value: (a, b) => {
                const valueA = a.basePrice;
                const valueB = b.basePrice;
                return ascending ? valueA - valueB : valueB - valueA;
            },
            name: (a, b) => {
                return ascending ? 
                    a.name.localeCompare(b.name) : 
                    b.name.localeCompare(a.name);
            }
        };
        
        // 执行排序
        this.inventory.items.sort(sorters[sortBy] || sorters.category);
        
        // 保存并通知
        this.saveToStorage();
        this.notifyObservers();
    }
}

// 创建并导出单例实例
const InventoryInstance = new InventorySystem();
export default InventoryInstance; 