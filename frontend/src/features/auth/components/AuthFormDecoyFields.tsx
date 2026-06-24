/** Hidden fields that absorb browser autofill so real inputs stay empty. */
export function AuthFormDecoyFields() {
  return (
    <>
      <input
        type="text"
        name="username"
        autoComplete="username"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
    </>
  )
}
