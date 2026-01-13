import { Pass } from "postprocessing"
import * as THREE from "three"
import { tensorFragmentShader } from "@/shaders/tensor-fragment-shader"
import { kuwaharaFragmentShader } from "@/shaders/kuwahara-fragment-shader"

class FullScreenQuad {
  private camera: THREE.OrthographicCamera
  private geometry: THREE.PlaneGeometry
  private mesh: THREE.Mesh

  constructor(material: THREE.Material) {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.geometry = new THREE.PlaneGeometry(2, 2)
    this.mesh = new THREE.Mesh(this.geometry, material)
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.render(this.mesh, this.camera)
  }

  dispose() {
    this.geometry.dispose()
  }

  get material() {
    return this.mesh.material
  }

  set material(value: THREE.Material) {
    this.mesh.material = value
  }
}

const tensorShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
  },
  vertexShader: `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
  `,
  fragmentShader: tensorFragmentShader,
}

export class TensorPass extends Pass {
  material: THREE.ShaderMaterial
  fullscreenMaterial: THREE.ShaderMaterial
  resolution: THREE.Vector4
  fsQuad: FullScreenQuad

  constructor() {
    super()

    this.material = new THREE.ShaderMaterial(tensorShader)
    this.fullscreenMaterial = this.material
    this.fsQuad = new FullScreenQuad(this.material)
    this.resolution = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2)),
    )
  }

  updateResolution(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.resolution.set(width * dpr, height * dpr, 1 / (width * dpr), 1 / (height * dpr))
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    this.material.uniforms.inputBuffer.value = readBuffer.texture
    this.material.uniforms.resolution.value = this.resolution

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
    }
    this.fsQuad.render(renderer)
  }
}

const kuwaharaShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
    originalTexture: { value: null },
    radius: { value: 6 },
  },
  vertexShader: `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
  `,
  fragmentShader: kuwaharaFragmentShader,
}

export class KuwaharaPass extends Pass {
  material: THREE.ShaderMaterial
  fullscreenMaterial: THREE.ShaderMaterial
  resolution: THREE.Vector4
  radius: number
  originalSceneTarget: THREE.WebGLRenderTarget
  fsQuad: FullScreenQuad

  constructor(args: { radius: number; originalSceneTarget: THREE.WebGLRenderTarget }) {
    super()

    this.material = new THREE.ShaderMaterial(kuwaharaShader)
    this.fullscreenMaterial = this.material
    this.fsQuad = new FullScreenQuad(this.material)
    this.resolution = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2)),
    )
    this.radius = args.radius
    this.originalSceneTarget = args.originalSceneTarget
  }

  updateResolution(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.resolution.set(width * dpr, height * dpr, 1 / (width * dpr), 1 / (height * dpr))
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    this.material.uniforms.resolution.value = this.resolution
    this.material.uniforms.radius.value = this.radius
    this.material.uniforms.inputBuffer.value = readBuffer.texture
    this.material.uniforms.originalTexture.value = this.originalSceneTarget.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
    }
    this.fsQuad.render(renderer)
  }
}

const finalShader = {
  uniforms: {
    inputBuffer: { value: null },
    watercolorTexture: { value: null },
  },
  vertexShader: `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
  `,
  fragmentShader: `
  uniform sampler2D inputBuffer;
  uniform sampler2D watercolorTexture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(inputBuffer, vUv);
    vec4 watercolor = texture2D(watercolorTexture, vUv);
    
    // Blend the watercolor texture with the rendered scene
    gl_FragColor = mix(color, color * watercolor, 0.3);
  }
  `,
}

export class FinalPass extends Pass {
  material: THREE.ShaderMaterial
  fullscreenMaterial: THREE.ShaderMaterial
  watercolorTexture: THREE.Texture
  fsQuad: FullScreenQuad

  constructor(args: { watercolorTexture: THREE.Texture }) {
    super()

    this.material = new THREE.ShaderMaterial(finalShader)
    this.fullscreenMaterial = this.material
    this.fsQuad = new FullScreenQuad(this.material)
    this.watercolorTexture = args.watercolorTexture
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    this.material.uniforms.inputBuffer.value = readBuffer.texture
    this.material.uniforms.watercolorTexture.value = this.watercolorTexture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
    }
    this.fsQuad.render(renderer)
  }
}
