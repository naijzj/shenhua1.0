/**
 * 宝物阁交易系统 - 神话·天命
 * 负责管理商品展示、筛选和交易
 */
import TreasureItems, { ItemCategories, RarityLevels, SpiritStoneRate } from './treasure-data.js';
import PlayerModule from './player.js';
import InventoryInstance from './inventory.js';

class TreasureShop {
    constructor() {
        this.items = [...TreasureItems]; // 商品列表
        this.filteredItems = [...this.items]; // 筛选后的商品
        this.currentFilter = null; // 当前筛选分类
        this.observers = []; // 观察者列表，用于通知UI更新
        this.currentView = 'buy'; // 当前视图: buy或sell
        
        // 绑定DOM元素
        this.shopContainer = document.querySelector('.treasure-shop');
        this.sellContainer = document.querySelector('.sell-items');
        this.filterButtons = document.querySelectorAll('.category-filter');
        this.rateDisplay = document.querySelector('.spirit-stone-rate');
        this.viewToggleButtons = document.querySelectorAll('.view-toggle');
        
        // 初始化商店
        this.initialize();
    }
    
    /**
     * 初始化商店系统
     */
    initialize() {
        // 计算初始商品价格
        this.updatePrices();
        
        // 渲染商品列表
        this.renderView();
        
        // 绑定筛选按钮事件
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const category = button.dataset.category;
                    this.filterByCategory(category);
                });
            });
        }
        
        // 绑定视图切换按钮事件
        if (this.viewToggleButtons) {
            this.viewToggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const view = button.dataset.view;
                    this.switchView(view);
                });
            });
        }
        
        // 更新灵石汇率显示
        this.updateRateDisplay();
        
        // 观察背包变化，以更新出售界面
        InventoryInstance.addObserver(() => {
            if (this.currentView === 'sell') {
                this.renderSellView();
            }
        });
    }
    
    /**
     * 切换视图（购买/出售）
     * @param {string} view - 视图名称，'buy'或'sell'
     */
    switchView(view) {
        if (view === this.currentView) return;
        
        this.currentView = view;
        
        // 更新按钮状态
        if (this.viewToggleButtons) {
            this.viewToggleButtons.forEach(button => {
                if (button.dataset.view === view) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
        
        // 渲染相应视图
        this.renderView();
    }
    
    /**
     * 根据当前视图渲染内容
     */
    renderView() {
        if (this.currentView === 'buy') {
            this.renderItems();
            if (this.sellContainer) {
                this.sellContainer.style.display = 'none';
            }
            if (this.shopContainer) {
                this.shopContainer.style.display = 'grid';
            }
        } else {
            this.renderSellView();
            if (this.shopContainer) {
                this.shopContainer.style.display = 'none';
            }
            if (this.sellContainer) {
                this.sellContainer.style.display = 'grid';
            }
        }
    }
    
    /**
     * 添加观察者（观察者模式）
     * @param {function} observer - 观察者回调函数
     */
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    /**
     * 通知所有观察者
     */
    notifyObservers() {
        this.observers.forEach(observer => observer(this.filteredItems));
    }
    
    /**
     * 根据分类筛选商品
     * @param {string} category - 分类名称
     */
    filterByCategory(category) {
        // 如果是当前分类，则取消筛选
        if (this.currentFilter === category) {
            this.currentFilter = null;
            this.filteredItems = [...this.items];
        } else {
            this.currentFilter = category;
            this.filteredItems = this.items.filter(item => item.category === category);
        }
        
        // 更新UI
        this.renderView();
        this.notifyObservers();
        
        // 更新筛选按钮状态
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                if (button.dataset.category === this.currentFilter) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }
    
    /**
     * 更新所有商品价格
     */
    updatePrices() {
        this.items.forEach(item => {
            // 计算实际价格（基础价 * 稀有度倍数 * 灵石汇率）
            item.price = Math.ceil(item.basePrice * item.rarity.multiplier * SpiritStoneRate.value);
        });
    }
    
    /**
     * 更新灵石汇率显示
     */
    updateRateDisplay() {
        if (this.rateDisplay) {
            const ratePercentage = (SpiritStoneRate.value * 100).toFixed(1);
            const trend = SpiritStoneRate.value > 1 ? '↑' : SpiritStoneRate.value < 1 ? '↓' : '→';
            this.rateDisplay.textContent = `${ratePercentage}% ${trend}`;
            
            // 根据汇率高低设置颜色
            if (SpiritStoneRate.value > 1.05) {
                this.rateDisplay.className = 'spirit-stone-rate high';
            } else if (SpiritStoneRate.value < 0.95) {
                this.rateDisplay.className = 'spirit-stone-rate low';
            } else {
                this.rateDisplay.className = 'spirit-stone-rate normal';
            }
        }
    }
    
    /**
     * 渲染商品列表（购买视图）
     */
    renderItems() {
        if (!this.shopContainer) return;
        
        // 清空容器
        this.shopContainer.innerHTML = '';
        
        // 遍历筛选后的商品并创建元素
        this.filteredItems.forEach(item => {
            // 创建商品卡片
            const itemCard = document.createElement('div');
            itemCard.className = `item-card ${item.stock <= 0 ? 'sold-out' : ''}`;
            itemCard.dataset.itemId = item.id;
            
            // 获取玩家灵石数量
            const playerCurrency = PlayerModule.getCurrency();
            const canAfford = playerCurrency >= item.price && item.stock > 0;
            
            // 设置商品卡片内容
            itemCard.innerHTML = `
                <div class="item-rarity" style="background-color: ${item.rarity.color}"></div>
                <div class="item-icon-container">
                    <img src="${item.icon}" class="item-icon" alt="${item.name}" onerror="this.src='assets/icons/default.png'">
                </div>
                <h3 class="item-name">${item.name}</h3>
                <div class="item-rarity-label">${item.rarity.name}</div>
                <p class="item-description">${item.description}</p>
                <div class="item-details">
                    <span class="item-category">${item.category}</span>
                    <span class="item-price">${item.price} 灵石</span>
                </div>
                <div class="item-stock">库存: ${item.stock}</div>
                <button class="purchase-btn" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? '购买' : (item.stock <= 0 ? '已售罄' : '灵石不足')}
                </button>
            `;
            
            // 添加到容器
            this.shopContainer.appendChild(itemCard);
            
            // 绑定购买按钮事件
            const purchaseBtn = itemCard.querySelector('.purchase-btn');
            purchaseBtn.addEventListener('click', () => {
                this.purchaseItem(item.id);
            });
        });
    }
    
    /**
     * 渲染出售物品视图
     */
    renderSellView() {
        if (!this.sellContainer) return;
        
        // 清空容器
        this.sellContainer.innerHTML = '';
        
        // 获取玩家背包物品
        let inventoryItems = InventoryInstance.getAllItems();
        
        // 根据当前筛选条件过滤
        if (this.currentFilter) {
            inventoryItems = inventoryItems.filter(item => item.category === this.currentFilter);
        }
        
        // 如果没有物品，显示提示
        if (inventoryItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-inventory-message';
            emptyMessage.textContent = '没有可出售的物品';
            this.sellContainer.appendChild(emptyMessage);
            return;
        }
        
        // 为每个物品创建卡片
        inventoryItems.forEach(item => {
            // 计算出售价格（受汇率影响）
            const sellValue = Math.ceil((item.sellPrice || Math.floor(item.basePrice * 0.5)) * SpiritStoneRate.value);
            
            // 已装备的物品不能出售
            const isEquipped = InventoryInstance.isEquipped(item.id);
            
            // 创建物品卡片
            const itemCard = document.createElement('div');
            itemCard.className = `item-card ${isEquipped ? 'equipped' : ''}`;
            itemCard.dataset.itemId = item.id;
            
            // 设置卡片内容
            itemCard.innerHTML = `
                <div class="item-rarity" style="background-color: ${item.rarity.color}"></div>
                <div class="item-icon-container">
                    <img src="${item.icon}" class="item-icon" alt="${item.name}" onerror="this.src='assets/icons/default.png'">
                    ${item.quantity > 1 ? `<span class="item-quantity">${item.quantity}</span>` : ''}
                </div>
                <h3 class="item-name">${item.name}</h3>
                <div class="item-rarity-label">${item.rarity.name}</div>
                <p class="item-description">${item.description}</p>
                <div class="item-details">
                    <span class="item-category">${item.category}</span>
                    <span class="item-price sell-price">${sellValue} 灵石</span>
                </div>
                ${isEquipped ? '<div class="equipped-badge">已装备</div>' : ''}
                <div class="item-actions">
                    <button class="sell-btn" data-item-id="${item.id}" ${isEquipped ? 'disabled' : ''}>
                        ${isEquipped ? '已装备' : '出售'}
                    </button>
                    ${item.quantity > 1 && !isEquipped ? `
                        <div class="sell-quantity" style="display: none;">
                            <input type="number" class="quantity-input" value="1" min="1" max="${item.quantity}">
                            <button class="confirm-sell">确认</button>
                            <button class="cancel-sell">取消</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // 添加到容器
            this.sellContainer.appendChild(itemCard);
            
            // 如果没有装备，绑定出售按钮事件
            if (!isEquipped) {
                const sellBtn = itemCard.querySelector('.sell-btn');
                sellBtn.addEventListener('click', () => {
                    // 如果数量大于1，显示数量选择器
                    if (item.quantity > 1) {
                        const quantitySelector = itemCard.querySelector('.sell-quantity');
                        if (quantitySelector) {
                            sellBtn.style.display = 'none';
                            quantitySelector.style.display = 'flex';
                        }
                    } else {
                        // 直接出售
                        this.sellPlayerItem(item.id, 1);
                    }
                });
                
                // 绑定确认出售按钮事件
                const confirmBtn = itemCard.querySelector('.confirm-sell');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => {
                        const quantityInput = itemCard.querySelector('.quantity-input');
                        const quantity = parseInt(quantityInput.value);
                        
                        if (quantity > 0 && quantity <= item.quantity) {
                            this.sellPlayerItem(item.id, quantity);
                        }
                    });
                }
                
                // 绑定取消出售按钮事件
                const cancelBtn = itemCard.querySelector('.cancel-sell');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        const quantitySelector = itemCard.querySelector('.sell-quantity');
                        if (quantitySelector) {
                            sellBtn.style.display = 'block';
                            quantitySelector.style.display = 'none';
                        }
                    });
                }
            }
        });
    }
    
    /**
     * 购买商品
     * @param {string} itemId - 商品ID
     */
    purchaseItem(itemId) {
        // 查找商品
        const item = this.items.find(i => i.id === itemId);
        if (!item || item.stock <= 0) return;
        
        // 检查玩家灵石是否足够
        const playerCurrency = PlayerModule.getCurrency();
        if (playerCurrency < item.price) return;
        
        // 扣除灵石
        PlayerModule.updateCurrency(-item.price);
        
        // 减少库存
        item.stock--;
        
        // 添加到玩家背包
        InventoryInstance.addItem({...item, quantity: 1});
        
        // 显示购买成功动画
        this.showPurchaseAnimation(item);
        
        // 波动灵石汇率
        SpiritStoneRate.fluctuate();
        
        // 更新价格
        this.updatePrices();
        
        // 更新UI
        this.renderView();
        this.updateRateDisplay();
        this.notifyObservers();
    }
    
    /**
     * 出售玩家物品
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 数量
     */
    sellPlayerItem(itemId, quantity) {
        // 出售物品并获得灵石
        const gainedCurrency = InventoryInstance.sellItem(itemId, quantity);
        
        if (gainedCurrency > 0) {
            // 显示出售成功动画
            this.showSellAnimation(gainedCurrency);
            
            // 波动灵石汇率
            SpiritStoneRate.fluctuate();
            
            // 更新价格
            this.updatePrices();
            
            // 更新UI
            this.renderView();
            this.updateRateDisplay();
            this.notifyObservers();
        }
    }
    
    /**
     * 显示购买成功动画
     * @param {Object} item - 购买的商品
     */
    showPurchaseAnimation(item) {
        // 创建动画元素
        const animation = document.createElement('div');
        animation.className = 'purchase-animation';
        
        // 设置内容
        animation.innerHTML = `
            <div class="purchase-success">
                <img src="${item.icon}" alt="${item.name}" class="success-icon">
                <div class="success-text">
                    <span>获得 ${item.name}</span>
                    <small>-${item.price} 灵石</small>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(animation);
        
        // 添加动画类
        setTimeout(() => {
            animation.classList.add('show');
        }, 10);
        
        // 3秒后移除动画
        setTimeout(() => {
            animation.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(animation);
            }, 300);
        }, 3000);
    }
    
    /**
     * 显示出售成功动画
     * @param {number} amount - 获得的灵石数量
     */
    showSellAnimation(amount) {
        // 创建动画元素
        const animation = document.createElement('div');
        animation.className = 'purchase-animation sell-animation';
        
        // 设置内容
        animation.innerHTML = `
            <div class="purchase-success">
                <div class="success-icon currency-icon">💰</div>
                <div class="success-text">
                    <span>出售成功</span>
                    <small>+${amount} 灵石</small>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(animation);
        
        // 添加动画类
        setTimeout(() => {
            animation.classList.add('show');
        }, 10);
        
        // 3秒后移除动画
        setTimeout(() => {
            animation.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(animation);
            }, 300);
        }, 3000);
    }
    
    /**
     * 获取所有商品分类
     * @returns {Array} - 分类列表
     */
    getAllCategories() {
        return Object.values(ItemCategories);
    }
    
    /**
     * 获取当前筛选后的商品
     * @returns {Array} - 商品列表
     */
    getFilteredItems() {
        return this.filteredItems;
    }
}

// 导出商店类
export default TreasureShop; 