import math


def binomial_upper_tail(agreements: int, trials: int, p: float = 0.5) -> float:
    """P(X >= agreements) for X~Binomial(trials,p), used as a null score."""
    if agreements < 0 or agreements > trials:
        raise ValueError("agreements must be between zero and trials")
    return sum(math.comb(trials, k) * p**k * (1 - p) ** (trials - k) for k in range(agreements, trials + 1))
