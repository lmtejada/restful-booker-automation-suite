import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// reports all validation failures at once rather than stopping at the first failure.
const ajv = new Ajv({ allErrors: true });

// Enables ISO date format validation ('date', 'date-time', etc.)
addFormats(ajv);

// Compiles a JSON Schema into a reusable ajv validate function for T.
export function compileSchema<T>(
    schema: JSONSchemaType<T>
): ValidateFunction<T> {
    return ajv.compile(schema);
}

// Turns a failed validate() call's errors into a readable message for expect()'s assertion output.
export function formatSchemaErrors<T>(validate: ValidateFunction<T>): string {
    return ajv.errorsText(validate.errors, { separator: '\n' });
}
