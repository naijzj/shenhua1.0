/**
 * 因果UI组件 - 神话·天命
 * 负责显示因果值相关的界面元素
 */
import KarmaManager from './karma-manager.js';
import { getNextEvents, CULTIVATION_TIERS } from './events.js';

class KarmaUI {
    constructor() {
        // 初始化状态
        this.initialized = false;
        
        // 界面元素引用
        this.karmaDisplay = null;
        this.karmaProgress = null;
        this.karmaBar = null;
        this.karmaIndicator = null;
        this.nextEventsContainer = null;
        
        // 初始化UI
        this.initialize();
    }
    
    /**
     * 初始化UI组件
     */
    initialize() {
        // 创建并添加因果UI元素
        this.createKarmaUI();
        
        // 添加karma变化监听器
        KarmaManager.onKarmaChange((newValue, oldValue) => {
            this.updateKarmaDisplay(newValue);
            this.updateNextEvents(newValue);
        });
        
        // 标记为已初始化
        this.initialized = true;
        
        // 初始更新显示
        this.updateKarmaDisplay(KarmaManager.getKarma());
        this.updateNextEvents(KarmaManager.getKarma());
        
        console.log('因果UI初始化完成');
    }
    
    /**
     * 创建因果UI元素
     */
    createKarmaUI() {
        // 检查是否已存在
        if (document.getElementById('karma-ui-container')) {
            return;
        }
        
        // 检查是否已加载CSS
        this.ensureStylesLoaded();
        
        // 创建主容器
        const container = document.createElement('div');
        container.id = 'karma-ui-container';
        container.classList.add('karma-ui-container');
        
        // 因果值显示
        const karmaHeader = document.createElement('div');
        karmaHeader.classList.add('karma-header');
        
        const karmaTitle = document.createElement('div');
        karmaTitle.textContent = '因果值';
        karmaTitle.classList.add('karma-title');
        
        this.karmaDisplay = document.createElement('div');
        this.karmaDisplay.classList.add('karma-value');
        this.karmaDisplay.textContent = '0';
        
        karmaHeader.appendChild(karmaTitle);
        karmaHeader.appendChild(this.karmaDisplay);
        
        // 修为境界指示
        const cultivationStatus = document.createElement('div');
        cultivationStatus.classList.add('cultivation-status');
        
        const cultivationLabel = document.createElement('span');
        cultivationLabel.textContent = '当前境界:';
        
        this.cultivationLevel = document.createElement('span');
        this.cultivationLevel.textContent = '练气期';
        this.cultivationLevel.classList.add('cultivation-level');
        
        cultivationStatus.appendChild(cultivationLabel);
        cultivationStatus.appendChild(this.cultivationLevel);
        
        // 进度条
        this.karmaProgress = document.createElement('div');
        this.karmaProgress.classList.add('karma-progress');
        
        this.karmaBar = document.createElement('div');
        this.karmaBar.classList.add('karma-bar');
        
        this.karmaIndicator = document.createElement('div');
        this.karmaIndicator.classList.add('karma-indicator');
        
        this.karmaProgress.appendChild(this.karmaBar);
        this.karmaProgress.appendChild(this.karmaIndicator);
        
        // 下一个事件提示
        const nextEventsTitle = document.createElement('div');
        nextEventsTitle.textContent = '即将发生:';
        nextEventsTitle.classList.add('next-events-title');
        
        this.nextEventsContainer = document.createElement('div');
        this.nextEventsContainer.classList.add('next-events');
        
        // 组装UI
        container.appendChild(karmaHeader);
        container.appendChild(cultivationStatus);
        container.appendChild(this.karmaProgress);
        container.appendChild(nextEventsTitle);
        container.appendChild(this.nextEventsContainer);
        
        // 添加到文档
        document.body.appendChild(container);
        
        // 添加拖动功能
        this.makeDraggable(container);
        
        // 添加收起/展开功能
        let isCollapsed = false;
        container.addEventListener('dblclick', (e) => {
            if (e.target === karmaHeader || e.target === karmaTitle || e.target === this.karmaDisplay) {
                if (isCollapsed) {
                    container.style.height = 'auto';
                    this.nextEventsContainer.style.display = 'block';
                    this.karmaProgress.style.display = 'block';
                    cultivationStatus.style.display = 'flex';
                    nextEventsTitle.style.display = 'block';
                } else {
                    const headerHeight = karmaHeader.offsetHeight;
                    container.style.height = `${headerHeight + 30}px`;
                    this.nextEventsContainer.style.display = 'none';
                    this.karmaProgress.style.display = 'none';
                    cultivationStatus.style.display = 'none';
                    nextEventsTitle.style.display = 'none';
                }
                isCollapsed = !isCollapsed;
            }
        });
    }
    
    /**
     * 确保样式已加载
     */
    ensureStylesLoaded() {
        if (!document.querySelector('link[href="karma-styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'karma-styles.css';
            document.head.appendChild(link);
        }
    }
    
    /**
     * 让元素可拖动
     * @param {HTMLElement} element - 要拖动的元素
     */
    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.style.cursor = 'move';
        
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // 获取鼠标位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // 鼠标移动时调用elementDrag
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // 计算新位置
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // 设置元素的新位置
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = "auto";
        }
        
        function closeDragElement() {
            // 停止移动
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    /**
     * 更新因果值显示
     * @param {number} karma - 当前因果值
     */
    updateKarmaDisplay(karma) {
        if (!this.initialized) return;
        
        // 更新数值显示
        this.karmaDisplay.textContent = Math.floor(karma);
        
        // 获取当前和下一境界
        let currentTier = '练气期';
        let nextTier = '筑基期';
        let currentThreshold = 0;
        let nextThreshold = 100;
        
        // 找到当前和下一境界
        const tiers = Object.entries(CULTIVATION_TIERS);
        for (let i = 0; i < tiers.length; i++) {
            const [tier, threshold] = tiers[i];
            
            if (karma >= threshold) {
                currentTier = tier;
                currentThreshold = threshold;
                
                // 设置下一个境界
                if (i < tiers.length - 1) {
                    nextTier = tiers[i + 1][0];
                    nextThreshold = tiers[i + 1][1];
                } else {
                    // 已经是最高境界
                    nextTier = tier;
                    nextThreshold = threshold;
                }
            } else {
                break;
            }
        }
        
        // 更新境界显示
        this.cultivationLevel.textContent = currentTier;
        
        // 计算当前进度
        const progress = currentThreshold === nextThreshold ? 100 : 
            ((karma - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        
        // 更新进度条
        this.karmaBar.style.width = `${Math.min(100, progress)}%`;
        this.karmaIndicator.style.left = `${Math.min(100, progress)}%`;
        
        // 设置颜色
        // 根据善恶倾向设置颜色（这里简单示例，可按需调整）
        const karmaData = KarmaManager.getKarmaData();
        const goodRatio = karmaData.goodDeeds / (karmaData.goodDeeds + karmaData.evilDeeds || 1);
        
        let barColor;
        if (goodRatio > 0.8) {
            // 正道
            barColor = '#4c8dff';
        } else if (goodRatio < 0.4) {
            // 魔道
            barColor = '#e74c3c';
        } else {
            // 中庸
            barColor = '#9a7bcc';
        }
        
        this.karmaBar.style.backgroundColor = barColor;
        this.karmaIndicator.style.boxShadow = `0 0 5px ${barColor}`;
    }
    
    /**
     * 更新即将发生的事件
     * @param {number} karma - 当前因果值
     */
    updateNextEvents(karma) {
        if (!this.initialized) return;
        
        // 获取接下来的事件
        const nextEvents = getNextEvents(karma);
        
        // 清空容器
        this.nextEventsContainer.innerHTML = '';
        
        // 如果没有即将发生的事件
        if (nextEvents.length === 0) {
            const noEventsMsg = document.createElement('div');
            noEventsMsg.textContent = '暂无预知的因果事件';
            noEventsMsg.style.color = '#999';
            noEventsMsg.style.fontStyle = 'italic';
            this.nextEventsContainer.appendChild(noEventsMsg);
            return;
        }
        
        // 添加事件提示
        nextEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('next-event-item');
            if (event.color) {
                eventItem.style.borderLeftColor = event.color;
            }
            
            const eventTitle = document.createElement('div');
            eventTitle.textContent = event.title;
            eventTitle.classList.add('next-event-title');
            if (event.color) {
                eventTitle.style.color = event.color;
            }
            
            const eventThreshold = document.createElement('div');
            eventThreshold.textContent = `因果值达到 ${event.karmaThreshold} 时触发`;
            eventThreshold.classList.add('next-event-threshold');
            
            eventItem.appendChild(eventTitle);
            eventItem.appendChild(eventThreshold);
            this.nextEventsContainer.appendChild(eventItem);
        });
    }
}

// 创建并导出单例实例
const KarmaUIInstance = new KarmaUI();
export default KarmaUIInstance; 