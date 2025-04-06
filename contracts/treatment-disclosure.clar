;; Treatment Disclosure Contract
;; Documents any enhancements or modifications

(define-map treatments
  { stone-id: uint, treatment-id: uint }
  {
    treatment-type: (string-utf8 100),
    description: (string-utf8 500),
    performed-by: (string-utf8 100),
    performed-at: uint,
    disclosed-by: principal,
    disclosed-at: uint
  }
)

(define-map stone-treatments
  { stone-id: uint }
  { treatment-count: uint }
)

(define-public (disclose-treatment
    (stone-id uint)
    (treatment-type (string-utf8 100))
    (description (string-utf8 500))
    (performed-by (string-utf8 100))
    (performed-at uint)
  )
  (let
    (
      (treatment-count (default-to u0 (get treatment-count (map-get? stone-treatments { stone-id: stone-id }))))
      (new-treatment-id (+ treatment-count u1))
    )
    (map-set stone-treatments { stone-id: stone-id } { treatment-count: new-treatment-id })
    (map-set treatments
      { stone-id: stone-id, treatment-id: new-treatment-id }
      {
        treatment-type: treatment-type,
        description: description,
        performed-by: performed-by,
        performed-at: performed-at,
        disclosed-by: tx-sender,
        disclosed-at: block-height
      }
    )
    (ok new-treatment-id)
  )
)

(define-read-only (get-treatment (stone-id uint) (treatment-id uint))
  (map-get? treatments { stone-id: stone-id, treatment-id: treatment-id })
)

(define-read-only (get-treatment-count (stone-id uint))
  (default-to u0 (get treatment-count (map-get? stone-treatments { stone-id: stone-id })))
)
