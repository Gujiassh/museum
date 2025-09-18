const defaultContent = `青铜鸮尊
年代：西周早期（约公元前11世纪）
材质：青铜
出土地点：陕西宝鸡

这件青铜鸮（xiāo，猫头鹰）尊通体以夸张的鸮鸟形象铸造，器身宽厚，双翼贴体，圆睁的双目炯炯有神，喙部尖锐而有力。整体造型既保留了自然鸟类的特征，又融入了抽象的几何纹饰，展现了早期青铜工艺的独特审美与精湛技艺。

此器作为酒器，可能用于祭祀或宴饮活动。鸮鸟在古代常与神秘和夜晚联系在一起，具有沟通天地与祖灵的象征意义。通过这件鸮尊，可以窥见西周人对自然与宗教的崇拜，以及礼制社会下器物与权力的紧密联系。`;

export interface ButtonConfig {
  textContent?: string;
  buttonText?: string;
  id?: string;
}

export interface ButtonFactory {
  container: HTMLDivElement;
  button: HTMLButtonElement;
  card: HTMLDivElement;
  isCardVisible: boolean;
  toggleCard: () => void;
  show: () => void;
  hide: () => void;
  setToggleCallback: (callback: () => void) => void;
}

export const createButton = (config: ButtonConfig = {}): ButtonFactory => {
  const {
    textContent = defaultContent,
    buttonText = "查看详情",
    id
  } = config;

  // 创建容器div (CSS2DRenderer管理的外层)
  const container = document.createElement("div");
  container.classList.add("button-container");
  if (id) container.id = id;

  // 创建卡片
  const card = document.createElement("div");
  card.classList.add("card");
  card.textContent = textContent;
  // 不设置display: none，而是用CSS类控制opacity和pointer-events

  // 创建实际按钮 (可以独立变换的内层)
  const button = document.createElement("button");
  button.classList.add("click-button");
  button.textContent = buttonText;

  // 将元素添加到容器
  container.appendChild(button);
  container.appendChild(card);

  // 卡片可见状态
  let isCardVisible = false;
  
  // 存储自定义的toggle回调函数
  let customToggleCallback: (() => void) | null = null;

  // 切换卡片显隐
  const toggleCard = () => {
    isCardVisible = !isCardVisible;
    if (isCardVisible) {
      card.classList.add('show');
    } else {
      card.classList.remove('show');
    }
    
    // 如果有自定义回调，执行它
    if (customToggleCallback) {
      customToggleCallback();
    }
  };

  // 设置自定义toggle回调
  const setToggleCallback = (callback: () => void) => {
    customToggleCallback = callback;
  };

  // 显示卡片
  const show = () => {
    isCardVisible = true;
    card.classList.add('show');
  };

  // 隐藏卡片
  const hide = () => {
    isCardVisible = false;
    card.classList.remove('show');
  };

  // 添加点击事件监听器
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止事件冒泡
    console.log('按钮被点击，ID:', id);
    console.log('当前卡片状态:', isCardVisible);
    toggleCard();
    console.log('点击后卡片状态:', isCardVisible);
  });

  return {
    container,
    button,
    card,
    get isCardVisible() { return isCardVisible; },
    toggleCard,
    show,
    hide,
    setToggleCallback
  };
};
