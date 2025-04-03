;; Voter Verification Contract
;; This contract manages voter eligibility within the community

(define-data-var admin principal tx-sender)

;; Map to track eligible voters
(define-map eligible-voters principal bool)

;; Check if a user is an eligible voter
(define-read-only (is-eligible (user principal))
  (default-to false (map-get? eligible-voters user))
)

;; Add a voter to the eligible list (admin only)
(define-public (add-voter (voter principal))
  (begin
    (asserts! (is-admin tx-sender) (err u100))
    (ok (map-set eligible-voters voter true))
  )
)

;; Remove a voter from eligible list (admin only)
(define-public (remove-voter (voter principal))
  (begin
    (asserts! (is-admin tx-sender) (err u100))
    (ok (map-delete eligible-voters voter))
  )
)

;; Check if caller is admin
(define-read-only (is-admin (caller principal))
  (is-eq caller (var-get admin))
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (ok (var-set admin new-admin))
  )
)
