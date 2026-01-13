import { Effect } from "postprocessing"
import { Uniform, Vector4, type Texture } from "three"
import { kuwaharaFragmentShader } from "@/shaders/kuwahara-fragment-shader"

export class KuwaharaEffect extends Effect {
  constructor(originalTexture: Texture, radius = 4) {
    super("KuwaharaEffect", kuwaharaFragmentShader, {
      uniforms: new Map([
        ["resolution", new Uniform(new Vector4())],
        ["radius", new Uniform(radius)],
        ["originalTexture", new Uniform(originalTexture)],
      ]),
    })
  }

  update(renderer: any, inputBuffer: any) {
    const width = inputBuffer.width
    const height = inputBuffer.height

    this.uniforms.get("resolution")!.value.set(width, height, 1.0 / width, 1.0 / height)
  }

  setRadius(radius: number) {
    this.uniforms.get("radius")!.value = radius
  }
}
