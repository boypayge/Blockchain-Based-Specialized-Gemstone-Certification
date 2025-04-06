;; Stone Registration Contract
;; Records details of valuable gemstones

(define-data-var last-stone-id uint u0)

(define-map stones
  { stone-id: uint }
  {
    name: (string-utf8 100),
    weight: uint,
    color: (string-utf8 50),
    clarity: (string-utf8 50),
    cut: (string-utf8 50),
    origin: (string-utf8 100),
    owner: principal,
    registered-at: uint
  }
)

(define-public (register-stone
    (name (string-utf8 100))
    (weight uint)
    (color (string-utf8 50))
    (clarity (string-utf8 50))
    (cut (string-utf8 50))
    (origin (string-utf8 100))
  )
  (let
    (
      (stone-id (+ (var-get last-stone-id) u1))
    )
    (var-set last-stone-id stone-id)
    (map-set stones
      { stone-id: stone-id }
      {
        name: name,
        weight: weight,
        color: color,
        clarity: clarity,
        cut: cut,
        origin: origin,
        owner: tx-sender,
        registered-at: block-height
      }
    )
    (ok stone-id)
  )
)

(define-read-only (get-stone (stone-id uint))
  (map-get? stones { stone-id: stone-id })
)

(define-read-only (get-last-stone-id)
  (var-get last-stone-id)
)
