import { Effect } from "postprocessing"
import { Uniform, Vector4 } from "three"
import { tensorFragmentShader } from "@/shaders/tensor-fragment-shader"

export class TensorEffect extends Effect {
  constructor() {
    super("TensorEffect", tensorFragmentShader, {
      uniforms: new Map([["resolution", new Uniform(new Vector4())]]),
    })
  }

  update(renderer: any, inputBuffer: any) {
    const width = inputBuffer.width
    const height = inputBuffer.height

    this.uniforms.get("resolution")!.value.set(width, height, 1.0 / width, 1.0 / height)
  }
}
