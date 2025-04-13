/**
 * 像素化着色器
 * 用于实现像素风格效果
 */
export const PixelShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'resolution': { value: null },
    'pixelSize': { value: 4.0 }
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    
    varying vec2 vUv;
    
    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
      
      // 增强颜色对比度，使像素风格更明显
      vec3 color = gl_FragColor.rgb;
      color = floor(color * 8.0) / 8.0;
      gl_FragColor.rgb = color;
    }
  `
};
