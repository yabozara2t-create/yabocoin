;; YaboBit Fungible Token (YB)
;; Simple fungible token with mint/burn, balances, transfer and metadata.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Constants
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-constant TOKEN-NAME "YaboBit Token")
(define-constant TOKEN-SYMBOL "YB")
(define-constant TOKEN-DECIMALS u6)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Storage
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var total-supply uint u0)
(define-data-var admin (optional principal) none)
(define-map balances { account: principal } { balance: uint })

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-name) TOKEN-NAME)
(define-read-only (get-symbol) TOKEN-SYMBOL)
(define-read-only (get-decimals) TOKEN-DECIMALS)
(define-read-only (get-total-supply) (var-get total-supply))

(define-read-only (get-balance (who principal))
  (default-to u0 (get balance (map-get? balances { account: who }))))

(define-read-only (get-admin)
  (var-get admin))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Private helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-private (set-balance (who principal) (new uint))
  (begin
    (map-set balances { account: who } { balance: new })
    true))

(define-private (debit (who principal) (amount uint))
  (let (
        (bal (default-to u0 (get balance (map-get? balances { account: who }))))
       )
    (if (>= bal amount)
        (ok (set-balance who (- bal amount)))
        (err u100)))) ;; insufficient-balance

(define-private (credit (who principal) (amount uint))
  (let (
        (bal (default-to u0 (get balance (map-get? balances { account: who }))))
       )
    (set-balance who (+ bal amount))))

;; Ensure an admin is set. If none is set, the first caller becomes admin.
(define-private (ensure-admin)
  (match (var-get admin) admin-principal
    (if (is-eq tx-sender admin-principal) (ok true) (err u120))
    (begin
      (var-set admin (some tx-sender))
      (ok true))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Public entrypoints
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u103))          ;; not-authorized
    (asserts! (> amount u0) (err u104))                      ;; invalid-amount
    (asserts! (not (is-eq sender recipient)) (err u105))     ;; invalid-recipient
    (try! (debit sender amount))
    (credit recipient amount)
    (ok true)))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u104))
    (try! (ensure-admin))
    (credit recipient amount)
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)))

(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u103))
    (asserts! (> amount u0) (err u104))
    (try! (debit sender amount))
    (var-set total-supply (- (var-get total-supply) amount))
    (ok true)))
