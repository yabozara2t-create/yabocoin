;; title: YaboCoin (YABO)
;; version: 1.0.0
;; summary: A SIP-010 compliant fungible token for YaboCoin
;; description: YaboCoin is a fungible token built on Stacks blockchain following SIP-010 standard

;; traits
;; SIP-010 trait implementation (commented out for local development)
;; (impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; token definitions
(define-fungible-token yabocoin)

;; constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant TOKEN-NAME "YaboCoin")
(define-constant TOKEN-SYMBOL "YABO")
(define-constant TOKEN-DECIMALS u6)
(define-constant TOKEN-MAX-SUPPLY u1000000000000) ;; 1 million YABO with 6 decimals

;; data vars
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var contract-owner principal CONTRACT-OWNER)

;; data maps

;; public functions

;; SIP-010 Functions

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender from) (is-eq contract-caller from)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-transfer? yabocoin amount from to)
  )
)

(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= (+ (ft-get-supply yabocoin) amount) TOKEN-MAX-SUPPLY) ERR-INSUFFICIENT-BALANCE)
    (ft-mint? yabocoin amount to)
  )
)

(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (or (is-eq tx-sender from) (is-eq tx-sender (var-get contract-owner))) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-burn? yabocoin amount from)
  )
)

(define-public (set-token-uri (value (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (var-set token-uri value)
    (ok (print {notification: "token-metadata-update", payload: {token-class: "ft", contract-id: (as-contract tx-sender)}}))
  )
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

;; read only functions

(define-read-only (get-name)
  (ok TOKEN-NAME)
)

(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL)
)

(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance yabocoin who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply yabocoin))
)

(define-read-only (get-max-supply)
  (ok TOKEN-MAX-SUPPLY)
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

;; private functions

;; Initialize contract with initial mint to deployer
(begin
  (try! (ft-mint? yabocoin u100000000000 CONTRACT-OWNER)) ;; Mint 100,000 YABO to contract owner
)
