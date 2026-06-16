// POC proof: under zod 4, the rewritten output inference (map-the-shape) makes
// Stored/Denormalized resolve to the CONCRETE attribute fields, not the #4619
// `{}` collapse. Each @ts-expect-error below is load-bearing: if inference had
// collapsed to `{}` (or `any`), the "missing required field" error would NOT
// occur and tsc would flag the directive as unused — so a clean compile of THIS
// file is itself the proof the fields are inferred.
import { z, createSchema, Stored, Denormalized } from 'agrajag';

const player = createSchema(
  'players',
  z.object({
    givenName: z.string(),
    birthYear: z.number(),
    preferredName: z.string().optional(),
  }),
);

type StoredPlayer = Stored<typeof player>;
type DenormPlayer = Denormalized<typeof player>;

// required fields present, optional omitted -> OK
const a: StoredPlayer = { id: 'x', givenName: 'Ada', birthYear: 2014 };
// optional field accepted
const b: DenormPlayer = { id: 'x', givenName: 'Ada', birthYear: 2014, preferredName: 'A' };

// required string field is really typed (number rejected)
// @ts-expect-error givenName must be a string
const c: StoredPlayer = { id: 'x', givenName: 123, birthYear: 2014 };

// required field really required (proves it's not {})
// @ts-expect-error birthYear is required
const d: DenormPlayer = { id: 'x', givenName: 'Ada' };

// unknown field rejected (proves the shape is closed to the inferred keys)
// @ts-expect-error nope is not an attribute
const e: StoredPlayer = { id: 'x', givenName: 'Ada', birthYear: 2014, nope: true };

void a;
void b;
void c;
void d;
void e;
