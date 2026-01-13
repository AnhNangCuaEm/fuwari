import * as THREE from "three"

export const KuwaharaShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    radius: { value: 4 },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform int radius;
    
    varying vec2 vUv;
    
    void main() {
      vec2 src_size = resolution;
      vec2 uv = vUv;
      float n = float((radius + 1) * (radius + 1));
      
      vec3 m[4];
      vec3 s[4];
      for (int k = 0; k < 4; ++k) {
        m[k] = vec3(0.0);
        s[k] = vec3(0.0);
      }
      
      // Sample the 4 sectors around the pixel
      for (int j = -radius; j <= 0; ++j) {
        for (int i = -radius; i <= 0; ++i) {
          vec3 c = texture2D(tDiffuse, uv + vec2(i, j) / src_size).rgb;
          m[0] += c;
          s[0] += c * c;
        }
      }
      
      for (int j = -radius; j <= 0; ++j) {
        for (int i = 0; i <= radius; ++i) {
          vec3 c = texture2D(tDiffuse, uv + vec2(i, j) / src_size).rgb;
          m[1] += c;
          s[1] += c * c;
        }
      }
      
      for (int j = 0; j <= radius; ++j) {
        for (int i = 0; i <= radius; ++i) {
          vec3 c = texture2D(tDiffuse, uv + vec2(i, j) / src_size).rgb;
          m[2] += c;
          s[2] += c * c;
        }
      }
      
      for (int j = 0; j <= radius; ++j) {
        for (int i = -radius; i <= 0; ++i) {
          vec3 c = texture2D(tDiffuse, uv + vec2(i, j) / src_size).rgb;
          m[3] += c;
          s[3] += c * c;
        }
      }
      
      float min_sigma2 = 1e+2;
      vec3 result = vec3(0.0);
      
      // Find the sector with minimum variance
      for (int k = 0; k < 4; ++k) {
        m[k] /= n;
        s[k] = abs(s[k] / n - m[k] * m[k]);
        
        float sigma2 = s[k].r + s[k].g + s[k].b;
        if (sigma2 < min_sigma2) {
          min_sigma2 = sigma2;
          result = m[k];
        }
      }
      
      gl_FragColor = vec4(result, 1.0);
    }
  `,
}
