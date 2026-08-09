"""Rate limit básico en memoria (ventana fija por IP).

Anti-abuso mínimo elegido para el lanzamiento. Nota: es por instancia; con
múltiples instancias en Cloud Run el límite es aproximado. Para límite estricto
global se requiere un store compartido (ej. Redis) — fuera de alcance por ahora.
"""

import time
from collections import defaultdict

from app.core.config import settings

_hits: dict[str, list[float]] = defaultdict(list)
_WINDOW = 60.0
_last_sweep = 0.0


def _sweep(now: float) -> None:
    """Purga IPs sin hits vigentes. Sin esto, una IP que golpea una sola vez y
    no vuelve queda en memoria para siempre (crecimiento no acotado)."""
    stale = [ip for ip, q in _hits.items() if not q or q[-1] <= now - _WINDOW]
    for ip in stale:
        del _hits[ip]


def allow(ip: str) -> bool:
    global _last_sweep
    now = time.time()

    if now - _last_sweep > _WINDOW:
        _sweep(now)
        _last_sweep = now

    q = _hits[ip]
    while q and q[0] <= now - _WINDOW:
        q.pop(0)
    if len(q) >= settings.rate_limit_per_min:
        return False
    q.append(now)
    return True
