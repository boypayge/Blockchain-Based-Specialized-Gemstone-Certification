;; Laboratory Verification Contract
;; Validates testing and grading results

(define-map verifications
  { stone-id: uint }
  {
    lab-name: (string-utf8 100),
    verified-by: principal,
    grade: (string-utf8 50),
    report-number: (string-utf8 100),
    verified-at: uint,
    notes: (string-utf8 500)
  }
)

(define-map authorized-labs
  { lab-principal: principal }
  { authorized: bool }
)

(define-data-var contract-owner principal tx-sender)

(define-public (authorize-lab (lab-principal principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
    (ok (map-set authorized-labs { lab-principal: lab-principal } { authorized: true }))
  )
)

(define-public (revoke-lab (lab-principal principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
    (ok (map-set authorized-labs { lab-principal: lab-principal } { authorized: false }))
  )
)

(define-public (verify-stone
    (stone-id uint)
    (lab-name (string-utf8 100))
    (grade (string-utf8 50))
    (report-number (string-utf8 100))
    (notes (string-utf8 500))
  )
  (begin
    (asserts! (is-authorized tx-sender) (err u401))
    (ok (map-set verifications
      { stone-id: stone-id }
      {
        lab-name: lab-name,
        verified-by: tx-sender,
        grade: grade,
        report-number: report-number,
        verified-at: block-height,
        notes: notes
      }
    ))
  )
)

(define-read-only (get-verification (stone-id uint))
  (map-get? verifications { stone-id: stone-id })
)

(define-read-only (is-authorized (lab-principal principal))
  (default-to false (get authorized (map-get? authorized-labs { lab-principal: lab-principal })))
)
