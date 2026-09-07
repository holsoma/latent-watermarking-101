"""Conditioning optimisation primitive used by the ROBIN adapter."""
import torch
from torch import nn

class ConditioningProxy(nn.Module):
    def __init__(self, dimensions=16):
        super().__init__(); self.embedding=nn.Parameter(torch.zeros(1,dimensions))
    def forward(self, image): return image + self.embedding.mean()*0.01

def conditioning_drift(original, optimised): return float((original-optimised).square().mean().sqrt().item())
