"use client"

import { useEffect, useRef, useState } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useFBO } from "@react-three/drei"
import { EffectComposer } from "postprocessing"
import * as THREE from "three"
import { TensorPass, KuwaharaPass, FinalPass } from "@/postprocessing/passes"

interface EffectsWrapperProps {
  enabled?: boolean
  radius?: number
  enableTensor?: boolean
  enableKuwahara?: boolean
  enableFinal?: boolean
  watercolorTexture?: string | THREE.Texture
  preserveBackground?: boolean
  backgroundColor?: string
}

export function EffectsWrapper({
  enabled = true,
  radius = 4,
  enableTensor = true,
  enableKuwahara = true,
  enableFinal = false,
  watercolorTexture,
  preserveBackground = true,
  backgroundColor,
}: EffectsWrapperProps) {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const tensorPassRef = useRef<TensorPass | null>(null)
  const kuwaharaPassRef = useRef<KuwaharaPass | null>(null)
  const finalPassRef = useRef<FinalPass | null>(null)

  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!watercolorTexture) {
      setLoadedTexture(null)
      return
    }

    if (typeof watercolorTexture === "string") {
      new THREE.TextureLoader().load(watercolorTexture, (t) => {
        setLoadedTexture(t)
      })
    } else if (watercolorTexture instanceof THREE.Texture) {
      setLoadedTexture(watercolorTexture)
    }
  }, [watercolorTexture])

  const originalSceneTarget = useFBO(size.width, size.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  })

  useEffect(() => {
    if (backgroundColor) {
      scene.background = new THREE.Color(backgroundColor)
    } else if (!scene.background) {
      scene.background = new THREE.Color("#1a1a1a")
    }
  }, [scene, backgroundColor])

  useEffect(() => {
    console.log("[v0] Initializing EffectComposer with custom passes")

    const composer = new EffectComposer(gl, {
      depthBuffer: true,
      stencilBuffer: false,
      multisampling: 0,
    })

    const tensorPass = new TensorPass()
    const kuwaharaPass = new KuwaharaPass({ radius, originalSceneTarget })

    composer.addPass(tensorPass)
    composer.addPass(kuwaharaPass)

    if (loadedTexture) {
      const finalPass = new FinalPass({ watercolorTexture: loadedTexture })
      composer.addPass(finalPass)
      finalPassRef.current = finalPass
    }

    composerRef.current = composer
    tensorPassRef.current = tensorPass
    kuwaharaPassRef.current = kuwaharaPass

    console.log("[v0] EffectComposer initialized successfully")

    return () => {
      composer.dispose()
      tensorPass.dispose()
      kuwaharaPass.dispose()
      finalPassRef.current?.dispose()
    }
  }, [gl, loadedTexture])

  useEffect(() => {
    if (kuwaharaPassRef.current) {
      kuwaharaPassRef.current.radius = radius
    }
  }, [radius])

  useEffect(() => {
    if (tensorPassRef.current) {
      tensorPassRef.current.enabled = enableTensor
    }
    if (kuwaharaPassRef.current) {
      kuwaharaPassRef.current.enabled = enableKuwahara
    }
    if (finalPassRef.current) {
      finalPassRef.current.enabled = enableFinal
    }
  }, [enableTensor, enableKuwahara, enableFinal])

  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height)
      originalSceneTarget.setSize(size.width, size.height)

      tensorPassRef.current?.updateResolution(size.width, size.height)
      kuwaharaPassRef.current?.updateResolution(size.width, size.height)
      finalPassRef.current?.updateResolution(size.width, size.height)
    }
  }, [size, originalSceneTarget])

  useFrame(() => {
    if (!composerRef.current || !enabled) return

    gl.setRenderTarget(originalSceneTarget)
    gl.clear(true, true, true)
    gl.render(scene, camera)

    if (kuwaharaPassRef.current) {
      kuwaharaPassRef.current.originalSceneTarget = originalSceneTarget
    }

    gl.setRenderTarget(null)
    composerRef.current.render()
  }, 1)

  return null
}
