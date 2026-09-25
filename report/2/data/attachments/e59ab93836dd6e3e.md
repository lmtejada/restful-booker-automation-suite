# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/functional/booking-create.spec.ts >> create booking — POST /booking >> [TC-008]: returns a 500 for a completely empty body instead of a 400
- Location: tests/api/functional/booking-create.spec.ts:157:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
```

# Test source

```ts
  65  | 
  66  |         test('[TC-006]: creates a booking from an XML payload', async ({
  67  |             bookingClient,
  68  |         }) => {
  69  |             const xmlPayload = `
  70  |                 <booking>
  71  |                     <firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>
  72  |                     <lastname>${DEFAULT_BOOKING_DATA.lastname}</lastname>
  73  |                     <totalprice>${DEFAULT_BOOKING_DATA.totalprice}</totalprice>
  74  |                     <depositpaid>${DEFAULT_BOOKING_DATA.depositpaid}</depositpaid>
  75  |                     <bookingdates>
  76  |                         <checkin>${DEFAULT_BOOKING_DATA.bookingdates.checkin}</checkin>
  77  |                         <checkout>${DEFAULT_BOOKING_DATA.bookingdates.checkout}</checkout>
  78  |                     </bookingdates>
  79  |                 </booking>`;
  80  | 
  81  |             const response = await bookingClient.createWithOptions({
  82  |                 headers: {
  83  |                     'Content-Type': 'text/xml',
  84  |                     Accept: 'application/xml',
  85  |                 },
  86  |                 data: xmlPayload,
  87  |             });
  88  | 
  89  |             expect(response.status()).toBe(200);
  90  | 
  91  |             const body = await response.text();
  92  |             expect(body).toContain('<created-booking>');
  93  |             expect(body).toContain(
  94  |                 `<firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>`
  95  |             );
  96  |         });
  97  | 
  98  |         test(
  99  |             '[TC-008]: accepts an illogical date range where checkin is after checkout',
  100 |             { tag: '@issues' },
  101 |             async ({ bookingClient }) => {
  102 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-005)');
  103 | 
  104 |                 const response = await bookingClient.create(
  105 |                     generateBookingData({
  106 |                         bookingdates: {
  107 |                             checkin: '2026-05-10',
  108 |                             checkout: '2026-05-01',
  109 |                         },
  110 |                     })
  111 |                 );
  112 | 
  113 |                 expect(response.status()).toBe(400);
  114 |             }
  115 |         );
  116 | 
  117 |         test(
  118 |             '[TC-009]: returns a 500 for an unsupported Content-Type instead of a 4xx',
  119 |             { tag: '@issues' },
  120 |             async ({ bookingClient }) => {
  121 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-006)');
  122 | 
  123 |                 const response = await bookingClient.createWithOptions({
  124 |                     headers: { 'Content-Type': 'application/yaml' },
  125 |                     data: 'firstname: Jim',
  126 |                 });
  127 | 
  128 |                 expect(response.status()).toBe(415);
  129 |             }
  130 |         );
  131 | 
  132 |         test(
  133 |             '[TC-009]: returns a 500 for a text/plain Content-Type instead of a 4xx',
  134 |             { tag: '@issues' },
  135 |             async ({ bookingClient }) => {
  136 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-006)');
  137 | 
  138 |                 const response = await bookingClient.createWithOptions({
  139 |                     headers: { 'Content-Type': 'text/plain' },
  140 |                     data: JSON.stringify(DEFAULT_BOOKING_DATA),
  141 |                 });
  142 | 
  143 |                 expect(response.status()).toBe(415);
  144 |             }
  145 |         );
  146 | 
  147 |         test('[TC-008]: rejects syntactically malformed JSON with a 400', async ({
  148 |             bookingClient,
  149 |         }) => {
  150 |             const response = await bookingClient.createWithOptions({
  151 |                 data: '{"firstname": "Jim", "lastname": "Brown"',
  152 |             });
  153 | 
  154 |             expect(response.status()).toBe(400);
  155 |         });
  156 | 
  157 |         test(
  158 |             '[TC-008]: returns a 500 for a completely empty body instead of a 400',
  159 |             { tag: '@issues' },
  160 |             async ({ bookingClient }) => {
  161 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-001)');
  162 | 
  163 |                 const response = await bookingClient.createWithOptions();
  164 | 
> 165 |                 expect(response.status()).toBe(400);
      |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  166 |             }
  167 |         );
  168 | 
  169 |         test('[TC-008]: ignores unexpected extra fields in the payload', async ({
  170 |             bookingClient,
  171 |         }) => {
  172 |             const response = await bookingClient.createWithOptions({
  173 |                 data: generateBookingData({ isAdmin: true }),
  174 |             });
  175 | 
  176 |             expect(response.status()).toBe(200);
  177 |             const body = await response.json();
  178 |             expect(body.booking).not.toHaveProperty('isAdmin');
  179 |         });
  180 | 
  181 |         test('[TC-031]: stores injection-style inputs instead of erroring', async ({
  182 |             bookingClient,
  183 |         }) => {
  184 |             for (const scenario of MALICIOUS_PAYLOADS) {
  185 |                 const payload = generateBookingData(scenario);
  186 |                 const response = await bookingClient.createWithOptions({
  187 |                     data: payload,
  188 |                 });
  189 | 
  190 |                 expect(response.status()).toBe(200);
  191 |                 const body = await response.json();
  192 | 
  193 |                 expect(body.booking.firstname).toBe(payload.firstname);
  194 |                 expect(body.booking.lastname).toBe(payload.lastname);
  195 |                 expect(body.booking.additionalneeds).toBe(
  196 |                     payload.additionalneeds
  197 |                 );
  198 |             }
  199 |         });
  200 |     }
  201 | );
  202 | 
```