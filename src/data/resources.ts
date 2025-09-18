// 直接定义接口以避免循环依赖
interface ResourceItem {
  name: string;
  type: 'gltf' | 'texture' | 'audio' | 'font' | 'json';
  url: string;
  data?: any;
}

// 定义所有需要加载的资源
export const resourceManifest: ResourceItem[] = [
  // 3D模型
  {
    name: 'kingsHall',
    type: 'gltf',
    url: './kings_hall/scene.gltf'
  },
  
  // 如需添加更多资源，在这里扩展：
  
  // 纹理资源示例
  // {
  //   name: 'skybox',
  //   type: 'texture',
  //   url: './textures/skybox.jpg'
  // },
  
  // 音频资源示例
  // {
  //   name: 'backgroundMusic',
  //   type: 'audio',
  //   url: './public/kings_hall/background.mp3'
  // },
  // {
  //   name: 'clickSound',
  //   type: 'audio', 
  //   url: './public/kings_hall/click.mp3'
  // },
  
  // 字体资源示例
  // {
  //   name: 'defaultFont',
  //   type: 'font',
  //   url: './fonts/helvetiker_regular.typeface.json'
  // },
  
  // JSON配置文件示例
  // {
  //   name: 'gameConfig',
  //   type: 'json',
  //   url: './config/settings.json'
  // },
  // {
  //   name: 'artifactData',
  //   type: 'json',
  //   url: './data/artifacts.json'
  // }
];

// 按类型分组的资源（可选，便于管理）
export const audioResources: ResourceItem[] = [
  // 取消注释以添加音频资源
  // {
  //   name: 'backgroundMusic',
  //   type: 'audio',
  //   url: './audio/ambient.mp3'
  // },
  // {
  //   name: 'buttonClick',
  //   type: 'audio', 
  //   url: './audio/click.wav'
  // },
  // {
  //   name: 'cameraMove',
  //   type: 'audio',
  //   url: './audio/whoosh.mp3'
  // }
];

export const textureResources: ResourceItem[] = [
  // 取消注释以添加纹理资源
  // {
  //   name: 'environmentMap',
  //   type: 'texture',
  //   url: './textures/environment.hdr'
  // },
  // {
  //   name: 'noiseTexture',
  //   type: 'texture',
  //   url: './textures/noise.jpg'
  // }
];

export const modelResources: ResourceItem[] = [
  {
    name: 'kingsHall',
    type: 'gltf',
    url: './kings_hall/scene.gltf'
  }
  // 取消注释以添加更多模型
  // {
  //   name: 'additionalProps',
  //   type: 'gltf',
  //   url: './models/props.gltf'
  // }
];

// 实用函数：获取特定类型的所有资源
export function getResourcesByType(type: ResourceItem['type']): ResourceItem[] {
  return resourceManifest.filter(resource => resource.type === type);
}

// 实用函数：检查资源是否存在
export function hasResource(name: string): boolean {
  return resourceManifest.some(resource => resource.name === name);
}