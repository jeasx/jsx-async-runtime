import { Layout } from "../layout.js";

// A settings form with validation errors: labeled inputs, a select with 200 countries,
// checkbox and radio groups, and many boolean and ARIA attributes.

const countries = Array.from({ length: 200 }, (_, i) => ({
  value: `C${String(i).padStart(3, "0")}`,
  label: `Country ${i}`,
}));

const topics = ["Orders", "Shipping", "Newsletter", "Security", "Product updates", "Surveys"];

const values = {
  name: "Erika Mustermann",
  email: "erika@example",
  website: "https://example.com/?ref=<me>",
  bio: 'I like "quotes" & <tags>.',
  street: "Heidestraße 17",
  zip: "51147",
  city: "Köln",
  country: "C042",
  topics: new Set(["Orders", "Security"]),
  theme: "dark",
};

const errors = { email: "Please enter a valid email address." };

function describedBy(id, hint, error) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || null;
}

function Field({ id, label, required = false, hint = undefined, error = undefined, children }) {
  return (
    <div class={["field", { "has-error": !!error }]}>
      <label for={id}>
        {label}
        {required && (
          <span class="required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} class="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} class="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({ name, label, required = false, hint = undefined, ...rest }) {
  const id = `field-${name}`;
  const error = errors[name];
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        name={name}
        type="text"
        value={values[name]}
        required={required}
        aria-invalid={error ? "true" : null}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

function SelectField({ name, label, options }) {
  const id = `field-${name}`;
  return (
    <Field id={id} label={label}>
      <select id={id} name={name}>
        {options.map((option) => (
          <option value={option.value} selected={option.value === values[name]}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Choice({ type, name, value, label, checked }) {
  const id = `field-${name}-${value.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div class="choice">
      <input id={id} type={type} name={name} value={value} checked={checked} />
      <label for={id}>{label}</label>
    </div>
  );
}

export function SettingsForm() {
  return (
    <Layout title="Settings">
      <h1>Settings</h1>
      <form method="post" action="/settings" novalidate>
        <input type="hidden" name="csrf" value="3f2a9c1e-7b4d-4e8a-9f61-2c5d8e0b7a14" />
        <fieldset>
          <legend>Profile</legend>
          <TextField name="name" label="Name" required autocomplete="name" />
          <TextField name="email" label="Email" type="email" required autocomplete="email" />
          <TextField name="website" label="Website" type="url" hint="Shown on your profile." />
          <Field id="field-bio" label="Bio" hint="Up to 500 characters.">
            <textarea id="field-bio" name="bio" rows={4} maxlength={500}>
              {values.bio}
            </textarea>
          </Field>
        </fieldset>
        <fieldset>
          <legend>Address</legend>
          <TextField name="street" label="Street" autocomplete="street-address" />
          <TextField name="zip" label="ZIP code" inputmode="numeric" pattern="[0-9]{5}" />
          <TextField name="city" label="City" autocomplete="address-level2" />
          <SelectField name="country" label="Country" options={countries} />
        </fieldset>
        <fieldset>
          <legend>Email notifications</legend>
          {topics.map((topic) => (
            <Choice
              type="checkbox"
              name="topics"
              value={topic}
              label={topic}
              checked={values.topics.has(topic)}
            />
          ))}
        </fieldset>
        <fieldset>
          <legend>Theme</legend>
          {["light", "dark", "system"].map((theme) => (
            <Choice
              type="radio"
              name="theme"
              value={theme}
              label={theme[0].toUpperCase() + theme.slice(1)}
              checked={theme === values.theme}
            />
          ))}
        </fieldset>
        <div class="actions">
          <button type="submit" class="btn btn-primary">
            Save
          </button>
          <button type="reset" class="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </Layout>
  );
}
