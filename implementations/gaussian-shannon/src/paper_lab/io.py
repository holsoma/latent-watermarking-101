from pathlib import Path
import numpy as np
import torch
from PIL import Image

def save_image(tensor,path:Path):
    tensor=tensor.detach().cpu().clamp(-1,1); tensor=tensor[0] if tensor.ndim==4 else tensor
    Image.fromarray(((tensor.permute(1,2,0)+1)*127.5).byte().numpy()).save(path)

def load_image(path:Path):
    array=np.asarray(Image.open(path).convert("RGB")); return torch.from_numpy(array.copy()).float().permute(2,0,1).div(127.5).sub(1).unsqueeze(0)
