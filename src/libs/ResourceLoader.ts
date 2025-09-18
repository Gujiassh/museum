import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export interface ResourceItem {
  name: string;
  type: 'gltf' | 'texture' | 'audio' | 'font' | 'json';
  url: string;
  data?: any;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  progress: number;
  currentItem?: string;
}

export class ResourceLoader {
  private resources: Map<string, any> = new Map();
  private loadingProgress: LoadProgress = { loaded: 0, total: 0, progress: 0 };
  private onProgressCallback?: (progress: LoadProgress) => void;
  
  // 加载器实例
  private gltfLoader = new GLTFLoader();
  private textureLoader = new THREE.TextureLoader();
  private fontLoader = new FontLoader();

  constructor() {
    // 设置纹理加载器的跨域
    this.textureLoader.setCrossOrigin('anonymous');
  }

  // 设置进度回调
  setProgressCallback(callback: (progress: LoadProgress) => void) {
    this.onProgressCallback = callback;
  }

  // 更新进度
  private updateProgress(itemName: string) {
    this.loadingProgress.loaded++;
    this.loadingProgress.progress = this.loadingProgress.loaded / this.loadingProgress.total;
    this.loadingProgress.currentItem = itemName;
    
    console.log(`资源加载完成: ${itemName} (${this.loadingProgress.loaded}/${this.loadingProgress.total})`);
    
    if (this.onProgressCallback) {
      this.onProgressCallback({ ...this.loadingProgress });
    }
  }

  // 加载单个GLTF模型
  private loadGLTF(item: ResourceItem): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        item.url,
        (gltf) => {
          this.resources.set(item.name, gltf);
          this.updateProgress(item.name);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`GLTF加载失败: ${item.name}`, error);
          reject(error);
        }
      );
    });
  }

  // 加载纹理
  private loadTexture(item: ResourceItem): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        item.url,
        (texture) => {
          this.resources.set(item.name, texture);
          this.updateProgress(item.name);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`纹理加载失败: ${item.name}`, error);
          reject(error);
        }
      );
    });
  }

  // 使用原生Web Audio API加载音频
  private loadAudio(item: ResourceItem): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      // 使用原生fetch代替Three.js的AudioLoader
      fetch(item.url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          // 使用Web Audio API解码音频
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          return audioContext.decodeAudioData(arrayBuffer);
        })
        .then(audioBuffer => {
          this.resources.set(item.name, audioBuffer);
          this.updateProgress(item.name);
          resolve(audioBuffer);
        })
        .catch(error => {
          console.error(`音频加载失败: ${item.name}`, error);
          reject(error);
        });
    });
  }

  // 加载字体
  private loadFont(item: ResourceItem): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fontLoader.load(
        item.url,
        (font) => {
          this.resources.set(item.name, font);
          this.updateProgress(item.name);
          resolve(font);
        },
        undefined,
        (error) => {
          console.error(`字体加载失败: ${item.name}`, error);
          reject(error);
        }
      );
    });
  }

  // 使用原生fetch加载JSON
  private loadJSON(item: ResourceItem): Promise<any> {
    return new Promise((resolve, reject) => {
      fetch(item.url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.resources.set(item.name, data);
          this.updateProgress(item.name);
          resolve(data);
        })
        .catch(error => {
          console.error(`JSON加载失败: ${item.name}`, error);
          reject(error);
        });
    });
  }

  // 加载单个资源
  private loadResource(item: ResourceItem): Promise<any> {
    switch (item.type) {
      case 'gltf':
        return this.loadGLTF(item);
      case 'texture':
        return this.loadTexture(item);
      case 'audio':
        return this.loadAudio(item);
      case 'font':
        return this.loadFont(item);
      case 'json':
        return this.loadJSON(item);
      default:
        return Promise.reject(new Error(`不支持的资源类型: ${item.type}`));
    }
  }

  // 加载所有资源
  async loadAll(resourceList: ResourceItem[]): Promise<void> {
    this.loadingProgress.total = resourceList.length;
    this.loadingProgress.loaded = 0;
    this.loadingProgress.progress = 0;

    console.log(`开始加载 ${resourceList.length} 个资源...`);

    try {
      // 并行加载所有资源
      const loadPromises = resourceList.map(item => this.loadResource(item));
      await Promise.all(loadPromises);
      
      console.log('所有资源加载完成！');
    } catch (error) {
      console.error('资源加载出错:', error);
      throw error;
    }
  }

  // 获取资源
  get(name: string): any {
    return this.resources.get(name);
  }

  // 检查资源是否已加载
  has(name: string): boolean {
    return this.resources.has(name);
  }

  // 获取所有资源名称
  getResourceNames(): string[] {
    return Array.from(this.resources.keys());
  }

  // 清理资源
  dispose() {
    this.resources.clear();
    this.loadingProgress = { loaded: 0, total: 0, progress: 0 };
  }
}

// 创建全局资源加载器实例
export const resourceLoader = new ResourceLoader();