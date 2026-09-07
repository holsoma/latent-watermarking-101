from stable_signature_lab.stats import binomial_upper_tail


def test_binomial_tail_bounds():
    assert binomial_upper_tail(48, 48) < 1e-10
    assert abs(binomial_upper_tail(24, 48) - 0.5572832514) < 1e-6
