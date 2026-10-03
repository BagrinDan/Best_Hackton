"""
Image Generator pentru 4GB VRAM
Rulează local cu Stable Diffusion 1.5
"""

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image
import time
from pathlib import Path


class LocalImageGenerator:
    """
    Generează imagini cu SD 1.5 pe GPU 4GB.
    Optimizat pentru VRAM mic.
    """
    
    def __init__(self, model_id="runwayml/stable-diffusion-v1-5"):
        print("🔄 Loading Stable Diffusion 1.5...")
        start = time.time()
        
        self.pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,       # FP16 = jumătate VRAM
            safety_checker=None,
            requires_safety_checker=False,
        )
        
        # Scheduler rapid (20 steps în loc de 50)
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config
        )
        
        # Mută pe GPU
        self.pipe = self.pipe.to("cuda")
        
        # Optimizări VRAM
        self.pipe.enable_attention_slicing()
        self.pipe.enable_vae_slicing()
        
        # xformers (dacă e instalat)
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("   ✅ xformers activat")
        except Exception:
            print("   ⚠️ xformers indisponibil")
        
        elapsed = time.time() - start
        print(f"✅ Model încărcat în {elapsed:.1f}s")
        
        # Verifică VRAM
        if torch.cuda.is_available():
            vram = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"📊 VRAM disponibil: {vram:.1f} GB")
    
    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        steps: int = 20,
        size: int = 512,
        seed: int = 42,
    ) -> Image.Image:
        """Generează o imagine."""
        start = time.time()
        
        full_prompt = (
            f"{prompt}, educational illustration, flat design, "
            f"minimalist, white background, clean, high quality, vector style"
        )
        
        full_negative = (
            f"{negative_prompt}, blurry, low quality, text, watermark, "
            f"signature, ugly, distorted, realistic photo, complex"
        )
        
        with torch.autocast("cuda"):
            image = self.pipe(
                prompt=full_prompt,
                negative_prompt=full_negative,
                num_inference_steps=steps,
                guidance_scale=7.5,
                width=size,
                height=size,
                generator=torch.Generator("cuda").manual_seed(seed),
            ).images[0]
        
        elapsed = time.time() - start
        print(f"   ✅ Imagine generată în {elapsed:.1f}s")
        
        return image
    
    def generate_batch(self, prompts: list, output_dir="cards"):
        """Generează mai multe imagini."""
        Path(output_dir).mkdir(exist_ok=True)
        
        results = []
        for i, prompt in enumerate(prompts, 1):
            print(f"\n[{i}/{len(prompts)}] {prompt[:60]}...")
            try:
                image = self.generate(prompt)
                path = f"{output_dir}/img_{i}.png"
                image.save(path)
                results.append(path)
                print(f"   💾 {path}")
            except Exception as e:
                print(f"   ❌ {e}")
                results.append(None)
        
        return results


# ============ CONFIG PENTRU 4GB VRAM ============

# Dacă VRAM < 4GB (ex: 2GB), decomentează:
# generator.pipe.enable_sequential_cpu_offload()
# → Va fi 2-5 minute per imagine, dar funcționează

# Dacă VRAM = 4GB, poți încerca și LCM LoRA pentru viteză:
# from diffusers import LCMScheduler
# generator.pipe.scheduler = LCMScheduler.from_config(generator.pipe.scheduler.config)
# generator.pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
# → 4 steps în loc de 20 (5x mai rapid)


if __name__ == "__main__":
    gen = LocalImageGenerator()
    
    # Exemplu pentru o definiție
    image = gen.generate(
        prompt="a transparent water container, a red bucket, "
               "a measuring tape, showing relationship between volume, mass, density"
    )
    image.save("test_volum.png")
    print("✅ test_volum.png salvat")