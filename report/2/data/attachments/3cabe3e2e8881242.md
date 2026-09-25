# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/functional/booking-retrieve.spec.ts >> retrieve bookings — GET /booking & GET /booking/:id >> [TC-018]: rejects a malformed date filter instead of silently matching
- Location: tests/api/functional/booking-retrieve.spec.ts:212:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  122 |             expect(response.status()).toBe(200);
  123 |             const body: { bookingid: number }[] = await response.json();
  124 |             expect(body.map((b) => b.bookingid)).toContain(bookingId);
  125 |         });
  126 | 
  127 |         test('[TC-014]: matches names case-sensitively', async ({
  128 |             bookingClient,
  129 |         }) => {
  130 |             const upperResponse = await bookingClient.getAll({
  131 |                 params: {
  132 |                     firstname: DEFAULT_BOOKING_DATA.firstname.toUpperCase(),
  133 |                 },
  134 |             });
  135 |             const lowerResponse = await bookingClient.getAll({
  136 |                 params: {
  137 |                     firstname: DEFAULT_BOOKING_DATA.firstname.toLowerCase(),
  138 |                 },
  139 |             });
  140 | 
  141 |             expect(upperResponse.status()).toBe(200);
  142 |             expect(lowerResponse.status()).toBe(200);
  143 | 
  144 |             const upperBody: { bookingid: number }[] =
  145 |                 await upperResponse.json();
  146 |             const lowerBody: { bookingid: number }[] =
  147 |                 await lowerResponse.json();
  148 | 
  149 |             expect(upperBody.map((b) => b.bookingid)).not.toContain(bookingId);
  150 |             expect(lowerBody.map((b) => b.bookingid)).not.toContain(bookingId);
  151 |         });
  152 | 
  153 |         test('[TC-015]: gets a single booking by id', async ({
  154 |             bookingClient,
  155 |         }) => {
  156 |             const response = await bookingClient.getById(bookingId);
  157 | 
  158 |             expect(response.status()).toBe(200);
  159 |             const body: Booking = await response.json();
  160 | 
  161 |             expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
  162 |             expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
  163 |         });
  164 | 
  165 |         test(
  166 |             '[TC-016]: returns Content-Type: application/xml for an XML response',
  167 |             { tag: '@issues' },
  168 |             async ({ bookingClient }) => {
  169 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-008)');
  170 | 
  171 |                 const response = await bookingClient.getById(bookingId, {
  172 |                     headers: { Accept: 'application/xml' },
  173 |                 });
  174 | 
  175 |                 expect(response.headers()['content-type']).toContain(
  176 |                     'application/xml'
  177 |                 );
  178 |             }
  179 |         );
  180 | 
  181 |         test('[TC-016]: honors Accept: application/xml for a single booking', async ({
  182 |             bookingClient,
  183 |         }) => {
  184 |             const response = await bookingClient.getById(bookingId, {
  185 |                 headers: { Accept: 'application/xml' },
  186 |             });
  187 | 
  188 |             expect(response.status()).toBe(200);
  189 | 
  190 |             const body = await response.text();
  191 |             expect(body).toContain(
  192 |                 `<firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>`
  193 |             );
  194 |         });
  195 | 
  196 |         test('[TC-017]: returns 404 for a booking id that does not exist', async ({
  197 |             bookingClient,
  198 |         }) => {
  199 |             const response = await bookingClient.getById(999999);
  200 | 
  201 |             expect(response.status()).toBe(404);
  202 |         });
  203 | 
  204 |         test('[TC-017]: returns 404 for a non-numeric booking id', async ({
  205 |             bookingClient,
  206 |         }) => {
  207 |             const response = await bookingClient.getById('abc');
  208 | 
  209 |             expect(response.status()).toBe(404);
  210 |         });
  211 | 
  212 |         test(
  213 |             '[TC-018]: rejects a malformed date filter instead of silently matching',
  214 |             { tag: '@issues' },
  215 |             async ({ bookingClient }) => {
  216 |                 test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-011)');
  217 | 
  218 |                 const response = await bookingClient.getAll({
  219 |                     params: { checkin: '08-25-2026' },
  220 |                 });
  221 | 
> 222 |                 expect(response.status()).toBe(400);
      |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  223 |             }
  224 |         );
  225 |     }
  226 | );
  227 | 
```