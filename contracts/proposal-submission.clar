;; Proposal Submission Contract
;; This contract manages the creation and lifecycle of proposals

(define-data-var admin principal tx-sender)
(define-data-var proposal-count uint u0)

;; Proposal data structure
(define-map proposals
  uint
  {
    title: (string-utf8 256),
    description: (string-utf8 1024),
    creator: principal,
    start-block: uint,
    end-block: uint,
    is-active: bool
  }
)

;; Get proposal details
(define-read-only (get-proposal (id uint))
  (map-get? proposals id)
)

;; Check if a proposal is active
(define-read-only (is-proposal-active (id uint))
  (let (
    (proposal (unwrap-panic (map-get? proposals id)))
    (current-block block-height)
  )
    (and
      (get is-active proposal)
      (>= current-block (get start-block proposal))
      (<= current-block (get end-block proposal))
    )
  )
)

;; Create a new proposal
(define-public (create-proposal
    (title (string-utf8 256))
    (description (string-utf8 1024))
    (start-block uint)
    (end-block uint)
  )
  (let (
    (proposal-id (var-get proposal-count))
    (new-count (+ proposal-id u1))
  )
    (asserts! (>= start-block block-height) (err u200))
    (asserts! (> end-block start-block) (err u201))

    (map-set proposals proposal-id {
      title: title,
      description: description,
      creator: tx-sender,
      start-block: start-block,
      end-block: end-block,
      is-active: true
    })

    (var-set proposal-count new-count)
    (ok proposal-id)
  )
)

;; Close a proposal early (admin or creator only)
(define-public (close-proposal (id uint))
  (let (
    (proposal (unwrap-panic (map-get? proposals id)))
  )
    (asserts! (or
      (is-eq tx-sender (get creator proposal))
      (is-eq tx-sender (var-get admin))
    ) (err u202))

    (map-set proposals id (merge proposal { is-active: false }))
    (ok true)
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
