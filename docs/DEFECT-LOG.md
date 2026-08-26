# Defect Log — Restful Booker API Suite

**Type:** Functional <br>
**Priority:** 🔴 High | 🟡 Medium | 🟢 Low <br>
**Automated:** Yes / No <br>
**Status:** 🔴 Open | 🟡 In Progress | 🔵 Fixed | ✅ Closed | ⚪ Won't Fix <br>

---

## Functional & general defects

| ID      | Title                                                            | Severity  | Steps to reproduce                                                                                                                                                                                                                                                                                         | Linked TC                                                                                                                                                                               | Status  |
| ------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| BUG-001 | Missing/null required booking fields cause a `500`, not a `400`  | 🔴 High   | `POST /booking` with any of `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`, `bookingdates.checkin`, or `bookingdates.checkout` omitted or `null` → API returns `500 Internal Server Error` with a plain-text body (no JSON, no error detail) instead of a `400` validation response. | `booking-validation.spec.ts` › Missing firstname / Null lastname value / Missing totalprice / Missing depositpaid / Missing bookingdates / Missing checkin date / Missing checkout date | 🔴 Open |
| BUG-002 | Required name fields accept empty strings                        | 🟡 Medium | `POST /booking` with `firstname: ""` and `lastname: ""` → `200 OK`, booking is created with blank names instead of the request being rejected.                                                                                                                                                             | `booking-validation.spec.ts` › Empty string for firstname and lastname                                                                                                                  | 🔴 Open |
| BUG-003 | Invalid booking dates are silently corrupted instead of rejected | 🟡 Medium | `POST /booking` with `bookingdates.checkin` or `bookingdates.checkout` set to a non-date string (e.g. `"invalid-date"`) → `200 OK`, and the stored/returned value is corrupted to the literal string `"0NaN-aN-aN"` instead of the request being rejected.                                                 | `booking-validation.spec.ts` › Invalid date format for checkin / Invalid date format for checkout                                                                                       | 🔴 Open |

_Not logged as defects: `additionalneeds` accepting `null`, an empty string, or special characters. That field is optional and free-text by design, so permissive handling there is correct behavior, not a flaw — covered by the same spec's remaining scenarios for regression coverage, not because anything is broken._

---
